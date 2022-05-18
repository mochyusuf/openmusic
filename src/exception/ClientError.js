class ClientError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.status = 'fail';
    this.name = 'ClientError';
  }
}

module.exports = ClientError;
