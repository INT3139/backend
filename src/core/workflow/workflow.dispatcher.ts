import type { WorkflowInstance } from './engine'
import { ID } from '@/types'

type ApprovalHandler = (instance: WorkflowInstance, actorId: ID, tx?: any) => Promise<void>
type RejectionHandler = (instance: WorkflowInstance, actorId: ID, tx?: any) => Promise<void>
type RevisionHandler = (instance: WorkflowInstance, actorId: ID, tx?: any) => Promise<void>

const approvalHandlers = new Map<string, ApprovalHandler>()
const rejectionHandlers = new Map<string, RejectionHandler>()
const revisionHandlers = new Map<string, RevisionHandler>()

export function registerWorkflowHandler(
    resourceType: string,
    onApprove: ApprovalHandler,
    onReject?: RejectionHandler,
    onRevision?: RevisionHandler
) {
    approvalHandlers.set(resourceType, onApprove)
    if (onReject) rejectionHandlers.set(resourceType, onReject)
    if (onRevision) revisionHandlers.set(resourceType, onRevision)
}

export async function dispatchWorkflowResult(
    instance: WorkflowInstance, 
    actorId: ID, 
    tx?: any,
    action?: string
): Promise<void> {
    if (instance.status === 'approved') {
        await approvalHandlers.get(instance.resourceType)?.(instance, actorId, tx)
    } else if (instance.status === 'rejected') {
        await rejectionHandlers.get(instance.resourceType)?.(instance, actorId, tx)
    } else if (action === 'request_revision') {
        await revisionHandlers.get(instance.resourceType)?.(instance, actorId, tx)
    }
}
