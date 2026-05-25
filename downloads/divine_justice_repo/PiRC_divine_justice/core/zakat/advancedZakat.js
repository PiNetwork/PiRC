export function calculateAdvancedZakat(data) {
  const { cash, gold, investments, debts } = data;
  let total = cash + gold + investments - debts;
  if (total <= 0) return 0;
  return total * 0.025;
}
