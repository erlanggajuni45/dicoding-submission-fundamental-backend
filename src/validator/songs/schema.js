const Joi = require('joi');

const SongsPayloadSchema = Joi.object({
  title: Joi.string().max(255).required(),
  year: Joi.number().required(),
  genre: Joi.string().max(255).required(),
  performer: Joi.string().required(),
  duration: Joi.number(),
  albumId: Joi.string(),
});

module.exports = { SongsPayloadSchema };
