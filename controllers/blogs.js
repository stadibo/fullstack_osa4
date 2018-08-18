const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response) => {
  try {
    const blogs = await Blog
      .find({})
      .populate('user', {
        _id: 1,
        username: 1,
        name: 1
      })

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

      //const user = await User.findById(body.user)

      const users = await User.find({}) //temporary solution
      const user = users[0]

      const blog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes ? body.likes : 0,
        user: user._id
      })

      const savedBlog = await blog.save()

      user.blogs = user.blogs.concat(savedBlog._id)
      await user.save()

      response.json(Blog.format(blog))
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