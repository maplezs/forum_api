/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool')

const CommentTableTestHelper = {
  async addComment ({
    id = 'comment-12345',
    threadId = 'thread-12345',
    owner = 'user-12345',
    content = 'new comment'
  }) {
    const query = {
      text: 'INSERT INTO threads_comments VALUES($1, $2, $3, $4)',
      values: [id, threadId, owner, content]
    }

    await pool.query(query)
  },

  async findCommentById (id) {
    const query = {
      text: 'SELECT * FROM threads_comments WHERE id = $1',
      values: [id]
    }

    const result = await pool.query(query)
    return result.rows
  },

  async cleanTable () {
    await pool.query('DELETE FROM threads_comments WHERE 1=1')
  }
}

module.exports = CommentTableTestHelper
