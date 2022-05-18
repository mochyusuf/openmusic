const ClientError = require('../../exception/ClientError');

class PlaylistHandler {
  constructor(playlistService, validator, songService, playlistSongService) {
    this._playlistService = playlistService;
    this._validator = validator;
    this._songService = songService;
    this._playlistSongService = playlistSongService;

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.getPlaylistByUserHandler = this.getPlaylistByUserHandler.bind(this);
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
    this.postSongToPlaylistHandler = this.postSongToPlaylistHandler.bind(this);
    this.getSongFromPlaylistHandler = this.getSongFromPlaylistHandler.bind(this);
    this.deleteSongFromPlaylistHandler = this.deleteSongFromPlaylistHandler.bind(this);
  }

  async postPlaylistHandler(request, h) {
    try {
      this._validator.validatePlaylistPayload(request.payload);
      const { name } = request.payload;
      const { id: owner } = request.auth.credentials;
      const playlistId = await this._playlistService.addPlaylist({ name, owner });

      return h.response({
        status: 'success',
        message: 'Playlist berhasil ditambahkan',
        data: {
          playlistId,
        },
      }).code(201);
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async getPlaylistByUserHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const playlists = await this._playlistService.getPlaylistByUser(userId);

    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistByIdHandler(request, h) {
    try {
      const { playlistId } = request.params;
      const { id: userId } = request.auth.credentials;
      await this._playlistService.verifyPlaylistOwner(playlistId, userId);
      await this._playlistSongService.deletePlaylist(playlistId);
      await this._playlistService.deletePlaylistById(playlistId);

      return {
        status: 'success',
        message: 'Playlists berhasil dihapus',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async postSongToPlaylistHandler(request, h) {
    try {
      this._validator.validateSongToPlaylistPayload(request.payload);

      const { id: userId } = request.auth.credentials;
      const { playlistId } = request.params;
      const { songId } = request.payload;

      await this._songService.verifySongIsExist(songId);
      await this._playlistService.verifyPlaylistIsExist(playlistId);
      await this._playlistService.verifyPlaylistAccess(playlistId, userId);
      await this._playlistSongService.addSongToPlaylist(playlistId, songId);

      return h.response({
        status: 'success',
        message: ' Lagu berhasil ditambahkan ke playlist',
      }).code(201);
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async getSongFromPlaylistHandler(request, h) {
    try {
      const { id: userId } = request.auth.credentials;
      const { playlistId } = request.params;

      await this._playlistService.verifyPlaylistIsExist(playlistId);
      await this._playlistService.verifyPlaylistAccess(playlistId, userId);

      const playlists = await this._playlistService.getPlaylistByID(playlistId);
      const songFromPlaylist = await this._playlistSongService.getSongFromPlaylist(playlistId);

      return {
        status: 'success',
        data: {
          playlist: {
            id: playlists.id,
            name: playlists.name,
            username: playlists.username,
            songs: songFromPlaylist,
          },
        },
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async deleteSongFromPlaylistHandler(request, h) {
    try {
      this._validator.validateSongToPlaylistPayload(request.payload);

      const { id: userId } = request.auth.credentials;
      const { playlistId } = request.params;
      const { songId } = request.payload;

      await this._playlistService.verifyPlaylistIsExist(playlistId);
      await this._playlistService.verifyPlaylistAccess(playlistId, userId);
      await this._playlistSongService.deleteSongFromPlaylist(playlistId, songId);

      return {
        status: 'success',
        message: 'Lagu berhasil dihapus dari playlist',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
}

module.exports = PlaylistHandler;
