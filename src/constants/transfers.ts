export enum TransferResponseType {
  ok = "ok",
  non_interactive_customer_info_needed = "non_interactive_customer_info_needed",
  interactive_customer_info_needed = "interactive_customer_info_needed",
  customer_info_status = "customer_info_status",
  error = "error",
}

export enum TransactionStatus {
  completed = "completed",
  pending_external = "pending_external",
  pending_anchor = "pending_anchor",
  pending_stellar = "pending_stellar",
  pending_trust = "pending_trust",
  pending_user = "pending_user",
  pending_user_transfer_start = "pending_user_transfer_start",
  incomplete = "incomplete",
  no_market = "no_market",
  too_small = "too_small",
  too_large = "too_large",
  error = "error",
}
