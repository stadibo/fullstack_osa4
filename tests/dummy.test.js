const listHelper = require('../utils/list_helper')

test.skip('dummy is called', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  expect(result).toBe(1)
})