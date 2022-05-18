const ExportsHandler = require('./handler');
const route = require('./route');

module.exports = {
  name: 'exports',
  version: '1.0.0',
  register: async (server, { service, validator, playlistService }) => {
    const exportsHandler = new ExportsHandler(service, validator, playlistService);
    server.route(route(exportsHandler));
  },
};
