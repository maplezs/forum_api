const AddedThread = require('../../../Domains/threads/entities/AddedThread')
const ThreadRepository = require('../../../Domains/threads/ThreadRepository')
const AddThreadUseCase = require('../AddThreadUseCase')

describe('AddThreadUseCase', () => {
  /**
     * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
     */
  it('should orchestrating the add thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      title: 'not very long title',
      body: 'this is a body of the thread'
    }

    const owner = 'user-12345'

    const mockAddedThread = new AddedThread({
      id: 'thread-12345',
      title: useCasePayload.title,
      owner
    })

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository()

    /** mocking needed function */
    mockThreadRepository.addThread = jest.fn(() => Promise.resolve(mockAddedThread))

    /** creating use case instance */
    const getThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository
    })

    // Action
    const addedThread = await getThreadUseCase.execute(useCasePayload, owner)

    // Assert
    expect(addedThread).toStrictEqual(new AddedThread({
      id: 'thread-12345',
      title: useCasePayload.title,
      owner
    }))

    expect(mockThreadRepository.addThread).toBeCalledWith(useCasePayload, owner)
  })
})
