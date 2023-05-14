export interface EventContext {
  trigger: ExecutionType,
  time?: string,
  referenceNumber?: string
}

export enum ExecutionType {
  SCHEDULED,
  EVENT,
  MANUAL
}