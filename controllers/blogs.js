const blogsRouter = require('express').Router()
const jwt = require('jsonwebtoken')
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
      return response.status(400).json({ error: 'invalid id' })
    }

    const blog = await Blog.findById(id)
    response.json(Blog.format(blog))
  } catch (e) {
    console.log(e)
    response.status(404).json({ error: 'blog does not exist' })
  }
})

blogsRouter.post('/', async (request, response) => {
  const body = request.body

  try {
    const token = request.token
    const decodedToken = jwt.verify(token, process.env.SECRET)

    if (!token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    const res = await Blog.find({ url: body.url })
    if (!body.title) {
      return response.status(400).json({ error: 'no title' })
    } else if (!body.url) {
      return response.status(400).json({ error: 'no url' })
    } else if (0 < res.length) {
      return response.status(400).json({ error: 'blog already exists' })
    } else {

      const user = await User.findById(decodedToken.id)

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
    if (e.name === 'JsonWebTokenError') {
      response.status(401).json({ error: e.message })
    } else {
      console.log(e)
      response.status(500).json({ error: 'something went wrong...' })
    }
  }
})

blogsRouter.put('/:id', async (request, response) => {
  try {
    const body = request.body
    const id = request.params.id

    const token = request.token
    const decodedToken = jwt.verify(token, process.env.SECRET)

    if (!token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    const blogToModify = await Blog.findById(id)

    const blog = {
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes,
      user: decodedToken.id //might cause trouble, replace with body.user if error
    }

    if (blogToModify.user.toString() === decodedToken.id.toString()) {
      const modifiedBlog = await Blog.findByIdAndUpdate(id, blog, { new: true })
      response.json(Blog.format(modifiedBlog))
    } else {
      response.status(401).json({ error: 'user lacks permission to modify' })
    }


  } catch (e) {
    if (e.name === 'JsonWebTokenError') {
      response.status(401).json({ error: e.message })
    } else {
      console.log(e)
      response.status(500).json({ error: 'something went wrong...' })
    }
  }
})

blogsRouter.delete('/:id', async (request, response) => {
  try {
    const token = request.token
    const decodedToken = jwt.verify(token, process.env.SECRET)

    if (!token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    const id = request.params.id

    // console.log('start')
    // console.log(id)

    const blog = await Blog.findById(id)

    // console.log(blog)

    if (blog.user.toString() === decodedToken.id.toString()) {
      await Blog.findByIdAndRemove(id)
      response.status(204).end()
    } else {
      response.status(401).json({ error: 'user lacks permission to delete' })
    }


  } catch (e) {
    if (e.name === 'JsonWebTokenError') {
      response.status(401).json({ error: e.message })
    } else {
      console.log(e)
      response.status(500).json({ error: 'something went wrong...' })
    }
  }
})

module.exports = blogsRouter