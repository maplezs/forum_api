const LikeDislikeCommentUseCase = require('../../../../Applications/use_case/LikeDislikeCommentUseCase')

class LikesHandler {
  constructor (container) {
    this._container = container
    this.putLikeHandler = this.putLikeHandler.bind(this)
  }

  async putLikeHandler (request, h) {
    const { threadId, commentId } = request.params
    const { id: userId } = request.auth.credentials
    const likeDislikeCommentUseCase = this._container.getInstance(LikeDislikeCommentUseCase.name)
    await likeDislikeCommentUseCase.execute(threadId, commentId, userId)
    return {
      status: 'success'
    }
  }
}

module.exports = LikesHandler
