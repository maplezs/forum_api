const AddedComment = require('../../Domains/comments/entitites/AddedComment')
const NotFoundError = require('../../Commons/exceptions/NotFoundError')
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError')
const CommentRepository = require('../../Domains/comments/CommentRepository')

class CommentRepositoryPostgres extends CommentRepository {
  constructor (pool, idGenerator) {
    super()
    this._pool = pool
    this._idGenerator = idGenerator
  }

  async addComment (addComment, threadId, owner) {
    const { content } = addComment
    const id = `comment-${this._idGenerator()}`
    const query = {
      text: 'INSERT INTO threads_comments VALUES($1, $2, $3, $4) RETURNING id, content, owner',
      values: [id, threadId, owner, content]
    }
    const result = await this._pool.query(query)
    return new AddedComment({ ...result.rows[0] })
  }

  async getCommentsByThreadId (threadId) {
    const query = {
      text: 'SELECT comments.id, users.username, comments.date, comments.content, comments.is_deleted AS "isDeleted" FROM threads_comments AS comments LEFT JOIN users ON comments.owner = users.id WHERE comments.thread_id = $1 GROUP BY comments.id, users.username ORDER BY comments.date',
      values: [threadId]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('thread id tidak ditemukan')
    }
    return result.rows
  }

  async deleteCommentById (id) {
    const query = {
      text: 'UPDATE threads_comments SET is_deleted = TRUE WHERE id = $1 RETURNING id',
      values: [id]
    }
    const result = await this._pool.query(query)
    return { ...result.rows[0].id }
  }

  async verifyCommentAccess (id, owner) {
    const query = {
      text: 'SELECT * FROM threads_comments WHERE id = $1',
      values: [id]
    }
    const result = await this._pool.query(query)
    const comment = result.rows[0]
    if (comment.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini')
    }
  }

  async verifyCommentAvailability (id, threadId) {
    const query = {
      text: 'SELECT * FROM threads_comments WHERE id = $1 AND thread_id = $2',
      values: [id, threadId]
    }

    const result = await this._pool.query(query)
    if (!result.rowCount) {
      throw new NotFoundError('Komentar tidak ditemukan')
    }
  }
}

module.exports = CommentRepositoryPostgres
