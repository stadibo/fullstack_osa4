const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs.map(Blog.format))
})

blogsRouter.post('/', async (request, response) => {
  const body = request.body
  const res = await Blog.find({ name: body.title })

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
})



blogsRouter.delete('/:id', async (request, response) => {
  const id = request.params.id

  await Blog.findByIdAndRemove(id)
  response.status(204).end()
})

module.exports = blogsRouter