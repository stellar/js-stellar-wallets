export enum ApprovalResponseStatus {
  success = "success",
  revised = "revised",
  pending = "pending",
  actionRequired = "action_required",
  rejected = "rejected",
}

export enum ActionResult {
  noFurtherActionRequired = "no_further_action_required",
  followNextUrl = "follow_next_url",
}
