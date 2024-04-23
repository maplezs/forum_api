class LikeDislikeCommentUseCase {
  constructor ({ threadRepository, commentRepository, likeRepository }) {
    this._threadRepository = threadRepository
    this._commentRepository = commentRepository
    this._likeRepository = likeRepository
  }

  async execute (threadId, useCasePayload, owner) {
    await this._threadRepository.verifyThreadAvailability(threadId)
    await this._commentRepository.verifyCommentAvailability(useCasePayload, threadId)
    const likeStatus = await this._likeRepository.verifyLikeStatus(useCasePayload, owner)
    if (likeStatus) return this._likeRepository.dislikeComment(useCasePayload, owner)
    return this._likeRepository.likeComment(useCasePayload, owner)
  }
}

module.exports = LikeDislikeCommentUseCase
