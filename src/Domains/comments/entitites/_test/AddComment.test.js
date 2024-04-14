const AddComment = require('../AddComment')

describe('Add comment entities ', () => {
  it('should throw an error when the payload does not contain the needed property', () => {
    const payload = {}
    expect(() => new AddComment(payload)).toThrowError('ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY')
  })

  it('should throw an error when the payload does not meet the data type specification', () => {
    const payload = {
      content: 12345
    }
    expect(() => new AddComment(payload)).toThrowError('ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should create addComment object correctly', () => {
    const payload = {
      content: 'new comment'
    }
    const addComment = new AddComment(payload)
    expect(addComment.content).toEqual(payload.content)
  })
})
