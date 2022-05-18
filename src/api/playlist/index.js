const PlaylistHandler = require('./handler');
const routes = require('./route');

module.exports = {
  name: 'Playlists',
  version: '1.0.0',
  register: async (server, {
    playlistService, validator, songService, playlistSongService,
  }) => {
    const playlistsHandler = new PlaylistHandler(playlistService, validator, songService, playlistSongService);
    server.route(routes(playlistsHandler));
  },
};
