import { db } from '@/configs/db'
import { wfStepLogs } from '@/db/schema/workflow'
import { eq, and, desc, count } from 'drizzle-orm'
import { ID, BallotData } from '@/types'
import { ConflictError } from '@/core/middlewares/errorHandler'

export class BallotService {
  async submitVote(instanceId: ID, step: number, actorId: ID, vote: 'approve'|'reject'|'abstain', comment?: string): Promise<void> {
    if (await this.hasVoted(instanceId, step, actorId)) throw new ConflictError('Already voted')
    const tally = await this.tally(instanceId, step)
    const updated = { ...tally, [vote]: tally[vote] + 1, total: tally.total + 1 }
    updated.pct = updated.total > 0 ? updated.approve / updated.total : 0
    
    await db.insert(wfStepLogs).values({
      instanceId: instanceId,
      stepNumber: step,
      stepName: 'Ballot',
      actorId: actorId,
      action: 'ballot_submit',
      comment: comment ?? null,
      ballotData: updated
    })
  }

  async tally(instanceId: ID, step: number): Promise<BallotData> {
    const rows = await db.select({ ballotData: wfStepLogs.ballotData })
      .from(wfStepLogs)
      .where(and(
        eq(wfStepLogs.instanceId, instanceId),
        eq(wfStepLogs.stepNumber, step),
        eq(wfStepLogs.action, 'ballot_submit')
      ))
      .orderBy(desc(wfStepLogs.actedAt))
      .limit(1)
      
    return (rows[0]?.ballotData as BallotData) ?? { total: 0, approve: 0, reject: 0, abstain: 0, pct: 0, passed: false }
  }

  async hasVoted(instanceId: ID, step: number, actorId: ID): Promise<boolean> {
    const [result] = await db.select({ value: count() })
      .from(wfStepLogs)
      .where(and(
        eq(wfStepLogs.instanceId, instanceId),
        eq(wfStepLogs.stepNumber, step),
        eq(wfStepLogs.actorId, actorId),
        eq(wfStepLogs.action, 'ballot_submit')
      ))
    return (result?.value ?? 0) > 0
  }

  async closeBallot(instanceId: ID, step: number, actorId: ID, minPct = 0.7): Promise<BallotData> {
    const tally = await this.tally(instanceId, step)
    const final = { ...tally, passed: tally.pct >= minPct }
    
    await db.insert(wfStepLogs).values({
      instanceId: instanceId,
      stepNumber: step,
      stepName: 'Ballot Closed',
      actorId: actorId,
      action: 'ballot_submit',
      ballotData: final
    })
    return final
  }
}

export const ballotService = new BallotService()
