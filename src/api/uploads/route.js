const path = require('path');

const route = (handler) => [
  {
    method: 'POST',
    path: '/albums/{id}/covers',
    handler: handler.postUploadImageHandler,
    options: {
      payload: {
        allow: 'multipart/form-data',
        maxBytes: 500 * 1024,
        multipart: true,
        output: 'stream',
      },
    },
  },
  {
    method: 'GET',
    path: '/file/{param*}',
    handler: {
      directory: {
        path: path.resolve(__dirname, 'file'),
      },
    },
  },
];

module.exports = route;
