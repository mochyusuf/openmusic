exports.up = (pgm) => {
  pgm.createTable('playlistsong', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    playlist_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    song_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });
  pgm.addConstraint('playlistsong', 'fk_playlistsong.playlist_id_playlist.id', 'FOREIGN KEY(playlist_id) REFERENCES playlist(id)');
  pgm.addConstraint('playlistsong', 'fk_playlistsong.song_id_song.id', 'FOREIGN KEY(song_id) REFERENCES song(id)');
};

exports.down = (pgm) => {
  pgm.dropTable('playlistsong');
};
