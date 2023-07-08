const PlaylistsHandler = require('./handler');
const playlistRoutes = require('./routes');

module.exports = {
  name: 'playlists',
  version: '1.0.0',
  register: async (server, { playlistsService, songsService, validator }) => {
    const playlistHandler = new PlaylistsHandler(playlistsService, songsService, validator);

    server.route(playlistRoutes(playlistHandler));
  },
};
