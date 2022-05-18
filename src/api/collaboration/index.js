const CollaborationHandler = require('./handler');
const routes = require('./route');

module.exports = {
  name: 'collaboration',
  version: '1.0.0',
  register: async (server, {
    collaborationService, playlistService, validator, usersService,
  }) => {
    const collaborationHandler = new CollaborationHandler(collaborationService, playlistService, validator, usersService);
    server.route(routes(collaborationHandler));
  },
};
