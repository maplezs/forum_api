const AddReply = require('../AddReply')

describe('Add reply entities ', () => {
  it('should throw an error when the payload does not contain the needed property', () => {
    const payload = {}
    expect(() => new AddReply(payload)).toThrowError('ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY')
  })

  it('should throw an error when the payload does not meet the data type specification', () => {
    const payload = {
      content: 12345
    }
    expect(() => new AddReply(payload)).toThrowError('ADD_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should create addComment object correctly', () => {
    const payload = {
      content: 'new reply'
    }
    const { content } = new AddReply(payload)
    expect(content).toEqual(payload.content)
  })
})
