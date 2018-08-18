const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const { initialBlogs, blogsInDb, usersInDb, nonExistingId } = require('./test_helper')

describe('when some blogs already exist', async () => {
  beforeAll(async () => {
    await Blog.remove({})

    const blogObjects = initialBlogs.map(b => new Blog(b))
    await Promise.all(blogObjects.map(b => b.save()))
  })

  test('all blogs are returned as json by GET /api/blogs', async () => {
    const blogsInDatabase = await blogsInDb()

    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body.length).toBe(blogsInDatabase.length)

    const returnedTitles = response.body.map(b => b.title)
    blogsInDatabase.forEach(blog => {
      expect(returnedTitles).toContain(blog.title)
    })
  })

  test('individual blogs are returned as json by GET /api/blogs/:id', async () => {
    const blogsInDatabase = await blogsInDb()
    const aBlog = blogsInDatabase[0]

    const response = await api
      .get(`/api/blogs/${aBlog.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body.title).toBe(aBlog.title)
  })

  test('404 returned by GET /api/blogs/:id with nonExisting valid id', async () => {
    const validNonexistingId = await nonExistingId()

    await api
      .get(`/api/blogs/${validNonexistingId}`)
      .expect(404)
  })

  test('400 is returned by GET /api/blogs/:id with invalid id', async () => {
    const invalidId = '5a3d5da5826492910ja7d8asaw'

    await api
      .get(`/api/blogs/${invalidId}`)
      .expect(400)
  })

  describe('addition of a new blog', async () => {
    test('POST /api/blogs succeeds with valid data', async () => {
      const blogsAtStart = await blogsInDb()

      const newBlog = {
        title: 'Test are great, and here is why!',
        author: 'Senior dev',
        url: 'http://...1',
        likes: 5
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAfterOperation = await blogsInDb()

      expect(blogsAfterOperation.length).toBe(blogsAtStart.length + 1)

      const titles = blogsAfterOperation.map(b => b.title)
      expect(titles).toContain('Test are great, and here is why!')
    })

    test('POST /api/blogs fails with proper statuscode if title or url is missing', async () => {
      const newBlog = {
        author: 'Takashiro Hishashi',
        likes: 12
      }

      const blogsAtStart = await blogsInDb()

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)

      const blogsAfterOperation = await blogsInDb()

      expect(blogsAfterOperation.length).toBe(blogsAtStart.length)
    })

    test('POST /api/blogs will initialize likes value as 1 if the field is given no value', async () => {
      const newBlog = {
        title: 'Code is great, and here is why!',
        author: 'Senior dev',
        url: 'http://...2',
        likes: ''
      }

      const blogsAtStart = await blogsInDb()

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAfterOperation = await blogsInDb()

      expect(blogsAfterOperation.length).toBe(blogsAtStart.length + 1)
      const addedBlog = blogsAfterOperation.find(b => b.title === 'Code is great, and here is why!')
      expect(addedBlog.likes).toBe(0)
    })
  })

  describe('deletion of a blog', async () => {
    let addedBlog

    beforeAll(async () => {
      addedBlog = new Blog({
        title: 'delete with HTTP DELETE',
        author: 'anonymous',
        url: 'unknown',
        likes: 0
      })
      await addedBlog.save()
    })

    test('DELETE /api/blogs/:id succeeds with proper statuscode', async () => {
      const blogsAtStart = await blogsInDb()

      await api
        .delete(`/api/blogs/${addedBlog._id}`)
        .expect(204)

      const blogsAfterOperation = await blogsInDb()

      const titles = blogsAfterOperation.map(b => b.title)

      expect(titles).not.toContain(addedBlog.title)
      expect(blogsAfterOperation.length).toBe(blogsAtStart.length - 1)
    })
  })

  describe('modification of a blog', async () => {
    test('PUT /api/blogs/:id succeeds with proper statuscode', async () => {
      const blogsAtStart = await blogsInDb()

      const aBlog = { ...blogsAtStart[0] }
      aBlog['likes'] = aBlog['likes'] + 1

      await api
        .put(`/api/blogs/${aBlog.id}`)
        .send(aBlog)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const blogsAfterOperation = await blogsInDb()

      expect(blogsAfterOperation.length).toBe(blogsAtStart.length)
      expect(blogsAfterOperation[0].likes).toBe(blogsAtStart[0].likes + 1)
    })
  })
})

describe.only('when one user already exists in db', async () => {
  beforeAll(async () => {
    await User.remove({})
    const user = new User({ username: 'tester', password: 'sekret' })
    await user.save()
  })

  test('POST /api/users succeeds with a unique username', async () => {
    const usersBefore = await usersInDb()

    const newUser = {
      username: 'stadibo',
      name: 'Jesper Pettersson',
      adult: true,
      password: 'ridleyorion'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAfter = await usersInDb()
    expect(usersAfter.length).toBe(usersBefore.length + 1)
    const usernames = usersAfter.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('POST /api/users fails with proper statuscode and message if username already taken', async () => {
    const usersBefore = await usersInDb()

    const newUser = {
      username: 'tester',
      name: 'Superuser',
      password: 'hemlighet'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body).toEqual({ error: 'username must be unique' })

    const usersAfter = await usersInDb()
    expect(usersAfter.length).toBe(usersBefore.length)
  })
})

afterAll(() => {
  server.close()
})