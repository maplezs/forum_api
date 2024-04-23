const CommentDetail = require('../CommentDetail')

describe('Comment Detail entities ', () => {
  it('should throw an error when the payload does not contain the needed property', () => {
    const payload = {
      id: 'comment-12345',
      username: 'johndoe',
      date: new Date().toISOString(),
      replies: []
    }
    expect(() => new CommentDetail(payload)).toThrowError('COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY')
  })
  it('should throw an error when the payload does not meet the data type specification', () => {
    const payload = {
      id: 'comment-12345',
      username: 12345,
      date: new Date().toISOString(),
      content: 12345,
      replies: '[]',
      likeCount: 'abc',
      isDeleted: false
    }
    expect(() => new CommentDetail(payload)).toThrowError('COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should create commentDetail object correctly', () => {
    const payload = {
      id: 'comment-12345',
      username: 'johndoe',
      date: new Date().toISOString(),
      content: 'new comment',
      replies: [],
      likeCount: 0,
      isDeleted: false
    }

    const commentDetail = new CommentDetail(payload)

    expect(commentDetail.id).toEqual(payload.id)
    expect(commentDetail.username).toEqual(payload.username)
    expect(commentDetail.date).toEqual(payload.date)
    expect(commentDetail.content).toEqual(payload.content)
    expect(commentDetail.replies).toEqual(payload.replies)
    expect(commentDetail.likeCount).toEqual(payload.likeCount)
    expect(commentDetail.isDeleted).toEqual(payload.isDeleted)
  })

  it('should create commentDetail object correctly when comment is soft deleted', () => {
    const payload = {
      id: 'comment-12345',
      username: 'johndoe',
      date: new Date().toISOString(),
      content: 'new comment',
      replies: [],
      likeCount: 0,
      isDeleted: true
    }

    const commentDetail = new CommentDetail(payload)

    expect(commentDetail.id).toEqual(payload.id)
    expect(commentDetail.username).toEqual(payload.username)
    expect(commentDetail.date).toEqual(payload.date)
    expect(commentDetail.content).toEqual('**komentar telah dihapus**')
    expect(commentDetail.replies).toEqual(payload.replies)
    expect(commentDetail.likeCount).toEqual(payload.likeCount)
    expect(commentDetail.isDeleted).toEqual(payload.isDeleted)
  })
})
