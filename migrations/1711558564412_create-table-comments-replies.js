/* eslint-disable camelcase */
exports.up = (pgm) => {
  pgm.createTable('comments_replies', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true
    },
    comment_id: {
      type: 'VARCHAR(50)',
      notNull: true
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true
    },
    content: {
      type: 'TEXT',
      notNull: true
    },
    date: {
      type: 'TIMESTAMP',
      notNull: true,
      default: pgm.func('current_timestamp')
    },
    is_deleted: {
      type: 'BOOLEAN',
      notNull: true,
      default: false
    }
  })
  pgm.addConstraint('comments_replies', 'fk_comments_replies.comment_id_threads_comments.id', 'FOREIGN KEY(comment_id) REFERENCES threads_comments(id) ON DELETE CASCADE')
  pgm.addConstraint('comments_replies', 'fk_comments_replies.owner_users.id', 'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE')
}

exports.down = (pgm) => {
  pgm.dropTable('comments_replies')
}
