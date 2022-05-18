const Joi = require('joi');
const InvariantError = require('../../exception/InvariantError');
const UploadError = require('../../exception/UploadError');

const ImageHeadersSchema = Joi.object({
  'content-type': Joi.string().valid('image/apng', 'image/avif', 'image/gif', 'image/jpeg', 'image/png', 'image/webp').required(),
}).unknown();

const UploadsValidator = {
  validateImageHeaders: (headers) => {
    const validationResult = ImageHeadersSchema.validate(headers);

    if (validationResult.error) {
      console.log(validationResult.error.message);
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = UploadsValidator;
