const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../exception/InvariantError');
const NotFoundError = require('../exception/NotFoundError');
const { mapDBToModelAlbum, mapOptSong } = require('../util');

class AlbumService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum({ name, year }) {
    const id = nanoid(16);

    const query = {
      text: 'INSERT INTO album VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Data Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const query = {
      text: `SELECT album.id, album.name, album.year, album.cover AS "coverUrl", song.id as song_id, song.year as song_year, song.performer FROM album
      LEFT JOIN song ON song.album_id = album.id WHERE album.id = $1`,
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Data Album tidak ditemukan');
    }

    if (result.rows[0].song_id != null) {
      const songs = result.rows.map(mapOptSong);

      const mappedResult = result.rows.map(mapDBToModelAlbum)[0];
      return { ...mappedResult, songs };
    }
    const songs = [];
    const mappedResult = result.rows.map(mapDBToModelAlbum)[0];
    return { ...mappedResult, songs };
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE album SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui Data album. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM album WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
  }

  async updateAlbumCover(albumId, cover) {
    const query = {
      text: 'UPDATE album SET cover = $2 WHERE id = $1 RETURNING id',
      values: [albumId, cover],
    };

    const result = await this._pool.query(query);

    if (result.rowCount <= 0) {
      throw new NotFoundError('Album tidak ditemukan');
    }
  }

  async processAlbumLike(userId, albumId) {
    const query = {
      text: 'SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (result.rowCount <= 0) {
      const id = `album_likes-${nanoid(16)}`;
      const queryAdd = {
        text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
        values: [id, userId, albumId],
      };

      const resultAdd = await this._pool.query(queryAdd);

      if (!resultAdd.rows.length) {
        throw new InvariantError('Likes gagal ditambahkan');
      }

      return true;
    }
    const queryDel = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId],
    };

    const resultDel = await this._pool.query(queryDel);

    if (!resultDel.rows.length) {
      throw new InvariantError('Likes gagal dihapus');
    }

    return false;
  }

  async getAlbumLike(id) {
    const query = {
      text: 'SELECT COUNT(*) as likes FROM user_album_likes WHERE album_id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (result.rowCount <= 0) {
      throw new NotFoundError('Likes pada album tidak ditemukan');
    }

    console.log(result.rows);
    return parseInt(result.rows[0].likes, 10);
  }
}
module.exports = AlbumService;
