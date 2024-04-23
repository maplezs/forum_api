const ThreadDetail = require('../../../Domains/threads/entities/ThreadDetail')
const CommentDetail = require('../../../Domains/comments/entitites/CommentDetail')
const ReplyDetail = require('../../../Domains/replies/entitites/ReplyDetail')
const ThreadRepository = require('../../../Domains/threads/ThreadRepository')
const CommentRepository = require('../../../Domains/comments/CommentRepository')
const ReplyRepository = require('../../../Domains/replies/ReplyRepository')
const GetThreadDetailUseCase = require('../GetThreadDetailUseCase')

describe('GetThreadDetailUseCase', () => {
  /**
     * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
     */
  it('should orchestrating the get thread detail action correctly', async () => {
    // Arrange
    const useCasePayload = {
      id: 'thread-12345'
    }
    const mockThreadDetail = {
      id: 'thread-12345',
      title: 'new title',
      body: 'this is a body of the thread',
      date: new Date().toISOString(),
      username: 'johndoe'
    }

    const mockCommentDetail = [
      {
        id: 'comment-12345',
        username: 'user-12345',
        date: new Date().toISOString(),
        content: 'new comment 1',
        likeCount: 1,
        isDeleted: false
      },
      // deleted comment
      {
        id: 'comment-123456',
        username: 'user-123456',
        date: new Date().toISOString(),
        content: 'new comment 2',
        likeCount: 0,
        isDeleted: true
      }
    ]

    const mockReplyDetail = [
      {
        id: 'reply-12345',
        username: 'user-12345',
        date: new Date().toISOString(),
        content: 'new replies 3',
        commentId: 'comment-12345',
        isDeleted: false
      },
      {
        id: 'reply-12345',
        username: 'user-12345',
        date: new Date().toISOString(),
        content: 'new replies 1',
        commentId: 'comment-123456',
        isDeleted: false
      },
      // deleted replies
      {
        id: 'reply-123456',
        username: 'user-123456',
        date: new Date().toISOString(),
        content: 'new replies 2',
        commentId: 'comment-12345',
        isDeleted: true
      }
    ]
    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository()
    const mockCommentRepository = new CommentRepository()
    const mockReplyRepository = new ReplyRepository()
    /** mocking needed function */
    mockThreadRepository.verifyThreadAvailability = jest.fn(() => Promise.resolve())
    mockThreadRepository.getThreadById = jest.fn(() => Promise.resolve(mockThreadDetail))
    mockCommentRepository.getCommentsByThreadId = jest.fn(() => Promise.resolve(mockCommentDetail))
    mockReplyRepository.getRepliesByCommentId = jest.fn(() => Promise.resolve(mockReplyDetail))

    /** creating use case instance */
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository
    })

    // Action
    const thread = await getThreadDetailUseCase.execute(useCasePayload)

    // Assert
    const expectedThread = {
      id: 'thread-12345',
      title: 'new title',
      body: 'this is a body of the thread',
      date: mockThreadDetail.date,
      username: 'johndoe'
    }

    const expectedComments = [{
      id: 'comment-12345',
      username: 'user-12345',
      date: mockCommentDetail[0].date,
      content: 'new comment 1',
      replies: [{
        id: 'reply-12345',
        username: 'user-12345',
        date: mockReplyDetail[0].date,
        content: 'new replies 3',
        isDeleted: false
      },
      {
        id: 'reply-123456',
        username: 'user-123456',
        date: mockReplyDetail[1].date,
        content: '**balasan telah dihapus**',
        isDeleted: true
      }],
      likeCount: 1,
      isDeleted: false
    },
    {
      id: 'comment-123456',
      username: 'user-123456',
      date: mockCommentDetail[0].date,
      content: '**komentar telah dihapus**',
      replies: [{
        id: 'reply-12345',
        username: 'user-12345',
        date: mockReplyDetail[2].date,
        content: 'new replies 1',
        isDeleted: false
      }],
      likeCount: 0,
      isDeleted: true
    }

    ]

    expect(thread).toStrictEqual(
      new ThreadDetail({
        id: expectedThread.id,
        title: expectedThread.title,
        body: expectedThread.body,
        username: expectedThread.username,
        date: expectedThread.date,
        comments: [
          // 12345
          new CommentDetail({
            id: expectedComments[0].id,
            username: expectedComments[0].username,
            date: expectedComments[0].date,
            content: expectedComments[0].content,
            replies: [
              new ReplyDetail({
                id: expectedComments[0].replies[0].id,
                username: expectedComments[0].replies[0].username,
                date: expectedComments[0].replies[0].date,
                content: expectedComments[0].replies[0].content,
                isDeleted: expectedComments[0].replies[0].isDeleted
              }),
              new ReplyDetail({
                id: expectedComments[0].replies[1].id,
                username: expectedComments[0].replies[1].username,
                date: expectedComments[0].replies[1].date,
                content: expectedComments[0].replies[1].content,
                isDeleted: expectedComments[0].replies[1].isDeleted
              })
            ],
            likeCount: 1,
            isDeleted: expectedComments[0].isDeleted
          }),
          // 123456
          new CommentDetail({
            id: expectedComments[1].id,
            username: expectedComments[1].username,
            date: expectedComments[1].date,
            content: expectedComments[1].content,
            replies: [
              new ReplyDetail({
                id: expectedComments[1].replies[0].id,
                username: expectedComments[1].replies[0].username,
                date: expectedComments[1].replies[0].date,
                content: expectedComments[1].replies[0].content,
                isDeleted: expectedComments[1].replies[0].isDeleted
              })
            ],
            likeCount: 0,
            isDeleted: expectedComments[1].isDeleted
          })
        ]
      })
    )

    expect(mockThreadRepository.verifyThreadAvailability).toBeCalledWith(useCasePayload)
    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCasePayload)
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(useCasePayload)
    expect(mockReplyRepository.getRepliesByCommentId).toBeCalledWith(['comment-12345', 'comment-123456'])
  })
})
