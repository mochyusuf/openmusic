const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../exception/InvariantError');

class PlaylistSongService {
  constructor() {
    this._pool = new Pool();
  }

  async addSongToPlaylist(playlistId, songId) {
    const id = `playSong-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlistsong VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Lagu gagal ditambahkan ke playlist');
    }
  }

  async getSongFromPlaylist(playlistId) {
    const query = {
      text: 'SELECT song.id, song.title,song.performer FROM playlist INNER JOIN playlistsong ON playlistsong.playlist_id = playlist.id INNER JOIN song ON song.id = playlistsong.song_id WHERE playlist.id = $1',
      values: [playlistId],
    };
    const result = await this._pool.query(query);
    if (!result.rows) {
      throw new InvariantError('Gagal Memuat lagu dari playlist');
    }
    return result.rows;
  }

  async deletePlaylist(playlistId) {
    const query = {
      text: 'DELETE FROM playlistsong WHERE playlist_id = $1 RETURNING id',
      values: [playlistId],
    };
    const result = await this._pool.query(query);
  }

  async deleteSongFromPlaylist(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlistsong WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Lagu gagal dihapus dari playlist, Id tidak ditemukan');
    }
  }
}
module.exports = PlaylistSongService;
