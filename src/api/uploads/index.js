const UploadsHandler = require('./handler');
const route = require('./route');

module.exports = {
  name: 'uploads',
  version: '1.0.0',
  register: async (server, { service, validator, albumService2 }) => {
    const uploadsHandler = new UploadsHandler(service, validator, albumService2);
    server.route(route(uploadsHandler));
  },
};
