class LikeRepository {
  async likeComment (commentId, owner) {
    throw new Error('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED')
  }

  async dislikeComment (commentId, owner) {
    throw new Error('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED')
  }

  async getLikesByCommentId (commentId) {
    throw new Error('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED')
  }

  async verifyLikeStatus (commentId, owner) {
    throw new Error('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED')
  }
}

module.exports = LikeRepository
