const ThreadDetail = require('../ThreadDetail')

describe('Thread Detail entities ', () => {
  it('should throw an error when the payload does not contain the needed property', () => {
    const payload = {
      id: 'thread-12345',
      title: 'not very long title',
      body: 'thread body',
      date: new Date().toISOString(),
      username: 'user-12345'
    }
    expect(() => new ThreadDetail(payload)).toThrowError('THREAD_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY')
  })

  it('should throw an error when the payload does not meet the data type specification', () => {
    const payload = {
      id: 'thread-12345',
      title: 'not very long title',
      body: 'thread body',
      date: new Date().toISOString(),
      username: 123456,
      comments: 12345
    }
    expect(() => new ThreadDetail(payload)).toThrowError('THREAD_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should create threadDetail object correctly', () => {
    const payload = {
      id: 'thread-12345',
      title: 'not very long title',
      body: 'thread body',
      date: new Date().toISOString(),
      username: 'johndoe',
      comments: []
    }

    const threadDetail = new ThreadDetail(payload)

    expect(threadDetail.id).toEqual(payload.id)
    expect(threadDetail.title).toEqual(payload.title)
    expect(threadDetail.body).toEqual(payload.body)
    expect(threadDetail.date).toEqual(payload.date)
    expect(threadDetail.username).toEqual(payload.username)
    expect(threadDetail.comments).toEqual(payload.comments)
  })
})
