const Joi = require('joi');

const currentYear = new Date().getFullYear();

const AlbumsPayloadSchema = Joi.object({
  name: Joi.string().max(100).required(),
  year: Joi.number().integer().min(1990).max(currentYear)
    .required(),
});

module.exports = { AlbumsPayloadSchema };
