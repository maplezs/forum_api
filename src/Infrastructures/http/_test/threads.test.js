const pool = require('../../database/postgres/pool')
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper')
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper')
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper')
const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper')
const ReplyTableTestHelper = require('../../../../tests/ReplyTableTestHelper')
const container = require('../../container')
const createServer = require('../createServer')

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end()
  })

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable()
    await ThreadsTableTestHelper.cleanTable()
    await AuthenticationsTableTestHelper.cleanTable()
  })

  describe('when POST /threads', () => {
    let server
    beforeEach(async () => {
      server = await createServer(container)
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'johndoe',
          password: 'secret',
          fullname: 'Dicoding Indonesia'
        }
      })
    })

    it('should response 201 and persisted thread', async () => {
      // Arrange
      const requestPayload = {
        title: 'new title',
        body: 'new body'
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
      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(201)
      expect(responseJson.status).toEqual('success')
      expect(responseJson.data.addedThread).toBeDefined()
    })

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        title: 'new title',
        body: 12345
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

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(400)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('tidak dapat membuat thread karena tipe data tidak sesuai')
    })

    it('should response 401 when fail to authenticate', async () => {
      // Arrange
      const requestPayload = {
        title: 'new title',
        body: 'new body'
      }

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload
      })
      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(401)
      expect(responseJson.message).toEqual('Missing authentication')
    })

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        title: 'new title'
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

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(400)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('tidak dapat membuat thread karena properti yang dibutuhkan tidak ada')
    })
  })

  describe('when GET /threads/{threadId}', () => {
    let server
    beforeEach(async () => {
      server = await createServer(container)
    })
    it('should response 200 with thread detail', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-12345', username: 'johndoe' })
      await UsersTableTestHelper.addUser({ id: 'user-12346', username: 'marydoe' })

      await ThreadsTableTestHelper.addThread({ id: 'thread-12345', owner: 'user-12345' })

      await CommentTableTestHelper.addComment({ id: 'comment-12346', threadId: 'thread-12345', owner: 'user-12346' })
      await CommentTableTestHelper.addComment({ id: 'comment-12345', threadId: 'thread-12345', owner: 'user-12345' })
      await ReplyTableTestHelper.addReply({ id: 'reply-12345', commentId: 'comment-12346', owner: 'user-12345' })

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-12345'
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(200)
      expect(responseJson.status).toEqual('success')

      const { thread } = responseJson.data
      expect(thread.id).toStrictEqual('thread-12345')
      expect(thread.title).toStrictEqual('new title')
      expect(thread.body).toStrictEqual('new body of thread')
      expect(new Date(thread.date).getMinutes()).toStrictEqual(new Date().getMinutes())
      expect(thread.username).toStrictEqual('johndoe')
      expect(thread.comments.length).toEqual(2)

      expect(thread.comments[0].id).toStrictEqual('comment-12346')
      expect(thread.comments[0].content).toStrictEqual('new comment')
      expect(thread.comments[0].username).toStrictEqual('marydoe')
      expect(thread.comments[0].replies.length).toEqual(1)
      expect(thread.comments[1].id).toStrictEqual('comment-12345')
      expect(thread.comments[1].content).toStrictEqual('new comment')
      expect(thread.comments[1].username).toStrictEqual('johndoe')
      expect(thread.comments[1].replies.length).toEqual(0)

      expect(thread.comments[0].replies[0].id).toStrictEqual('reply-12345')
      expect(thread.comments[0].replies[0].content).toStrictEqual('new reply')
      expect(thread.comments[0].replies[0].username).toStrictEqual('johndoe')

      expect(thread.comments[1].replies).toEqual([])
    })

    it('should response 404 when thread is not found', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-12345'
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(404)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('thread id tidak ditemukan')
    })
  })
})
