const Joi = require('joi');

const reportSchema = Joi.object({
  reportedName: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'El nombre es requerido',
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder 100 caracteres'
    }),
  
  reportedLastName: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'El apellido es requerido',
      'string.min': 'El apellido debe tener al menos 2 caracteres',
      'string.max': 'El apellido no puede exceder 100 caracteres'
    }),
  
  department: Joi.string()
    .trim()
    .required()
    .messages({
      'string.empty': 'El departamento es requerido'
    }),
  
  district: Joi.string()
    .trim()
    .required()
    .messages({
      'string.empty': 'El distrito es requerido'
    }),
  
  age: Joi.number()
    .integer()
    .min(18)
    .max(120)
    .required()
    .messages({
      'number.base': 'La edad debe ser un número',
      'number.min': 'La edad mínima es 18 años',
      'number.max': 'La edad máxima es 120 años'
    }),
  
  occupation: Joi.string()
    .trim()
    .max(200)
    .required()
    .messages({
      'string.empty': 'La ocupación es requerida',
      'string.max': 'La ocupación no puede exceder 200 caracteres'
    }),
  
  evidence: Joi.array()
    .items(Joi.string())
    .max(10)
    .optional(),
  
  region: Joi.string()
    .trim()
    .optional(),
  
  city: Joi.string()
    .trim()
    .optional(),
  
  additionalInfo: Joi.string()
    .trim()
    .max(2000)
    .optional(),
  
  deviceFingerprint: Joi.string()
    .required()
    .messages({
      'string.empty': 'Device fingerprint es requerido'
    })
});

exports.validateReport = (data) => {
  return reportSchema.validate(data, { abortEarly: false });
};
