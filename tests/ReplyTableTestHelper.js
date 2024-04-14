/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool')

const ReplyTableTestHelper = {
  async addReply ({
    id = 'reply-12345',
    commentId = 'comment-12345',
    owner = 'user-12345',
    content = 'new reply'
  }) {
    const query = {
      text: 'INSERT INTO comments_replies VALUES($1, $2, $3, $4)',
      values: [id, commentId, owner, content]
    }

    await pool.query(query)
  },

  async findReplyById (id) {
    const query = {
      text: 'SELECT * FROM comments_replies WHERE id = $1',
      values: [id]
    }

    const result = await pool.query(query)
    return result.rows
  },

  async cleanTable () {
    await pool.query('DELETE FROM comments_replies WHERE 1=1')
  }
}

module.exports = ReplyTableTestHelper
