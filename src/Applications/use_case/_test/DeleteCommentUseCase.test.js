const CommentRepository = require('../../../Domains/comments/CommentRepository')
const ThreadRepository = require('../../../Domains/threads/ThreadRepository')
const DeleteCommentUseCase = require('../DeleteCommentUseCase')

describe('DeleteCommentUseCase', () => {
  it('should orchestrating the delete thread comment action correctly', async () => {
    // Arrange
    const owner = 'user-12345'
    const mockCommentRepository = new CommentRepository()
    const mockThreadRepository = new ThreadRepository()

    mockThreadRepository.verifyThreadAvailability = jest.fn(() => Promise.resolve())
    mockCommentRepository.verifyCommentAvailability = jest.fn(() => Promise.resolve())
    mockCommentRepository.verifyCommentAccess = jest.fn(() => Promise.resolve())
    mockCommentRepository.deleteCommentById = jest.fn(() => Promise.resolve('comment-12345'))

    const deleteCommentUseCase = new DeleteCommentUseCase({
      threadRepository: mockThreadRepository, commentRepository: mockCommentRepository
    })

    // Act
    await deleteCommentUseCase.execute('thread-12345', 'comment-12345', owner)

    // Assert
    expect(mockThreadRepository.verifyThreadAvailability)
      .toHaveBeenCalledWith('thread-12345')
    expect(mockCommentRepository.verifyCommentAvailability)
      .toHaveBeenCalledWith('comment-12345', 'thread-12345')
    expect(mockCommentRepository.verifyCommentAccess)
      .toHaveBeenCalledWith('comment-12345', owner)
    expect(mockCommentRepository.deleteCommentById)
      .toHaveBeenCalledWith('comment-12345')
  })
})
