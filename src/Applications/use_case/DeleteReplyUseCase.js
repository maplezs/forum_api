class DeleteReplyUseCase {
  constructor ({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository
    this._commentRepository = commentRepository
    this._replyRepository = replyRepository
  }

  async execute (threadId, commentId, owner, replyId) {
    await this._threadRepository.verifyThreadAvailability(threadId)
    await this._commentRepository.verifyCommentAvailability(commentId, threadId)
    await this._replyRepository.verifyReplyAvailability(replyId, commentId)
    await this._replyRepository.verifyReplyAccess(replyId, owner)
    await this._replyRepository.deleteReplyById(replyId)
  }
}

module.exports = DeleteReplyUseCase
