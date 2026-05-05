export function createMinorVault(user) {
  return { owner: user, locked: true, unlockAge: 18, rewards: "active" };
}
