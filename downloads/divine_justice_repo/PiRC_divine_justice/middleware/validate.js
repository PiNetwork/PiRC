export function validate(req, res, next) {
  if (!req.body) {
    return res.status(400).json({ error: "Invalid input" });
  }
  next();
}
