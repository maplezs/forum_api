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
      username: 'johndoe',
      comments: []
    }

    const mockCommentDetail = [
      {
        id: 'comment-12345',
        username: 'user-12345',
        date: new Date().toISOString(),
        content: 'new comment 1',
        replies: [],
        isDeleted: false
      },
      // deleted comment
      {
        id: 'comment-123456',
        username: 'user-123456',
        date: new Date().toISOString(),
        content: 'new comment 2',
        replies: [],
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
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(mockThreadDetail))

    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockCommentDetail))

    mockReplyRepository.getRepliesByCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockReplyDetail))

    /** creating use case instance */
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository
    })

    // Action
    const thread = await getThreadDetailUseCase.execute(useCasePayload)
    // Assert
    expect(thread).toStrictEqual(
      new ThreadDetail({
        id: mockThreadDetail.id,
        title: mockThreadDetail.title,
        body: mockThreadDetail.body,
        username: mockThreadDetail.username,
        date: new Date(mockThreadDetail.date).toISOString(),
        comments: [
          // 12345
          new CommentDetail({
            id: mockCommentDetail[0].id,
            username: mockCommentDetail[0].username,
            date: mockCommentDetail[0].date,
            content: mockCommentDetail[0].content,
            replies: [
              new ReplyDetail({
                id: mockReplyDetail[0].id,
                username: mockReplyDetail[0].username,
                date: mockReplyDetail[0].date,
                content: mockReplyDetail[0].content,
                isDeleted: mockReplyDetail[0].isDeleted
              }),
              new ReplyDetail({
                id: mockReplyDetail[2].id,
                username: mockReplyDetail[2].username,
                date: mockReplyDetail[2].date,
                content: mockReplyDetail[2].content,
                isDeleted: mockReplyDetail[2].isDeleted
              })
            ],
            isDeleted: mockCommentDetail[0].isDeleted
          }),
          // 123456
          new CommentDetail({
            id: mockCommentDetail[1].id,
            username: mockCommentDetail[1].username,
            date: mockCommentDetail[1].date,
            content: mockCommentDetail[1].content,
            replies: [
              new ReplyDetail({
                id: mockReplyDetail[1].id,
                username: mockReplyDetail[1].username,
                date: mockReplyDetail[1].date,
                content: mockReplyDetail[1].content,
                isDeleted: mockReplyDetail[1].isDeleted
              })
            ],
            isDeleted: mockCommentDetail[1].isDeleted
          })
        ]
      })
    )

    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCasePayload)
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(useCasePayload)
    expect(mockReplyRepository.getRepliesByCommentId).toBeCalledWith(['comment-12345', 'comment-123456'])
  })
})
