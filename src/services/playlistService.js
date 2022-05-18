const { nanoid } = require('nanoid');
const { Pool } = require('pg');

const InvariantError = require('../exception/InvariantError');
const AuthorizationError = require('../exception/AuthorizationError');
const NotFoundError = require('../exception/NotFoundError');

class PlaylistService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };
    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  async getPlaylistByUser(userId) {
    const query = {
      text: 'SELECT playlist.id, playlist.name, users.username FROM playlist INNER JOIN users ON playlist.owner = users.id LEFT JOIN collaboration ON collaboration.playlist_id = playlist.id WHERE playlist.owner= $1 OR collaboration.user_id = $1',
      values: [userId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async getPlaylistByID(Id) {
    const query = {
      text: 'SELECT playlist.id, playlist.name, users.username FROM playlist INNER JOIN users ON playlist.owner = users.id LEFT JOIN collaboration ON collaboration.playlist_id = playlist.id WHERE playlist.id = $1',
      values: [Id],
    };

    const result = await this._pool.query(query);
    return result.rows[0];
  }

  async deletePlaylistById(playlistId) {
    const query = {
      text: 'DELETE FROM playlist WHERE id = $1',
      values: [playlistId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Playlist gagal dihapus, Id tidak ditemukan');
    }
  }

  async verifyPlaylistOwner(playlistId, userId) {
    const query = {
      text: 'SELECT owner FROM playlist WHERE id = $1',
      values: [playlistId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Playlist yang anda cari tidak ada');
    }
    const playlist = result.rows[0];
    if (playlist.owner !== userId) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    const query = {
      text: 'SELECT playlist.id FROM playlist INNER JOIN users ON playlist.owner = users.id LEFT JOIN collaboration ON collaboration.playlist_id = playlist.id WHERE (playlist.owner = $2 OR collaboration.user_id = $2) AND playlist.id =$1',
      values: [playlistId, userId],
    };
    const result = await this._pool.query(query);
    if (!result.rows[0]) {
      throw new AuthorizationError('Anda bukan Kolaborator playlist ini');
    }
  }

  async verifyPlaylistIsExist(playlistId) {
    const query = {
      text: 'SELECT id FROM playlist WHERE id = $1',
      values: [playlistId],
    };
    const result = await this._pool.query(query);
    if (result.rowCount === 0) {
      throw new NotFoundError('Playlist yang dicari tidak ditemukan');
    }
  }
}

module.exports = PlaylistService;
