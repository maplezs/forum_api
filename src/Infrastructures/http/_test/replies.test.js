const pool = require('../../database/postgres/pool')
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper')
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper')
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper')
const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper')
const ReplyTableTestHelper = require('../../../../tests/ReplyTableTestHelper')
const container = require('../../container')
const createServer = require('../createServer')

describe('/threads/{threadId}/comments/{commentId}/replies endpoint', () => {
  afterAll(async () => {
    await pool.end()
  })

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable()
    await CommentTableTestHelper.cleanTable()
    await ReplyTableTestHelper.cleanTable()
    await ThreadsTableTestHelper.cleanTable()
    await AuthenticationsTableTestHelper.cleanTable()
  })

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
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
    it('should response 201 and persisted reply', async () => {
      // Arrange
      const requestPayload = {
        content: 'new reply'
      }

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
        method: 'POST',
        url: '/threads/thread-12345/comments/comment-12345/replies',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(201)
      expect(responseJson.status).toEqual('success')
      expect(responseJson.data.addedReply).toBeDefined()
    })

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        content: 12345
      }

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
        method: 'POST',
        url: '/threads/thread-12345/comments/comment-12345/replies',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(400)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('tidak dapat membuat balasan karena tipe data tidak sesuai')
    })

    it('should response 401 when fail to authenticate', async () => {
      // Arrange
      const requestPayload = {
        content: 'new comment'
      }

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-12345/comments/comment-12345/replies',
        payload: requestPayload
      })
      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(401)
      expect(responseJson.message).toEqual('Missing authentication')
    })

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {}
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
        method: 'POST',
        url: '/threads/thread-12345/comments/comment-12345/replies',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(400)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('tidak dapat membuat balasan karena properti yang dibutuhkan tidak ada')
    })
  })

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
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

    it('should response 200 when successfully deleting a reply', async () => {
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
      await ReplyTableTestHelper.addReply({ owner: addedUser.id })

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-12345/comments/comment-12345/replies/reply-12345',
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(200)
      expect(responseJson.status).toEqual('success')
    })

    it('should response 404 when reply is not found', async () => {
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

      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-12345/comments/comment-12345/replies/reply-12345',
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(404)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('Balasan tidak ditemukan')
    })

    it('should response 401 when fail to authenticate', async () => {
      // Arrange

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-12345/comments/comment-12345/replies/reply-12345'
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(401)
      expect(responseJson.message).toEqual('Missing authentication')
    })

    it('should response 403 when user is not the comment owner', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-12345' })
      await ThreadsTableTestHelper.addThread({})
      await CommentTableTestHelper.addComment({})
      await ReplyTableTestHelper.addReply({})
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'johndoe',
          password: 'secret'
        }
      })
      const { data: { accessToken } } = JSON.parse(loginResponse.payload)

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-12345/comments/comment-12345/replies/reply-12345',
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(403)
      expect(responseJson.message).toEqual('Anda tidak berhak mengakses resource ini')
    })
  })
})
