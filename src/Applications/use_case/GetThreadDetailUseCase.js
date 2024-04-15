const ThreadDetail = require('../../Domains/threads/entities/ThreadDetail')
const CommentDetail = require('../../Domains/comments/entitites/CommentDetail')
const ReplyDetail = require('../../Domains/replies/entitites/ReplyDetail')

class GetThreadDetailUseCase {
  constructor ({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository
    this._commentRepository = commentRepository
    this._replyRepository = replyRepository
  }

  async execute (useCasePayload) {
    await this._threadRepository.verifyThreadAvailability(useCasePayload)
    const threadData = await this._threadRepository.getThreadById(useCasePayload)
    const thread = new ThreadDetail({
      id: threadData.id,
      title: threadData.title,
      body: threadData.body,
      date: new Date(threadData.date).toISOString(),
      username: threadData.username,
      comments: []
    })

    const commentData = await this._commentRepository.getCommentsByThreadId(useCasePayload)
    const commentIds = commentData.map(comment => comment.id)
    const comments = commentData.map(comment =>
      new CommentDetail({
        id: comment.id,
        username: comment.username,
        date: new Date(comment.date).toISOString(),
        content: comment.content,
        replies: [],
        isDeleted: comment.isDeleted
      })
    )

    const repliesData = await this._replyRepository.getRepliesByCommentId(commentIds)
    comments.map((comment) => {
      comment.replies = repliesData.filter((reply) => reply.commentId === comment.id).map((reply) => {
        return new ReplyDetail({
          id: reply.id,
          content: reply.content,
          username: reply.username,
          date: new Date(reply.date).toISOString(),
          isDeleted: reply.isDeleted
        })
      })
      return comments
    })
    thread.comments = comments
    return thread
  }
}

module.exports = GetThreadDetailUseCase
