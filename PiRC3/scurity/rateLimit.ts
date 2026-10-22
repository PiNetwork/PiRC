import {
  Request,
  Response,
  NextFunction,
} from "express";

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 100;

const clients = new Map<
  string,
  { count: number; resetAt: number }
>();

export function rateLimit(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Untuk deployment, gunakan identiti klien yang dipercayai
  // dan penyimpanan bersama seperti Redis.
  const key = req.ip ?? "unknown";
  const now = Date.now();

  let entry = clients.get(key);

  if (!entry || entry.resetAt <= now) {
    entry = {
      count: 0,
      resetAt: now + WINDOW_MS,
    };

    clients.set(key, entry);
  }

  entry.count += 1;

  if (entry.count > MAX_REQUESTS) {
    res.setHeader(
      "Retry-After",
      Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
    );

    return res.status(429).json({
      error: "RATE_LIMITED",
      message: "Terlalu banyak permintaan.",
    });
  }

  next();
}
