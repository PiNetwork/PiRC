export function calculateIslamicFull(data) {
  const { estate, heirs } = data;
  let remaining = estate;
  let result = [];

  const hasSon = heirs.some(h => h.type === "son");

  const wife = heirs.find(h => h.type === "wife");
  if (wife) {
    let share = hasSon ? estate * (1/8) : estate * (1/4);
    result.push({ ...wife, share });
    remaining -= share;
  }

  const mother = heirs.find(h => h.type === "mother");
  if (mother) {
    let share = estate * (1/6);
    result.push({ ...mother, share });
    remaining -= share;
  }

  const father = heirs.find(h => h.type === "father");
  if (father) {
    result.push({ ...father, share: remaining });
    remaining = 0;
  }

  const children = heirs.filter(h => h.type === "son" || h.type === "daughter");
  if (children.length > 0) {
    let totalWeight = children.reduce((sum, c) => sum + (c.type === "son" ? 2 : 1), 0);
    children.forEach(c => {
      let weight = c.type === "son" ? 2 : 1;
      let share = (remaining * weight) / totalWeight;
      result.push({ ...c, share });
    });
    remaining = 0;
  }

  if (hasSon) {
    result = result.filter(h => !["brother", "uncle"].includes(h.type));
  }
  return result;
}
