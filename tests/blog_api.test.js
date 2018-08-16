const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)

const newBlog = {
  title: 'Test are great, and here is why!',
  author: 'Senior dev',
  url: 'http://...',
  likes: '0'
}

const noLikesBlog = {
  title: 'Test are great, and here is why!',
  author: 'Senior dev',
  url: 'http://...',
  likes: ''
}

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

afterAll(() => {
  server.close()
})