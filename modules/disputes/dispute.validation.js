const Joi = require('joi');

const disputeSchema = Joi.object({
  reportId: Joi.string()
    .required()
    .messages({
      'string.empty': 'El ID del reporte es requerido'
    }),
  
  email: Joi.string()
    .email()
    .trim()
    .lowercase()
    .optional()
    .messages({
      'string.email': 'Email inválido'
    }),
  
  phone: Joi.string()
    .trim()
    .pattern(/^[0-9+\-\s()]+$/)
    .optional()
    .messages({
      'string.pattern.base': 'Teléfono inválido'
    }),
  
  counterEvidence: Joi.array()
    .items(Joi.string())
    .max(10)
    .optional(),
  
  statement: Joi.string()
    .trim()
    .min(50)
    .max(1000)
    .required()
    .messages({
      'string.empty': 'La declaración es requerida',
      'string.min': 'La declaración debe tener al menos 50 caracteres',
      'string.max': 'La declaración no puede exceder 1000 caracteres'
    })
});

exports.validateDispute = (data) => {
  return disputeSchema.validate(data, { abortEarly: false });
};
