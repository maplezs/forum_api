const AddComment = require('../../Domains/comments/entitites/AddComment')

class AddCommentUseCase {
  constructor ({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository
    this._threadRepository = threadRepository
  }

  async execute (threadId, useCasePayload, owner) {
    await this._threadRepository.getThreadById(threadId)
    const addComment = new AddComment(useCasePayload)
    return this._commentRepository.addComment(addComment, threadId, owner)
  }
}

module.exports = AddCommentUseCase
