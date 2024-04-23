const ReplyRepository = require('../../../Domains/replies/ReplyRepository')
const DeleteReplyUseCase = require('../DeleteReplyUseCase')
const CommentRepository = require('../../../Domains/comments/CommentRepository')
const ThreadRepository = require('../../../Domains/threads/ThreadRepository')

describe('DeleteReplyUseCase', () => {
  it('should orchestrating the delete reply action correctly', async () => {
    // Arrange
    const mockReplyRepository = new ReplyRepository()
    const mockCommentRepository = new CommentRepository()
    const mockThreadRepository = new ThreadRepository()

    mockThreadRepository.verifyThreadAvailability = jest.fn(() => Promise.resolve())
    mockCommentRepository.verifyCommentAvailability = jest.fn(() => Promise.resolve())
    mockReplyRepository.verifyReplyAvailability = jest.fn(() => Promise.resolve())
    mockReplyRepository.verifyReplyAccess = jest.fn(() => Promise.resolve())
    mockReplyRepository.deleteReplyById = jest.fn(() => Promise.resolve('reply-12345'))

    const deleteReplyUseCase = new DeleteReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository
    })

    // Act
    await deleteReplyUseCase.execute('thread-12345', 'comment-12345', 'user-12345', 'reply-12345')

    // Assert
    expect(mockThreadRepository.verifyThreadAvailability)
      .toHaveBeenCalledWith('thread-12345')
    expect(mockCommentRepository.verifyCommentAvailability)
      .toHaveBeenCalledWith('comment-12345', 'thread-12345')
    expect(mockReplyRepository.verifyReplyAvailability)
      .toHaveBeenCalledWith('reply-12345', 'comment-12345')
    expect(mockReplyRepository.verifyReplyAccess)
      .toHaveBeenCalledWith('reply-12345', 'user-12345')
    expect(mockReplyRepository.deleteReplyById)
      .toHaveBeenCalledWith('reply-12345')
  })
})
