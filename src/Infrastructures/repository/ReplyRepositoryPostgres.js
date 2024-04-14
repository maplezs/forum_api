const AddedReply = require('../../Domains/replies/entitites/AddedReply')
const NotFoundError = require('../../Commons/exceptions/NotFoundError')
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError')
const ReplyRepository = require('../../Domains/replies/ReplyRepository')

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor (pool, idGenerator) {
    super()
    this._pool = pool
    this._idGenerator = idGenerator
  }

  async addReply (addComment, commentId, owner) {
    const { content } = addComment
    const id = `reply-${this._idGenerator()}`
    const query = {
      text: 'INSERT INTO comments_replies VALUES($1, $2, $3, $4) RETURNING id, content, owner',
      values: [id, commentId, owner, content]
    }
    const result = await this._pool.query(query)
    return new AddedReply({ ...result.rows[0] })
  }

  async getRepliesByCommentId (commentId) {
    const query = {
      text: 'SELECT replies.id, users.username, replies.date, replies.content, replies.comment_id AS "commentId", replies.is_deleted AS "isDeleted" FROM comments_replies AS replies LEFT JOIN users ON replies.owner = users.id WHERE replies.comment_id = ANY($1) ORDER BY replies.date',
      values: [commentId]
    }

    const result = await this._pool.query(query)
    if (!result.rowCount) return []
    return result.rows
  }

  async deleteReplyById (id) {
    const query = {
      text: 'UPDATE comments_replies SET is_deleted = TRUE WHERE id = $1  RETURNING id',
      values: [id]
    }
    const result = await this._pool.query(query)
    return { ...result.rows[0].id }
  }

  async verifyReplyAccess (id, owner) {
    const query = {
      text: 'SELECT * FROM comments_replies WHERE id = $1',
      values: [id]
    }
    const result = await this._pool.query(query)
    const reply = result.rows[0]
    if (reply.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini')
    }
  }

  async verifyReplyAvailability (id, commentId) {
    const query = {
      text: 'SELECT * FROM comments_replies WHERE id = $1 AND comment_id = $2',
      values: [id, commentId]
    }

    const result = await this._pool.query(query)
    if (!result.rowCount) {
      throw new NotFoundError('Balasan tidak ditemukan')
    }
  }
}

module.exports = ReplyRepositoryPostgres
