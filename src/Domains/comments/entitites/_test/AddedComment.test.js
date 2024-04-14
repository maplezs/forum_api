const AddedComment = require('../AddedComment')

describe('Added comment entities ', () => {
  it('should throw an error when the payload does not contain the needed property', () => {
    const payload = {
      id: 'comment-12345',
      content: 'new comment'
    }
    expect(() => new AddedComment(payload)).toThrowError('ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY')
  })
  it('should throw an error when the payload does not meet the data type specification', () => {
    const payload = {
      id: 'comment-12345',
      content: 'new comment',
      owner: 123456
    }
    expect(() => new AddedComment(payload)).toThrowError('ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should create addedComment object correctly', () => {
    const payload = {
      id: 'comment-12345',
      content: 'new comment',
      owner: 'user-12345'
    }

    const addedComment = new AddedComment(payload)

    expect(addedComment.id).toEqual(payload.id)
    expect(addedComment.content).toEqual(payload.content)
    expect(addedComment.owner).toEqual(payload.owner)
  })
})
