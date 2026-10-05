import { ZodError } from "zod";

/**
 * Route-level body validation for the Zod schemas in validators/.
 *
 * Returns 400 with the offending fields instead of letting a bad payload
 * reach a controller or the database. Field names are safe to return; no
 * values are echoed back.
 */
export const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error instanceof ZodError
      ? result.error.issues.map((i) => ({
          field: i.path.join(".") || "(body)",
          message: i.message,
        }))
      : [{ field: "(body)", message: "Invalid request body" }];
    return res.status(400).json({ message: "Validation failed", errors });
  }
  req.body = result.data;   // stripped of unknown keys
  next();
};
