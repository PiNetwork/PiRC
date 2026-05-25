export function recoverFunds(caseData) {
  return { action: "reverse", freezeDuration: "6 months", audit: true };
}
