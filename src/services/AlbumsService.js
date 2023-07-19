const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');

class AlbumsService {
  constructor(songsService) {
    this._pool = new Pool();
    this._songsService = songsService;
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const { rows } = await this._pool.query(query);
    if (!rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return rows[0].id;
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };

    const { rows } = await this._pool.query(query);
    if (!rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const { cover, ...albumObject } = rows[0];
    const coverUrl = cover === '' ? null : cover;

    const songs = await this._songsService.getSongsByAlbumId(id);

    return { ...albumObject, coverUrl, songs };
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };

    const { rows } = await this._pool.query(query);
    if (!rows.length) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const { rows } = await this._pool.query(query);
    if (!rows.length) {
      throw new NotFoundError('Gagal menghapus album. Id tidak ditemukan');
    }
  }

  async updateAlbumCover(coverUrl, id) {
    const query = {
      text: 'UPDATE albums SET cover = $1 WHERE id = $2 RETURNING id',
      values: [coverUrl, id],
    };

    const { rows } = await this._pool.query(query);
    if (!rows.length) {
      throw new NotFoundError('Gagal menambahkan cover album. Id tidak ditemukan');
    }
  }
}

module.exports = AlbumsService;
