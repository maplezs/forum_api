const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper')
const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper')
const ThreadTableTestHelper = require('../../../../tests/ThreadsTableTestHelper')
const NotFoundError = require('../../../Commons/exceptions/NotFoundError')
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError')
const AddComment = require('../../../Domains/comments/entitites/AddComment')
const AddedComment = require('../../../Domains/comments/entitites/AddedComment')
const pool = require('../../database/postgres/pool')
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres')

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable()
    await ThreadTableTestHelper.cleanTable()
    await CommentTableTestHelper.cleanTable()
  })

  afterAll(async () => {
    await pool.end()
  })

  describe('addComment function', () => {
    it('should persist add comment and return added comment correctly', async () => {
      // Arrange
      const addComment = new AddComment({
        content: 'new comment'
      })
      const fakeIdGenerator = () => '12345'
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator)
      await UsersTableTestHelper.addUser({ id: 'user-12345', username: 'johndoe' })
      await UsersTableTestHelper.addUser({ id: 'user-12346', username: 'marydoe' })
      await ThreadTableTestHelper.addThread({})
      // Action & Assert
      await commentRepositoryPostgres.addComment(addComment, 'thread-12345', 'user-12345')
      const comment = await CommentTableTestHelper.findCommentById('comment-12345')
      expect(comment).toHaveLength(1)
    })

    it('should return added comment correctly', async () => {
      // Arrange
      const addComment = new AddComment({
        content: 'new comment'
      })
      const fakeIdGenerator = () => '12345'
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator)
      await UsersTableTestHelper.addUser({ id: 'user-12345', username: 'johndoe' })
      await ThreadTableTestHelper.addThread({})

      // Action & Assert
      const addedComment = await commentRepositoryPostgres.addComment(addComment, 'thread-12345', 'user-12345')
      // Assert
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-12345',
        content: 'new comment',
        owner: 'user-12345'
      }))
    })
  })

  describe('getCommentsByThreadId function', () => {
    it('should throw NotFoundError when thread not found', () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {})

      // Action & Assert
      return expect(commentRepositoryPostgres.getCommentsByThreadId('thread-12345'))
        .rejects
        .toThrowError(NotFoundError)
    })

    it('should return comments when thread id is found', async () => {
      // Arrange
      const fakeIdGenerator = () => '12345'
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator)
      await UsersTableTestHelper.addUser({ id: 'user-12345', username: 'johndoe' })
      await UsersTableTestHelper.addUser({ id: 'user-12346', username: 'marydoe' })
      await ThreadTableTestHelper.addThread({})
      await CommentTableTestHelper.addComment({ id: 'comment-12345', owner: 'user-12345' })
      await CommentTableTestHelper.addComment({ id: 'comment-12346', owner: 'user-12346' })

      // Action & Assert
      const comments = await commentRepositoryPostgres.getCommentsByThreadId('thread-12345')
      expect(comments[0].id).toStrictEqual('comment-12345')
      expect(comments[0].username).toStrictEqual('johndoe')
      expect(comments[0].date.getMinutes()).toStrictEqual(new Date().getMinutes())
      expect(comments[0].content).toStrictEqual('new comment')
      expect(comments[0].isDeleted).toStrictEqual(false)

      expect(comments[1].id).toStrictEqual('comment-12346')
      expect(comments[1].username).toStrictEqual('marydoe')
      expect(comments[1].date.getMinutes()).toStrictEqual(new Date().getMinutes())
      expect(comments[1].content).toStrictEqual('new comment')
      expect(comments[1].isDeleted).toStrictEqual(false)
    })
  })

  describe('deleteCommentById function', () => {
    it('should soft delete a comment', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-12345', username: 'johndoe' })
      await ThreadTableTestHelper.addThread({})
      await CommentTableTestHelper.addComment({ id: 'comment-12345', owner: 'user-12345' })

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {})

      await commentRepositoryPostgres.deleteCommentById('comment-12345')

      const comment = await CommentTableTestHelper.findCommentById('comment-12345')
      expect(comment[0].is_deleted).toEqual(true)
    })
  })

  describe('verifyCommentAccess function', () => {
    it('should throw AuthorizationError when user is not the owner', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {})
      await UsersTableTestHelper.addUser({ id: 'user-12345', username: 'johndoe' })
      await ThreadTableTestHelper.addThread({})
      await CommentTableTestHelper.addComment({ id: 'comment-12345', owner: 'user-12345' })

      // Action & Assert
      return expect(commentRepositoryPostgres.verifyCommentAccess('comment-12345', 'user-12346'))
        .rejects
        .toThrowError(AuthorizationError)
    })
    it('should not throw any error when reply exist and user is the owner', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {})

      await UsersTableTestHelper.addUser({ id: 'user-12345', username: 'johndoe' })
      await ThreadTableTestHelper.addThread({})
      await CommentTableTestHelper.addComment({ id: 'comment-12345', owner: 'user-12345' })

      // Action & Assert
      return expect(commentRepositoryPostgres.verifyCommentAccess('comment-12345', 'user-12345'))
        .resolves.not.toThrowError()
    })
  })

  describe('verifyCommentAvailability function', () => {
    it('should throw NotFoundError when comment is not found', () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {})

      // Action & Assert
      return expect(commentRepositoryPostgres.verifyCommentAvailability('comment-12345', 'thread-12345'))
        .rejects
        .toThrowError(NotFoundError)
    })
    it('should not throw any error when comment exist', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {})
      await UsersTableTestHelper.addUser({ id: 'user-12345', username: 'johndoe' })
      await ThreadTableTestHelper.addThread({})
      await CommentTableTestHelper.addComment({ id: 'comment-12345', owner: 'user-12345' })

      // Action & Assert
      return expect(commentRepositoryPostgres.verifyCommentAvailability('comment-12345', 'thread-12345'))
        .resolves.not.toThrowError()
    })
  })
})
