exports.up = (pgm) => {
  pgm.createTable('user_album_likes', {
    id: {
      type: 'VARCHAR(250)',
      primaryKey: true,
    },
    user_id: {
      type: 'VARCHAR(250)',
      notNull: true,
    },
    album_id: {
      type: 'VARCHAR(250)',
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('user_album_likes');
};
