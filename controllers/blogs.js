const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  try {
    const blogs = await Blog.find({})
    response.json(blogs.map(Blog.format))
  } catch (e) {
    console.log(e)
    response.status(500).json({ error: 'something went wrong...' })
  }
})

blogsRouter.get('/:id', async (request, response) => {
  try {
    const id = request.params.id

    if (id.length !== 24) {
      return response.status(400).send({ error: 'invalid id' })
    }

    const blog = await Blog.findById(id)
    response.json(Blog.format(blog))
  } catch (e) {
    console.log(e)
    response.status(404).json({ error: 'blog does not exist' })
  }
})

blogsRouter.post('/', async (request, response) => {
  try {
    const body = request.body
    const res = await Blog.find({ url: body.url })

    if (!body.title) {
      return response.status(400).send({ error: 'no title' })
    } else if (!body.url) {
      return response.status(400).send({ error: 'no url' })
    } else if (0 < res.length) {
      return response.status(400).send({ error: 'blog already exists' })
    } else {

      if (!body.likes) {
        body.likes = 0
      }

      const blog = new Blog(body)
      await blog.save()
      response.status(201).json(Blog.format(blog))
    }
  } catch (e) {
    console.log(e)
    response.status(500).json({ error: 'something went wrong...' })
  }
})

blogsRouter.put('/:id', async (request, response) => {
  try {
    const body = request.body
    const id = request.params.id

    const blog = {
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes,
      user: body.user
    }

    const modifiedBlog = await Blog.findByIdAndUpdate(id, blog, { new: true })
    response.json(Blog.format(modifiedBlog))
  } catch (e) {
    console.log(e)
    response.status(500).json({ error: 'something went wrong...' })
  }
})

blogsRouter.delete('/:id', async (request, response) => {
  try {
    const id = request.params.id

    await Blog.findByIdAndRemove(id)
    response.status(204).end()
  } catch (e) {
    console.log(e)
    response.status(500).json({ error: 'something went wrong...' })
  }
})

module.exports = blogsRouter