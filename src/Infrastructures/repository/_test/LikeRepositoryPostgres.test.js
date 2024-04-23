const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper')
const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper')
const ThreadTableTestHelper = require('../../../../tests/ThreadsTableTestHelper')
const LikeTableTestHelper = require('../../../../tests/LikeTableTestHelper')
const pool = require('../../database/postgres/pool')
const LikeRepositoryPostgres = require('../LikeRepositoryPostgres')

describe('ReplyRepositoryPostgres', () => {
  const fakeIdGenerator = () => '12345'
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable()
    await ThreadTableTestHelper.cleanTable()
    await CommentTableTestHelper.cleanTable()
    await LikeTableTestHelper.cleanTable()
  })

  afterAll(async () => {
    await pool.end()
  })

  describe('likeComment function', () => {
    beforeEach(async () => {
      await UsersTableTestHelper.addUser({ id: 'user-12345', username: 'johndoe' })
      await ThreadTableTestHelper.addThread({})
      await CommentTableTestHelper.addComment({ owner: 'user-12345' })
    })
    it('should persist when like a comment', async () => {
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator)
      // Action & Assert
      await likeRepositoryPostgres.likeComment('comment-12345', 'user-12345')
      const like = await LikeTableTestHelper.findLikeById('like-12345')
      expect(like).toHaveLength(1)
      expect(like[0]).toStrictEqual({ id: 'like-12345', comment_id: 'comment-12345', owner: 'user-12345' })
    })
  })

  describe('dislikeComment function', () => {
    it('should dislike a comment', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-12345', username: 'johndoe' })
      await UsersTableTestHelper.addUser({ id: 'user-12346', username: 'marydoe' })
      await ThreadTableTestHelper.addThread({})
      await CommentTableTestHelper.addComment({ id: 'comment-12345', owner: 'user-12345' })
      await LikeTableTestHelper.likeComment({ id: 'like-12345', owner: 'user-12345' })
      await LikeTableTestHelper.likeComment({ id: 'like-12346', owner: 'user-12346' })

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {})

      await likeRepositoryPostgres.dislikeComment('comment-12345', 'user-12345')

      const like = await LikeTableTestHelper.findLikeById('like-12345')
      expect(like).toHaveLength(0)
    })
  })

  describe('getLikesByCommentId function', () => {
    it('should return total likes when comment id is found', async () => {
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {})
      await UsersTableTestHelper.addUser({ id: 'user-12345', username: 'johndoe' })
      await UsersTableTestHelper.addUser({ id: 'user-12346', username: 'marydoe' })
      await ThreadTableTestHelper.addThread({})
      await CommentTableTestHelper.addComment({ id: 'comment-12345', owner: 'user-12345' })
      await LikeTableTestHelper.likeComment({ id: 'like-12345', owner: 'user-12345' })
      await LikeTableTestHelper.likeComment({ id: 'like-12346', owner: 'user-12346' })

      // Action & Assert
      const likeCount = await likeRepositoryPostgres.getLikesByCommentId('comment-12345')
      expect(likeCount).toStrictEqual(2)
    })
  })

  describe('verifyLikeStatus function', () => {
    it('should return false when user is not liking the comment', async () => {
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {})
      await UsersTableTestHelper.addUser({ id: 'user-12345', username: 'johndoe' })
      await ThreadTableTestHelper.addThread({})
      await CommentTableTestHelper.addComment({ id: 'comment-12345', owner: 'user-12345' })

      // Action & Assert
      const likeStatus = await likeRepositoryPostgres.verifyLikeStatus('comment-12345', 'user-12345')
      expect(likeStatus).toStrictEqual(false)
    })
    it('should return true when user is liking the comment', async () => {
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {})
      await UsersTableTestHelper.addUser({ id: 'user-12345', username: 'johndoe' })
      await ThreadTableTestHelper.addThread({})
      await CommentTableTestHelper.addComment({ id: 'comment-12345', owner: 'user-12345' })
      await LikeTableTestHelper.likeComment({ id: 'like-12345', owner: 'user-12345' })

      // Action & Assert
      const likeStatus = await likeRepositoryPostgres.verifyLikeStatus('comment-12345', 'user-12345')
      expect(likeStatus).toStrictEqual(true)
    })
  })
})
