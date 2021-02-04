import { ApprovalResponseStatus } from "../constants/sep8";

export interface ApprovalResponse {
  status:
    | ApprovalResponseStatus.success
    | ApprovalResponseStatus.revised
    | ApprovalResponseStatus.pending
    | ApprovalResponseStatus.actionRequired
    | ApprovalResponseStatus.rejected;
}

export interface TransactionApproved extends ApprovalResponse {
  status: ApprovalResponseStatus.success;
  tx: string;
  message?: string;
}

export interface TransactionRevised extends ApprovalResponse {
  status: ApprovalResponseStatus.revised;
  tx: string;
  message: string;
}

export interface PendingApproval extends ApprovalResponse {
  status: ApprovalResponseStatus.pending;
  timeout: number;
  message?: string;
}

export interface ActionRequired extends ApprovalResponse {
  status: ApprovalResponseStatus.actionRequired;
  message: string;
  action_url: string;
  action_method?: string;
  action_fields?: string[];
}

export interface TransactionRejected extends ApprovalResponse {
  status: ApprovalResponseStatus.rejected;
  error: string;
}

export interface PostActionUrlResponse {
  result: string;
  next_url?: string;
  message?: string;
}
