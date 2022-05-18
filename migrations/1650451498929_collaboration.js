exports.up = (pgm) => {
  pgm.createTable('collaboration', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    playlist_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });
  pgm.addConstraint('collaboration', 'playlist_user', 'UNIQUE (playlist_id, user_id)');
  pgm.addConstraint('collaboration', 'playlist', 'FOREIGN KEY(playlist_id) REFERENCES playlist(id)');
  pgm.addConstraint('collaboration', 'user', 'FOREIGN KEY(user_id) REFERENCES users(id)');
};

exports.down = (pgm) => {
  pgm.dropTable('collaboration');
};
