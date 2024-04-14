const AddReply = require('../../Domains/replies/entitites/AddReply')

class AddReplyUseCase {
  constructor ({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository
    this._commentRepository = commentRepository
    this._replyRepository = replyRepository
  }

  async execute (threadId, commentId, owner, useCasePayload) {
    await this._threadRepository.getThreadById(threadId)
    await this._commentRepository.verifyCommentAvailability(commentId, threadId)
    const addReply = new AddReply(useCasePayload)
    return this._replyRepository.addReply(addReply, commentId, owner)
  }
}

module.exports = AddReplyUseCase
