import { celebrate, Joi, Segments } from 'celebrate';

export const getAnnouncementsValidator = celebrate({
  [Segments.QUERY]: Joi.object({
    search: Joi.string().allow('').optional(),
    sort: Joi.string().valid('newest', 'oldest').optional(),
    page: Joi.number().integer().min(1).optional(),
  }),
});

export const getByIdValidator = celebrate({
  [Segments.PARAMS]: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
});

export const createAnnouncementValidator = celebrate({
  [Segments.BODY]: Joi.object({
    title: Joi.string().min(5).max(100).required(),
    description: Joi.string().min(10).required(),
    price: Joi.number().greater(0).required(),
    category: Joi.string().valid('sale', 'service', 'job', 'other').required(),
    contactInfo: Joi.string().min(5).required(),
  }).required(),
});

export const updateAnnouncementValidator = celebrate({
  [Segments.PARAMS]: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
  [Segments.BODY]: Joi.object({
    title: Joi.string().min(5).max(100),
    description: Joi.string().min(10),
    price: Joi.number().greater(0),
    category: Joi.string().valid('sale', 'service', 'job', 'other'),
    contactInfo: Joi.string().min(5),
  })
    .min(1)
    .required(),
});

export const deleteAnnouncementValidator = getByIdValidator;
