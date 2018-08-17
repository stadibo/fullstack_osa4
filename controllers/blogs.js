const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', (request, response) => {
  Blog
    .find({})
    .then(blogs => {
      response.json(blogs)
    })
})

blogsRouter.post('/', (request, response) => {
  const body = request.body

  Blog
    .find({ name: body.title })
    .then(res => {
      if (!body.title) {
        return response.status(400).send({ error: 'no title' })
      } else if (!body.url) {
        return response.status(400).send({ error: 'no url' })
      } else if (0 < res.length) {
        return res.status(400).send({ error: 'blog already exists' })
      } else {
        if (!body.likes) {
          console.log('no likes')
          body.likes = 0
        }

        const blog = new Blog(body)
        blog
          .save()
          .then(result => {
            response.status(201).json(result)
          })
      }

    })
})

module.exports = blogsRouter