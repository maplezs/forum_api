const LikeRepository = require('../../Domains/likes/LikeRepository')

class LikeRepositoryPostgres extends LikeRepository {
  constructor (pool, idGenerator) {
    super()
    this._pool = pool
    this._idGenerator = idGenerator
  }

  async likeComment (commentId, owner) {
    const id = `like-${this._idGenerator()}`
    const query = {
      text: 'INSERT INTO comments_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, commentId, owner]
    }
    const result = await this._pool.query(query)
    return result.rows[0].id
  }

  async dislikeComment (commentId, owner) {
    const query = {
      text: 'DELETE FROM comments_likes WHERE comment_id = $1 AND owner = $2 RETURNING id',
      values: [commentId, owner]
    }

    const result = await this._pool.query(query)
    return result.rows[0].id
  }

  async getLikesByCommentId (commentId) {
    const query = {
      text: 'SELECT COUNT(*) FROM comments_likes WHERE comment_id = $1',
      values: [commentId]
    }
    const result = await this._pool.query(query)
    const { count } = result.rows[0]
    return +count
  }

  async verifyLikeStatus (commentId, owner) {
    const query = {
      text: 'SELECT * FROM comments_likes WHERE comment_id = $1 AND owner = $2',
      values: [commentId, owner]
    }
    const result = await this._pool.query(query)
    return !!result.rowCount
  }
}

module.exports = LikeRepositoryPostgres
