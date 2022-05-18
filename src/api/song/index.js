const SongHandler = require('./handler');
const route = require('./route');

module.exports = {
  name: 'song',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const songHandler = new SongHandler(service, validator);
    server.route(route(songHandler));
  },
};
