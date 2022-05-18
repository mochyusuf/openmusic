/* eslint-disable camelcase */

exports.shorthands = undefined;
exports.up = (pgm) => {
  pgm.createTable('song', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    title: {
      type: 'VARCHAR(250)',
    },
    year: {
      type: 'INT',
    },
    performer: {
      type: 'VARCHAR(250)',
    },
    genre: {
      type: 'VARCHAR(250)',
    },
    duration: {
      type: 'INT',
    },
    album_id: {
      type: 'VARCHAR(50)',
    },
  });
  pgm.addConstraint('song', 'album', 'FOREIGN KEY ( album_id ) REFERENCES album ( id )');
};

exports.down = (pgm) => {
  pgm.dropConstraint('song', 'album', 'FOREIGN KEY ( album_id ) REFERENCES album ( id )');
  pgm.dropTable('song');
};
