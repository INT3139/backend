import { WorkflowInstance } from './engine'
import { ID } from '@/types'

type ApprovalHandler = (instance: WorkflowInstance, actorId: ID) => Promise<void>
type RejectionHandler = (instance: WorkflowInstance, actorId: ID) => Promise<void>

const approvalHandlers = new Map<string, ApprovalHandler>()
const rejectionHandlers = new Map<string, RejectionHandler>()

export function registerWorkflowHandler(
    resourceType: string,
    onApprove: ApprovalHandler,
    onReject?: RejectionHandler
) {
    approvalHandlers.set(resourceType, onApprove)
    if (onReject) rejectionHandlers.set(resourceType, onReject)
}

export async function dispatchWorkflowResult(instance: WorkflowInstance, actorId: ID): Promise<void> {
    if (instance.status === 'approved') {
        await approvalHandlers.get(instance.resourceType)?.(instance, actorId)
    } else if (instance.status === 'rejected') {
        await rejectionHandlers.get(instance.resourceType)?.(instance, actorId)
    }
}
