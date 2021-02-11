import { ActionResult, ApprovalResponseStatus } from "../constants/sep8";

export interface ApprovalResponse {
  status: ApprovalResponseStatus;
}

export interface TransactionApproved {
  status: ApprovalResponseStatus.success;
  tx: string;
  message?: string;
}

export interface TransactionRevised {
  status: ApprovalResponseStatus.revised;
  tx: string;
  message: string;
}

export interface PendingApproval {
  status: ApprovalResponseStatus.pending;
  timeout: number;
  message?: string;
}

export interface ActionRequired {
  status: ApprovalResponseStatus.actionRequired;
  message: string;
  action_url: string;
  action_method?: string;
  action_fields?: string[];
}

export interface TransactionRejected {
  status: ApprovalResponseStatus.rejected;
  error: string;
}

export interface PostActionUrlRequest {
  action_url: string;
  field_value_map: { [key: string]: any };
}

export interface PostActionUrlResponse {
  result: ActionResult;
  next_url?: string;
  message?: string;
}
