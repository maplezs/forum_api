class CommentDetail {
  constructor (payload) {
    this._verifyPayload(payload)

    const { id, username, date, content, replies, isDeleted, likeCount } = payload

    this.id = id
    this.username = username
    this.date = date
    this.content = isDeleted ? '**komentar telah dihapus**' : content
    this.replies = replies
    this.isDeleted = isDeleted
    this.likeCount = likeCount
  }

  _verifyPayload ({ id, username, date, content, replies, isDeleted, likeCount }) {
    if (!id || !username || !date || !content || !replies || isDeleted === undefined || likeCount === undefined) {
      throw new Error('COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY')
    }

    if (typeof id !== 'string' ||
            typeof username !== 'string' ||
            typeof date !== 'string' ||
            !Array.isArray(replies) ||
            typeof content !== 'string' ||
            typeof isDeleted !== 'boolean' ||
            typeof likeCount !== 'number') {
      throw new Error('COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION')
    }
  }
}

module.exports = CommentDetail
