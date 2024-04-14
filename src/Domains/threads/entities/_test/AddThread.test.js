const AddThread = require('../AddThread')

describe('Add thread entities ', () => {
  it('should throw an error when the payload does not contain the needed property', () => {
    const payload = {
      title: 'new title'
    }
    expect(() => new AddThread(payload)).toThrowError('ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY')
  })
  it('should throw an error when the payload does not meet the data type specification', () => {
    const payload = {
      title: 'new title',
      body: 789
    }
    expect(() => new AddThread(payload)).toThrowError('ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should create addThread object correctly', () => {
    const payload = {
      title: 'not very long title',
      body: 'this is a body of the thread'
    }

    const { title, body } = new AddThread(payload)

    expect(title).toEqual(payload.title)
    expect(body).toEqual(payload.body)
  })
})
