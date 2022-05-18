const ClientError = require('./ClientError');

class UploadError extends ClientError {
  constructor(message) {
    super(message);
    this.statusCode = 413;
    this.name = 'UploadError';
  }
}

module.exports = UploadError;
