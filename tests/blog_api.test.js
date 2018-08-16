const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('post should respond 201 if post succeeds', async () => {
  const newBlog = {
    title: 'Test are great, and here is why!',
    author: 'Senior dev',
    url: 'http://...',
    likes: '0'
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)
})

afterAll(() => {
  server.close()
})