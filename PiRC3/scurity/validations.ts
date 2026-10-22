import { z } from "zod";

export const balanceSchema = z.object({
  amount: z
    .string()
    .regex(/^(0|[1-9]\d*)(\.\d+)?$/)
    .max(80),
  decimals: z.number().int().min(0).max(30),
  step: z
    .string()
    .regex(/^[1-9]\d*$/)
    .max(80),
  mode: z.enum(["floor", "ceil", "nearest"]),
}).strict();

export type BalanceRequest = z.infer<typeof balanceSchema>;
