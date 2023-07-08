const AlbumsHandler = require('./handler');
const AlbumsRoutes = require('./routes');

module.exports = {
  name: 'albums',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const albumsHandler = new AlbumsHandler(service, validator);
    server.route(AlbumsRoutes(albumsHandler));
  },
};
