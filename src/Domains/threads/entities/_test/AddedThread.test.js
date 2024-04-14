const AddedThread = require('../AddedThread')

describe('Add thread entities ', () => {
  it('should throw an error when the payload does not contain the needed property', () => {
    const payload = {
      id: 'thread-12345',
      title: 'not very long title'
    }
    expect(() => new AddedThread(payload)).toThrowError('ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY')
  })
  it('should throw an error when the payload does not meet the data type specification', () => {
    const payload = {
      id: 'thread-12345',
      title: 'not very long title',
      owner: 123456
    }
    expect(() => new AddedThread(payload)).toThrowError('ADDED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should create addedThread object correctly', () => {
    const payload = {
      id: 'thread-12345',
      title: 'not very long title',
      owner: 'user-12345'
    }

    const addedThread = new AddedThread(payload)

    expect(addedThread.id).toEqual(payload.id)
    expect(addedThread.title).toEqual(payload.title)
    expect(addedThread.owner).toEqual(payload.owner)
  })
})
