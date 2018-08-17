const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const Blog = require('../models/blog')
const { initialBlogs, blogsInDb, nonExistingId } = require('./test_helper')

const newBlog = {
  title: 'Test are great, and here is why!',
  author: 'Senior dev',
  url: 'http://...',
  likes: 0
}

const noLikesBlog = {
  title: 'Test are great, and here is why!',
  author: 'Senior dev',
  url: 'http://...',
  likes: ''
}

const titleLessBlog = {
  author: 'Senior dev',
  likes: 2
}

beforeAll(async () => {
  await Blog.remove({})

  for (let blog of initialBlogs) {
    let blogObject = new Blog(blog)
    await blogObject.save()
  }

})

describe('blog tests', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('post should respond 201 if post succeeds', async () => {
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  })

  test('post body with no likes value -> set likes: 0', async () => {
    const response = await api.post('/api/blogs').send(noLikesBlog)

    expect(response.body.likes).toBe(0)
  })

  test('creating blog without title or url gives bad request', async () => {
    const response = await api.post('/api/blogs').send(titleLessBlog)

    expect(response.status).toBe(400)
  })
})

afterAll(() => {
  server.close()
})