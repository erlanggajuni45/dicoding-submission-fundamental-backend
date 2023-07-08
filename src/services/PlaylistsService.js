const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const AuthorizationError = require('../exceptions/AuthorizationError');

class PlaylistsService {
  constructor(songsService, collaborationsService) {
    this._pool = new Pool();
    this._songsService = songsService;
    this._collaborationsService = collaborationsService;
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

  async getPlaylist(owner) {
    const query = {
      text: `SELECT a.id, a.name, b.username 
      FROM playlists a
      INNER JOIN users b ON a.owner = b.id
      LEFT JOIN collaborations c ON a.id = c.playlist_id
      WHERE a.owner = $1 OR c.user_id = $1`,
      values: [owner],
    };

    const { rows } = await this._pool.query(query);
    return rows;
  }

  async deletePlaylist(playlistId) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [playlistId],
    };

    const { rows } = await this._pool.query(query);
    if (!rows.length) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }
  }

  async addPlaylistSong(playlistId, songId) {
    const id = `playlistsong-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const { rows } = await this._pool.query(query);
    if (!rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan ke playlist');
    }
  }

  async getPlaylistSong(playlistId) {
    const queryPlaylist = {
      text: `
        SELECT a.id, a.name, b.username
        FROM playlists a 
        INNER JOIN users b ON a.owner = b.id
        WHERE a.id = $1
        `,
      values: [playlistId],
    };

    const { rows } = await this._pool.query(queryPlaylist);
    if (!rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const querySong = {
      text: `
      SELECT a.id, a.title, a.performer
      FROM songs a
      INNER JOIN playlist_songs b ON a.id = b.song_id
      WHERE b.playlist_id = $1
      `,
      values: [playlistId],
    };

    const songs = await this._pool.query(querySong);

    return { ...rows[0], songs: songs.rows };
  }

  async deletePlaylistSong(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const { rows } = await this._pool.query(query);
    if (!rows.length) {
      throw new NotFoundError('Gagal menghapus lagu dari playlist. Lagu tidak ditemukan');
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };

    const { rows } = await this._pool.query(query);
    if (!rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    if (rows[0].owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses playlist ini');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationsService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }

  async getPlaylistActivities(playlistId) {
    const query = {
      text: `
        SELECT a.username, b.title, c.action, c.time
        FROM playlist_activities c
        INNER JOIN users a ON c.user_id = a.id
        INNER JOIN songs b ON c.song_id = b.id
        WHERE c.playlist_id = $1
        ORDER BY c.time`,
      values: [playlistId],
    };
    const { rows } = await this._pool.query(query);
    return rows;
  }

  async addPlaylistActivities({
    playlistId, songId, userId, action,
  }) {
    const id = `activity-${nanoid(16)}`;
    const date = new Date();

    const query = {
      text: 'INSERT INTO playlist_activities VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, songId, userId, action, date],
    };

    const { rows } = await this._pool.query(query);
    if (!rows.length) {
      throw new InvariantError('Gagal menambahkan aktifitas playlist');
    }
  }
}

module.exports = PlaylistsService;
