class DeleteCommentUseCase {
  constructor ({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository
    this._commentRepository = commentRepository
  }

  async execute (threadId, commentId, owner) {
    await this._threadRepository.verifyThreadAvailability(threadId)
    await this._commentRepository.verifyCommentAvailability(commentId, threadId)
    await this._commentRepository.verifyCommentAccess(commentId, owner)
    await this._commentRepository.deleteCommentById(commentId)
  }
}

module.exports = DeleteCommentUseCase
