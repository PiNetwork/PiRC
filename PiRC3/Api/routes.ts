import { Router } from "express";
import { balanceSchema } from "../security/validation";
import { TransactionService } from "../services/transactionService";
import { rateLimit } from "../security/rateLimit";

export function createRoutes(service: TransactionService) {
  const router = Router();

  router.get("/health", (_req, res) => {
    res.json({
      service: "PiRC3 Core",
      status: "ok",
    });
  });

  router.post("/balance/round", rateLimit, async (req, res) => {
    const parsed = balanceSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "INVALID_INPUT",
        message: "Data permintaan tidak sah.",
      });
    }

    try {
      const result = await service.calculateRoundedBalance({
        accountId: "demo-account",
        ...parsed.data,
      });

      return res.status(200).json(result);
    } catch {
      return res.status(400).json({
        error: "PROCESSING_ERROR",
        message: "Baki tidak dapat diproses.",
      });
    }
  });

  return router;
}
