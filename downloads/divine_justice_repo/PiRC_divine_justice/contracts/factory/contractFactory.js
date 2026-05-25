export function generateInheritanceContract(distribution) {
  return { type: "Inheritance", payload: distribution, timestamp: Date.now() };
}
