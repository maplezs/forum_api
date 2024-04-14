const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper')
const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper')
const ThreadTableTestHelper = require('../../../../tests/ThreadsTableTestHelper')
const ReplyTableTestHelper = require('../../../../tests/ReplyTableTestHelper')
const NotFoundError = require('../../../Commons/exceptions/NotFoundError')
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError')
const AddReply = require('../../../Domains/replies/entitites/AddReply')
const AddedReply = require('../../../Domains/replies/entitites/AddedReply')
const pool = require('../../database/postgres/pool')
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres')

describe('ReplyRepositoryPostgres', () => {
  const fakeIdGenerator = () => '12345'
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable()
    await ThreadTableTestHelper.cleanTable()
    await CommentTableTestHelper.cleanTable()
    await ReplyTableTestHelper.cleanTable()
  })

  afterAll(async () => {
    await pool.end()
  })

  describe('addReply function', () => {
    beforeEach(async () => {
      await UsersTableTestHelper.addUser({ id: 'user-12345', username: 'johndoe' })
      await ThreadTableTestHelper.addThread({})
      await CommentTableTestHelper.addComment({ owner: 'user-12345' })
    })
    it('should persist add reply and return added reply correctly', async () => {
      // Arrange
      const addReply = new AddReply({
        content: 'new reply'
      })
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator)
      // Action & Assert
      await replyRepositoryPostgres.addReply(addReply, 'comment-12345', 'user-12345')
      const reply = await ReplyTableTestHelper.findReplyById('reply-12345')
      expect(reply).toHaveLength(1)
    })

    it('should return added comment correctly', async () => {
      // Arrange
      const addReply = new AddReply({
        content: 'new reply'
      })
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator)

      // Action & Assert
      const addedReply = await replyRepositoryPostgres.addReply(addReply, 'comment-12345', 'user-12345')
      // Assert
      expect(addedReply).toStrictEqual(new AddedReply({
        id: 'reply-12345',
        content: 'new reply',
        owner: 'user-12345'
      }))
    })
  })

  describe('getRepliesByCommentId function', () => {
    it('should return replies when comment id is found', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator)
      await UsersTableTestHelper.addUser({ id: 'user-12345', username: 'johndoe' })
      await UsersTableTestHelper.addUser({ id: 'user-12346', username: 'marydoe' })
      await ThreadTableTestHelper.addThread({})
      await CommentTableTestHelper.addComment({ id: 'comment-12345', owner: 'user-12345' })
      await ReplyTableTestHelper.addReply({ id: 'reply-12345', owner: 'user-12345' })
      await ReplyTableTestHelper.addReply({ id: 'reply-12346', owner: 'user-12346' })

      // Action & Assert
      const replies = await replyRepositoryPostgres.getRepliesByCommentId(['comment-12345'])
      expect(replies[0].id).toStrictEqual('reply-12345')
      expect(replies[0].username).toStrictEqual('johndoe')
      expect(replies[0].date.getMinutes()).toStrictEqual(new Date().getMinutes())
      expect(replies[0].content).toStrictEqual('new reply')

      expect(replies[1].id).toStrictEqual('reply-12346')
      expect(replies[1].username).toStrictEqual('marydoe')
      expect(replies[1].date.getMinutes()).toStrictEqual(new Date().getMinutes())
      expect(replies[1].content).toStrictEqual('new reply')
    })
    it('should return empty replies when no reply is found', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {})

      // Action
      const replies = await replyRepositoryPostgres.getRepliesByCommentId(['comment-12345'])

      // Assert
      expect(replies).toStrictEqual([])
    })
  })

  describe('deleteReplyById function', () => {
    it('should soft delete a reply', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-12345', username: 'johndoe' })
      await UsersTableTestHelper.addUser({ id: 'user-12346', username: 'marydoe' })
      await ThreadTableTestHelper.addThread({})
      await CommentTableTestHelper.addComment({ id: 'comment-12345', owner: 'user-12345' })
      await ReplyTableTestHelper.addReply({ id: 'reply-12345', owner: 'user-12346' })

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {})

      await replyRepositoryPostgres.deleteReplyById('reply-12345')

      const reply = await ReplyTableTestHelper.findReplyById('reply-12345')
      expect(reply[0].is_deleted).toEqual(true)
    })
  })

  describe('verifyReplyAccess function', () => {
    it('should throw AuthorizationError when user is not the owner', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {})
      await UsersTableTestHelper.addUser({ id: 'user-12345', username: 'johndoe' })
      await UsersTableTestHelper.addUser({ id: 'user-12346', username: 'marydoe' })
      await ThreadTableTestHelper.addThread({})
      await CommentTableTestHelper.addComment({ id: 'comment-12345', owner: 'user-12345' })
      await ReplyTableTestHelper.addReply({ id: 'reply-12345', owner: 'user-12346' })

      // Action & Assert
      return expect(replyRepositoryPostgres.verifyReplyAccess('reply-12345', 'user-12345'))
        .rejects
        .toThrowError(AuthorizationError)
    })
    it('should not throw any error when reply exist and user is the owner', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {})
      await UsersTableTestHelper.addUser({ id: 'user-12345', username: 'johndoe' })
      await ThreadTableTestHelper.addThread({})
      await CommentTableTestHelper.addComment({ id: 'comment-12345', owner: 'user-12345' })
      await ReplyTableTestHelper.addReply({ id: 'reply-12345', owner: 'user-12345' })

      // Action & Assert
      return expect(replyRepositoryPostgres.verifyReplyAccess('reply-12345', 'user-12345'))
        .resolves.not.toThrowError()
    })
  })

  describe('verifyReplyAvailability function', () => {
    it('should throw NotFoundError when reply is not found', () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {})

      // Action & Assert
      return expect(replyRepositoryPostgres.verifyReplyAvailability('comment-12345', 'reply-12345'))
        .rejects
        .toThrowError(NotFoundError)
    })
    it('should not throw any error when reply exist', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {})
      await UsersTableTestHelper.addUser({ id: 'user-12345', username: 'johndoe' })
      await ThreadTableTestHelper.addThread({})
      await CommentTableTestHelper.addComment({ id: 'comment-12345', owner: 'user-12345' })
      await ReplyTableTestHelper.addReply({ id: 'reply-12345', owner: 'user-12345' })

      // Action & Assert
      return expect(replyRepositoryPostgres.verifyReplyAvailability('reply-12345', 'comment-12345'))
        .resolves.not.toThrowError()
    })
  })
})
