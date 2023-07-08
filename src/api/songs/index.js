const SongsHandler = require('./handler');
const SongsRoutes = require('./routes');

module.exports = {
  name: 'songs',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const songsHandler = new SongsHandler(service, validator);
    server.route(SongsRoutes(songsHandler));
  },
};
