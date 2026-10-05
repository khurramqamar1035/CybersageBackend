// Joi: validates req.body against a schema passed in by the route.
export const validateSchema = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        errors: error.details.map((detail) => detail.message),
      });
    }
    next();
  };