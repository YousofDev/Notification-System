import sanitizeHtml from "xss";
import mongoSanitize from "mongo-sanitize";

/**
 * Sanitizes strings inside an object by applying:
 * - mongoSanitize to remove keys like "$gt"
 * - xss to strip out HTML/script injection
 */
export function sanitizeInput<T extends Record<string, any>>(input: T): T {
  const sanitized = mongoSanitize({ ...input });

  for (const key in sanitized) {
    if (typeof sanitized[key] === "string") {
      sanitized[key] = sanitizeHtml(sanitized[key]) as T[typeof key];
    }
  }

  return sanitized;
}
