const AddComment = require('../../../Domains/comments/entitites/AddComment')
const AddedComment = require('../../../Domains/comments/entitites/AddedComment')
const CommentRepository = require('../../../Domains/comments/CommentRepository')
const ThreadRepository = require('../../../Domains/threads/ThreadRepository')
const AddCommentUseCase = require('../AddCommentUseCase')

describe('AddCommentUseCase', () => {
  /**
     * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
     */
  it('should orchestrating the add comment action correctly', async () => {
    // Arrange
    const owner = 'user-12345'
    const useCasePayload = {
      content: 'new comment'
    }

    const mockAddedThreadComment = new AddedComment({
      id: 'comment-12345',
      content: useCasePayload.content,
      owner
    })

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository()
    const mockThreadRepository = new ThreadRepository()

    /** mocking needed function */
    mockThreadRepository.verifyThreadAvailability = jest.fn(() => Promise.resolve())
    mockCommentRepository.addComment = jest.fn(() => Promise.resolve(mockAddedThreadComment))

    /** creating use case instance */
    const getThreadCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository
    })

    // Action
    const addedComment = await getThreadCommentUseCase.execute('thread-12345', useCasePayload, owner)

    // Assert
    expect(addedComment).toStrictEqual(new AddedComment({
      id: 'comment-12345',
      content: useCasePayload.content,
      owner
    }))

    expect(mockThreadRepository.verifyThreadAvailability).toBeCalledWith('thread-12345')
    expect(mockCommentRepository.addComment).toBeCalledWith(new AddComment({ content: useCasePayload.content }), 'thread-12345', owner)
  })
})
