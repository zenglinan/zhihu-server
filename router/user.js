const Router = require('koa-router')
const user = require('../controller/user')
const jwt = require('koa-jwt')

const router = new Router({
  prefix: "/users"
})
const auth = jwt({secret: 'i_love_linan_#HaHa'})
router.get('/', user.find)

router.post('/', user.create)

router.get('/:id', user.findById)

router.patch('/:id', auth, user.checkOwner, user.update)

router.delete('/:id', auth, user.checkOwner, user.delete)

router.post('/login', user.login)

module.exports = router