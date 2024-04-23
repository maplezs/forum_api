/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool')

const LikeTableTestHelper = {
  async likeComment ({
    id = 'like-12345',
    commentId = 'comment-12345',
    owner = 'user-12345'
  }) {
    const query = {
      text: 'INSERT INTO comments_likes VALUES($1, $2, $3)',
      values: [id, commentId, owner]
    }

    await pool.query(query)
  },

  async findLikeById (id) {
    const query = {
      text: 'SELECT * FROM comments_likes WHERE id = $1',
      values: [id]
    }

    const result = await pool.query(query)
    return result.rows
  },

  async cleanTable () {
    await pool.query('DELETE FROM comments_likes WHERE 1=1')
  }
}

module.exports = LikeTableTestHelper
