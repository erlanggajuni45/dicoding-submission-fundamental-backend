class PlaylistsHandler {
  constructor(playlistsService, songsService, validator) {
    this._playlistsService = playlistsService;
    this._songsService = songsService;
    this._validator = validator;
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);
    const { name } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    const playlistId = await this._playlistsService.addPlaylist({ name, owner: credentialId });

    const response = h.response({
      status: 'success',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }
}

// postPlaylistHandler(request, h),
// getPlaylistHandler(request, h),
// deletePlaylistHandler(request, h),
// postPlaylistSongHandler(request, h),
// getPlaylistSongHandler(request, h),
// deletePlaylistSongHandler(request, h),

module.exports = PlaylistsHandler;
