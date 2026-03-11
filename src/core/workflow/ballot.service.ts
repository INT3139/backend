import { query, queryOne } from '@/configs/db'
import { UUID, BallotData } from '@/types'
import { ConflictError } from '@/core/middlewares/errorHandler'

export class BallotService {
  async submitVote(instanceId: UUID, step: number, actorId: UUID, vote: 'approve'|'reject'|'abstain', comment?: string): Promise<void> {
    if (await this.hasVoted(instanceId, step, actorId)) throw new ConflictError('Already voted')
    const tally = await this.tally(instanceId, step)
    const updated = { ...tally, [vote]: tally[vote] + 1, total: tally.total + 1 }
    updated.pct = updated.total > 0 ? updated.approve / updated.total : 0
    await query(`INSERT INTO wf_step_logs (instance_id,step_number,step_name,actor_id,action,comment,ballot_data) VALUES ($1,$2,'Ballot',$3,'ballot_submit',$4,$5::jsonb)`,
      [instanceId, step, actorId, comment ?? null, JSON.stringify(updated)])
  }

  async tally(instanceId: UUID, step: number): Promise<BallotData> {
    const rows = await query<{ ballot_data: BallotData }>(
      `SELECT ballot_data FROM wf_step_logs WHERE instance_id=$1 AND step_number=$2 AND action='ballot_submit' AND ballot_data IS NOT NULL ORDER BY acted_at DESC LIMIT 1`,
      [instanceId, step]
    )
    return rows[0]?.ballot_data ?? { total: 0, approve: 0, reject: 0, abstain: 0, pct: 0, passed: false }
  }

  async hasVoted(instanceId: UUID, step: number, actorId: UUID): Promise<boolean> {
    const r = await queryOne<{ count: string }>(`SELECT COUNT(*) as count FROM wf_step_logs WHERE instance_id=$1 AND step_number=$2 AND actor_id=$3 AND action='ballot_submit'`, [instanceId, step, actorId])
    return parseInt(r?.count ?? '0') > 0
  }

  async closeBallot(instanceId: UUID, step: number, actorId: UUID, minPct = 0.7): Promise<BallotData> {
    const tally = await this.tally(instanceId, step)
    const final = { ...tally, passed: tally.pct >= minPct }
    await query(`INSERT INTO wf_step_logs (instance_id,step_number,step_name,actor_id,action,ballot_data) VALUES ($1,$2,'Ballot Closed',$3,'ballot_submit',$4::jsonb)`, [instanceId, step, actorId, JSON.stringify(final)])
    return final
  }
}

export const ballotService = new BallotService()
