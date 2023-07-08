const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');

class PlaylistsService {
  constructor(songsService) {
    this._pool = new Pool();
    this._songsService = songsService;
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists VALUES ($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const { rows } = await this._pool.query(query);

    if (!rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return rows[0].id;
  }

  async getPlaylist({ owner }) {
    const query = {
      text: `SELECT a.id, a.name, b.username 
      FROM playlists a 
      INNER JOIN users b
      ON a.owner = b.id
      WHERE a.owner = $1`,
      values: [owner],
    };

    const { rows } = await this._pool.query(query);
    if (!rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    return rows;
  }
}

module.exports = PlaylistsService;
