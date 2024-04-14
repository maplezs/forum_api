const ReplyDetail = require('../ReplyDetail')

describe('Reply Detail entities ', () => {
  it('should throw an error when the payload does not contain the needed property', () => {
    const payload = {
      id: 'reply-12345',
      username: 'johndoe',
      date: new Date().toISOString()
    }
    expect(() => new ReplyDetail(payload)).toThrowError('REPLY_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY')
  })
  it('should throw an error when the payload does not meet the data type specification', () => {
    const payload = {
      id: 'reply-12345',
      username: 12345,
      date: new Date().toISOString(),
      content: 12345,
      isDeleted: false
    }
    expect(() => new ReplyDetail(payload)).toThrowError('REPLY_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should create replyDetail object correctly', () => {
    const payload = {
      id: 'reply-12345',
      username: 'johndoe',
      date: new Date().toISOString(),
      content: 'new reply',
      isDeleted: false
    }

    const replyDetail = new ReplyDetail(payload)

    expect(replyDetail.id).toEqual(payload.id)
    expect(replyDetail.username).toEqual(payload.username)
    expect(replyDetail.date).toEqual(payload.date)
    expect(replyDetail.content).toEqual(payload.content)
    expect(replyDetail.isDeleted).toEqual(payload.isDeleted)
  })

  it('should create replyDetail object correctly when reply is soft deleted', () => {
    const payload = {
      id: 'reply-12345',
      username: 'johndoe',
      date: new Date().toISOString(),
      content: 'new reply',
      isDeleted: true
    }

    const replyDetail = new ReplyDetail(payload)

    expect(replyDetail.id).toEqual(payload.id)
    expect(replyDetail.username).toEqual(payload.username)
    expect(replyDetail.date).toEqual(payload.date)
    expect(replyDetail.content).toEqual('**balasan telah dihapus**')
    expect(replyDetail.isDeleted).toEqual(payload.isDeleted)
  })
})
