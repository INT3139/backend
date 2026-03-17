import { db } from '@/configs/db'
import { wfStepLogs } from '@/db/schema/workflow'
import { eq, and, count } from 'drizzle-orm'
import { ID, BallotData } from '@/types'
import { ConflictError } from '@/core/middlewares/errorHandler'

export class BallotService {
  /**
   * Submit 1 phiếu bầu của actorId cho bước ballot.
   *
   * Fix: lưu { vote } đơn giản thay vì cumulative tally để tránh
   * race condition khi 2 người vote đồng thời.
   * Tally thực tế được tính bằng aggregate trong tally().
   */
  async submitVote(
    instanceId: ID,
    step: number,
    actorId: ID,
    vote: 'approve' | 'reject' | 'abstain',
    comment?: string,
  ): Promise<void> {
    if (await this.hasVoted(instanceId, step, actorId)) {
      throw new ConflictError('Already voted')
    }

    await db.insert(wfStepLogs).values({
      instanceId,
      stepNumber: step,
      stepName: 'Ballot',
      actorId,
      action: 'ballot_submit',
      comment: comment ?? null,
      ballotData: { vote },   // chỉ lưu vote của actor này
    })
  }

  /**
   * Tính tổng kết phiếu bằng cách aggregate tất cả rows.
   *
   * Fix: phiên bản cũ dùng orderBy desc limit 1 (đọc row cuối) —
   * nếu 2 người vote đồng thời cùng đọc tally cũ rồi cùng insert
   * thì tally bị sai (lost update). Re-aggregate từ tất cả rows là
   * cách duy nhất đúng.
   */
  async tally(instanceId: ID, step: number): Promise<BallotData> {
    const rows = await db
      .select({ ballotData: wfStepLogs.ballotData })
      .from(wfStepLogs)
      .where(
        and(
          eq(wfStepLogs.instanceId, instanceId),
          eq(wfStepLogs.stepNumber, step),
          eq(wfStepLogs.action, 'ballot_submit'),
        ),
      )

    const result: BallotData = {
      total: 0,
      approve: 0,
      reject: 0,
      abstain: 0,
      pct: 0,
      passed: false,
    }

    for (const r of rows) {
      const d = r.ballotData as { vote?: string } | null
      if (!d?.vote) continue
      if (d.vote === 'approve' || d.vote === 'reject' || d.vote === 'abstain') {
        result[d.vote]++
      }
      result.total++
    }

    result.pct = result.total > 0 ? result.approve / result.total : 0
    return result
  }

  async hasVoted(instanceId: ID, step: number, actorId: ID): Promise<boolean> {
    const [res] = await db
      .select({ value: count() })
      .from(wfStepLogs)
      .where(
        and(
          eq(wfStepLogs.instanceId, instanceId),
          eq(wfStepLogs.stepNumber, step),
          eq(wfStepLogs.actorId, actorId),
          eq(wfStepLogs.action, 'ballot_submit'),
        ),
      )
    return (res?.value ?? 0) > 0
  }

  /**
   * Đóng ballot — tính kết quả cuối cùng và ghi log 'ballot_closed'.
   * Ghi thêm 1 row với action='forward' để engine advance được step.
   */
  async closeBallot(
    instanceId: ID,
    step: number,
    actorId: ID,
    minPct = 0.7,
  ): Promise<BallotData> {
    const tally = await this.tally(instanceId, step)
    const final: BallotData = { ...tally, passed: tally.pct >= minPct }

    await db.insert(wfStepLogs).values({
      instanceId,
      stepNumber: step,
      stepName: 'Ballot Closed',
      actorId,
      action: 'forward',      // dùng 'forward' để engine advance step
      comment: `Kết quả: ${final.approve}/${final.total} (${(final.pct * 100).toFixed(1)}%) — ${final.passed ? 'Đạt' : 'Không đạt'}`,
      ballotData: final,
    })

    return final
  }
}

export const ballotService = new BallotService()