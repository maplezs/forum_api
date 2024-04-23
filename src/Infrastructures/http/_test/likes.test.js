const pool = require('../../database/postgres/pool')
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper')
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper')
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper')
const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper')
const LikeTableTestHelper = require('../../../../tests/LikeTableTestHelper')
const container = require('../../container')
const createServer = require('../createServer')

describe('/threads/{threadId}/comments/{commentId}/likes endpoint', () => {
  afterAll(async () => {
    await pool.end()
  })

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable()
    await CommentTableTestHelper.cleanTable()
    await LikeTableTestHelper.cleanTable()
    await ThreadsTableTestHelper.cleanTable()
    await AuthenticationsTableTestHelper.cleanTable()
  })

  describe('when PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    let server
    let user
    beforeEach(async () => {
      server = await createServer(container)
      user = await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'johndoe',
          password: 'secret',
          fullname: 'Dicoding Indonesia'
        }
      })
    })
    it('should response 200 when user liking a comment', async () => {
      // Arrange
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'johndoe',
          password: 'secret'
        }
      })
      const { data: { accessToken } } = JSON.parse(loginResponse.payload)
      const { data: { addedUser } } = JSON.parse(user.payload)
      await ThreadsTableTestHelper.addThread({ owner: addedUser.id })
      await CommentTableTestHelper.addComment({ owner: addedUser.id })
      // Action
      const response = await server.inject({
        method: 'PUT',
        url: '/threads/thread-12345/comments/comment-12345/likes',
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(200)
      expect(responseJson.status).toEqual('success')
    })
  })
})
