const listHelper = require('../utils/list_helper')
const blogs = require('./test_helper').initialBlogs

const listWithOneBlog = [
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    __v: 0
  }
]

describe('list helpers skip should be removed', () => {
  describe('total likes', () => {
    test('when list has only one blog equals the likes of that', () => {
      const result = listHelper.totalLikes(listWithOneBlog)
      expect(result).toBe(5)
    })

    test('sum of the likes of many blogs is calculated right', () => {
      const result = listHelper.totalLikes(blogs)
      expect(result).toBe(36)
    })

  })

  describe('favorite blog', () => {
    test('when list has no blogs an empty object is returned', () => {
      const result = listHelper.favoriteBlog([])
      expect(result).toEqual({})
    })

    test('when list has only one blog favorite blog is that', () => {
      const result = listHelper.favoriteBlog(listWithOneBlog)
      expect(result).toEqual({
        title: 'Go To Statement Considered Harmful',
        author: 'Edsger W. Dijkstra',
        likes: 5
      })
    })

    test('most liked blog is returned from list with many', () => {
      const result = listHelper.favoriteBlog(blogs)
      expect(result).toEqual({
        title: 'Canonical string reduction',
        author: 'Edsger W. Dijkstra',
        likes: 12
      })
    })
  })

  describe('most blogs', () => {
    test('when list has no blogs an empty object is returned', () => {
      const result = listHelper.mostBlogs([])
      expect(result).toEqual({})
    })

    test('auhtor with most blogs written from list with one', () => {
      const result = listHelper.mostBlogs(listWithOneBlog)
      expect(result).toEqual({
        author: 'Edsger W. Dijkstra',
        blogs: 1
      })
    })

    test('auhtor with most blogs written from list with many', () => {
      const result = listHelper.mostBlogs(blogs)
      expect(result).toEqual({
        author: 'Robert C. Martin',
        blogs: 3
      })
    })
  })

  describe('most likes', () => {
    test('when list has no blogs an empty object is returned', () => {
      const result = listHelper.mostLikes([])
      expect(result).toEqual({})
    })

    test('auhtor with most likes from list with one', () => {
      const result = listHelper.mostLikes(listWithOneBlog)
      expect(result).toEqual({
        author: 'Edsger W. Dijkstra',
        likes: 5
      })
    })

    test('auhtor with most likes from list with many', () => {
      const result = listHelper.mostLikes(blogs)
      expect(result).toEqual({
        author: 'Edsger W. Dijkstra',
        likes: 17
      })
    })
  })
})
