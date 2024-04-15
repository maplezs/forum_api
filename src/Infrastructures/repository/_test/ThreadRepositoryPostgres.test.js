const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper')
const ThreadTableTestHelper = require('../../../../tests/ThreadsTableTestHelper')
const NotFoundError = require('../../../Commons/exceptions/NotFoundError')
const AddThread = require('../../../Domains/threads/entities/AddThread')
const AddedThread = require('../../../Domains/threads/entities/AddedThread')
const pool = require('../../database/postgres/pool')
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres')

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable()
    await ThreadTableTestHelper.cleanTable()
  })

  afterAll(async () => {
    await pool.end()
  })

  describe('addThread function', () => {
    it('should persist add thread and return added thread correctly', async () => {
      // Arrange
      const addThread = new AddThread({
        title: 'new title',
        body: 'new body of thread'
      })
      const fakeIdGenerator = () => '12345'
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator)
      await UsersTableTestHelper.addUser({ id: 'user-12345', username: 'johndoe' })

      // Action & Assert
      await threadRepositoryPostgres.addThread(addThread, 'user-12345')
      const thread = await ThreadTableTestHelper.findThreadById('thread-12345')
      expect(thread).toHaveLength(1)
    })

    it('should return added thread correctly', async () => {
      // Arrange
      const addThread = new AddThread({
        title: 'new title',
        body: 'new body of thread'
      })
      const fakeIdGenerator = () => '12345'
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator)
      await UsersTableTestHelper.addUser({ id: 'user-12345', username: 'johndoe' })

      // Action & Assert
      const addedThread = await threadRepositoryPostgres.addThread(addThread, 'user-12345')
      // Assert
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-12345',
        title: 'new title',
        owner: 'user-12345'
      }))
    })
  })

  describe('getThread function', () => {
    it('should return thread when thread id is found', async () => {
      // Arrange
      const fakeIdGenerator = () => '12345'
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator)
      await UsersTableTestHelper.addUser({ id: 'user-12345', username: 'johndoe' })
      await ThreadTableTestHelper.addThread({})

      // Action & Assert
      const thread = await threadRepositoryPostgres.getThreadById('thread-12345')
      expect(thread.id).toBe('thread-12345')
      expect(thread.title).toBe('new title')
      expect(thread.body).toBe('new body of thread')
      expect(thread.date.getMinutes()).toBe(new Date().getMinutes())
      expect(thread.username).toBe('johndoe')
    })
  })

  describe('verifyThreadAvailability function', () => {
    it('should throw NotFoundError when thread is not found', () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {})

      // Action & Assert
      return expect(threadRepositoryPostgres.verifyThreadAvailability('thread-12345'))
        .rejects
        .toThrowError(NotFoundError)
    })
    it('should not throw any error when thread exist', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {})
      await UsersTableTestHelper.addUser({ id: 'user-12345', username: 'johndoe' })
      await ThreadTableTestHelper.addThread({})

      // Action & Assert
      return expect(threadRepositoryPostgres.verifyThreadAvailability('thread-12345'))
        .resolves.not.toThrowError()
    })
  })
})
