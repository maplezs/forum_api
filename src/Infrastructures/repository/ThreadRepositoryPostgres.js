const AddedThread = require('../../Domains/threads/entities/AddedThread')
const ThreadRepository = require('../../Domains/threads/ThreadRepository')
const NotFoundError = require('../../Commons/exceptions/NotFoundError')

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor (pool, idGenerator) {
    super()
    this._pool = pool
    this._idGenerator = idGenerator
  }

  async addThread (addThread, owner) {
    const { title, body } = addThread
    const id = `thread-${this._idGenerator()}`
    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4) RETURNING id, title, owner',
      values: [id, title, body, owner]
    }
    const result = await this._pool.query(query)
    return new AddedThread({ ...result.rows[0] })
  }

  async getThreadById (id) {
    const query = {
      text: 'SELECT threads.id, threads.title, threads.body, threads.date, users.username FROM threads LEFT JOIN users ON threads.owner = users.id WHERE threads.id = $1',
      values: [id]
    }
    const result = await this._pool.query(query)
    if (!result.rowCount) {
      throw new NotFoundError('thread id tidak ditemukan')
    }

    return { ...result.rows[0] }
  }
}

module.exports = ThreadRepositoryPostgres
