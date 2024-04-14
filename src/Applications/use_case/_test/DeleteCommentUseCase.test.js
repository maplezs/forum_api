const CommentRepository = require('../../../Domains/comments/CommentRepository')
const ThreadRepository = require('../../../Domains/threads/ThreadRepository')
const DeleteCommentUseCase = require('../DeleteCommentUseCase')

describe('DeleteCommentUseCase', () => {
  it('should orchestrating the delete thread comment action correctly', async () => {
    // Arrange
    const owner = 'user-12345'
    const mockCommentRepository = new CommentRepository()
    const mockThreadRepository = new ThreadRepository()

    mockThreadRepository.verifyThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve())
    mockCommentRepository.verifyCommentAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve())
    mockCommentRepository.verifyCommentAccess = jest.fn()
      .mockImplementation(() => Promise.resolve())
    mockCommentRepository.deleteCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve())

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository
    })

    // Act
    await deleteCommentUseCase.execute('thread-12345', 'comment-12345', owner)

    // Assert
    expect(mockCommentRepository.verifyCommentAvailability)
      .toHaveBeenCalledWith('comment-12345', 'thread-12345')
    expect(mockCommentRepository.verifyCommentAccess)
      .toHaveBeenCalledWith('comment-12345', owner)
    expect(mockCommentRepository.deleteCommentById)
      .toHaveBeenCalledWith('comment-12345')
  })
})
