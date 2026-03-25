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
  companyName: Joi.string().min(2).required().messages({
    "string.min": "Company name must be at least 2 characters",
    "any.required": "Company name is required"
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Invalid email format",
    "any.required": "Email is required"
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters",
    "any.required": "Password is required"
  })
});