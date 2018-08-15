const dummy = (blogs) => {
  blogs.length
  return Number(1)
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => {
    return sum + Number(blog.likes)
  }, 0)
}

const favoriteBlog = (blogs) => {
  return blogs.reduce((fav, blog) => {
    fav = fav.likes === undefined ? blog : fav
    if (fav.likes < blog.likes) {
      fav = blog
    }
    return {
      title: fav.title,
      author: fav.author,
      likes: fav.likes
    }
  }, {})
}

const mostBlogs = (blogs) => {
  let authors = blogs.map(blog => blog.author)

  const unique = authors.filter((author, index, self) => {
    return self.indexOf(author) === index
  })

  authors = unique.map(a => {
    return { author: a, blogs: 0 }
  })

  authors.forEach(item => {
    for (let i = 0; i < blogs.length; i++) {
      if (blogs[i].author === item.author) {
        item['blogs'] += 1
      }
    }
  })

  return authors.reduce((most, author) => {
    most = most.blogs === undefined ? author : most
    if (most.blogs < author.blogs) {
      most = author
    }
    return most
  }, {})
}

const mostLikes = (blogs) => {
  let authors = blogs.map(blog => blog.author)

  const unique = authors.filter((author, index, self) => {
    return self.indexOf(author) === index
  })

  authors = unique.map(a => {
    return { author: a, likes: 0 }
  })

  authors.forEach(item => {
    for (let i = 0; i < blogs.length; i++) {
      if (blogs[i].author === item.author) {
        item['likes'] += blogs[i].likes
      }
    }
  })

  return authors.reduce((most, author) => {
    most = most.likes === undefined ? author : most
    if (most.likes < author.likes) {
      most = author
    }
    return most
  }, {})

}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}