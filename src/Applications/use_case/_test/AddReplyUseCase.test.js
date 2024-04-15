const AddedReply = require('../../../Domains/replies/entitites/AddedReply')
const ReplyRepository = require('../../../Domains/replies/ReplyRepository')
const AddReplyUseCase = require('../AddReplyUseCase')
const CommentRepository = require('../../../Domains/comments/CommentRepository')
const ThreadRepository = require('../../../Domains/threads/ThreadRepository')

describe('AddReplyUseCase', () => {
  it('should orchestrating the add reply action correctly', async () => {
    // Arrange
    const owner = 'user-12345'
    const useCasePayload = {
      content: 'new reply'
    }

    const mockAddedReply = new AddedReply({
      id: 'reply-12345',
      content: useCasePayload.content,
      owner
    })

    /** creating dependency of use case */
    const mockReplyRepository = new ReplyRepository()
    const mockCommentRepository = new CommentRepository()
    const mockThreadRepository = new ThreadRepository()

    /** mocking needed function */
    mockThreadRepository.verifyThreadAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve())
    mockCommentRepository.verifyCommentAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve())
    mockReplyRepository.addReply = jest.fn()
      .mockImplementation(() => Promise.resolve(mockAddedReply))

    /** creating use case instance */
    const getReplyUseCase = new AddReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository
    })

    // Action
    const addedReply = await getReplyUseCase.execute('thread-12345', 'comment-12345', owner, useCasePayload)

    // Assert
    expect(addedReply).toStrictEqual(new AddedReply({
      id: 'reply-12345',
      content: useCasePayload.content,
      owner
    }))
    expect(mockThreadRepository.verifyThreadAvailability).toBeCalledWith('thread-12345')
    expect(mockCommentRepository.verifyCommentAvailability).toBeCalledWith('comment-12345', 'thread-12345')
    expect(mockReplyRepository.addReply).toBeCalledWith(useCasePayload, 'comment-12345', owner)
  })
})
