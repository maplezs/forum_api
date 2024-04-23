const LikeRepository = require('../LikeRepository')

describe('LikeRepository interface', () => {
  it('should throw error when invoke abstract behavior', async () => {
    // Arrange
    const likeRepository = new LikeRepository()

    // Action & Assert
    await expect(likeRepository.likeComment('', '')).rejects.toThrowError('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED')
    await expect(likeRepository.getLikesByCommentId('')).rejects.toThrowError('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED')
    await expect(likeRepository.dislikeComment('', '')).rejects.toThrowError('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED')
    await expect(likeRepository.verifyLikeStatus('', '')).rejects.toThrowError('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED')
  })
})
