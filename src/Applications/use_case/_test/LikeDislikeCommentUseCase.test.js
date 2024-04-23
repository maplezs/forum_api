const LikeRepository = require('../../../Domains/likes/LikeRepository')
const LikeDislikeCommentUseCase = require('../LikeDislikeCommentUseCase')
const ThreadRepository = require('../../../Domains/threads/ThreadRepository')
const CommentRepository = require('../../../Domains/comments/CommentRepository')

describe('AddLikeUseCase', () => {
  it('should orchestrating like comment action correctly', async () => {
    // Arrange
    const owner = 'user-12345'
    const useCasePayload = {
      commentId: 'comment-12345'
    }

    /** creating dependency of use case */
    const mockLikeRepository = new LikeRepository()
    const mockCommentRepository = new CommentRepository()
    const mockThreadRepository = new ThreadRepository()

    /** mocking needed function */
    mockThreadRepository.verifyThreadAvailability = jest.fn(() => Promise.resolve())
    mockCommentRepository.verifyCommentAvailability = jest.fn(() => Promise.resolve())
    mockLikeRepository.verifyLikeStatus = jest.fn(() => Promise.resolve(false))
    mockLikeRepository.likeComment = jest.fn(() => Promise.resolve('like-12345'))

    /** creating use case instance */
    const getLikeUseCase = new LikeDislikeCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository
    })

    // Action
    await getLikeUseCase.execute('thread-12345', useCasePayload, owner)

    // Assert
    expect(mockThreadRepository.verifyThreadAvailability).toBeCalledWith('thread-12345')
    expect(mockCommentRepository.verifyCommentAvailability).toBeCalledWith(useCasePayload, 'thread-12345')
    expect(mockLikeRepository.verifyLikeStatus).toBeCalledWith(useCasePayload, owner)
    expect(mockLikeRepository.likeComment).toBeCalledWith(useCasePayload, owner)
  })

  it('should orchestrating dislike comment action correctly', async () => {
    // Arrange
    const owner = 'user-12345'
    const useCasePayload = {
      commentId: 'comment-12345'
    }

    /** creating dependency of use case */
    const mockLikeRepository = new LikeRepository()
    const mockCommentRepository = new CommentRepository()
    const mockThreadRepository = new ThreadRepository()

    /** mocking needed function */
    mockThreadRepository.verifyThreadAvailability = jest.fn(() => Promise.resolve())
    mockCommentRepository.verifyCommentAvailability = jest.fn(() => Promise.resolve())
    mockLikeRepository.verifyLikeStatus = jest.fn(() => Promise.resolve(true))
    mockLikeRepository.dislikeComment = jest.fn(() => Promise.resolve('like-12345'))

    /** creating use case instance */
    const getLikeUseCase = new LikeDislikeCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository
    })

    // Action
    await getLikeUseCase.execute('thread-12345', useCasePayload, owner)

    // Assert
    expect(mockThreadRepository.verifyThreadAvailability).toBeCalledWith('thread-12345')
    expect(mockCommentRepository.verifyCommentAvailability).toBeCalledWith(useCasePayload, 'thread-12345')
    expect(mockLikeRepository.verifyLikeStatus).toBeCalledWith(useCasePayload, owner)
    expect(mockLikeRepository.dislikeComment).toBeCalledWith(useCasePayload, owner)
  })
})
