import Joi from "joi";

// LOGIN VALIDATION
export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Invalid email format",
    "any.required": "Email is required"
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters",
    "any.required": "Password is required"
  })
});

// REGISTER VALIDATION
export const registerSchema = Joi.object({
  name: Joi.string().min(2).required().messages({         // ✅ was missing
    "string.min": "Name must be at least 2 characters",
    "any.required": "Name is required"
  }),
  companyName: Joi.string().min(2).optional().messages({ // ✅ changed to optional
    "string.min": "Company name must be at least 2 characters",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Invalid email format",
    "any.required": "Email is required"
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters",
    "any.required": "Password is required"
  }),
  services: Joi.array().items(Joi.string()).optional()    // ✅ was missing
});