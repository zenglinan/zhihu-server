const Router = require('koa-router')
const topic = require('../controller/topic')
const jwt = require('koa-jwt')
const { secret } = require('../dbs/config')
const router = new Router({
  prefix: '/topic'
})

const auth = jwt({ secret })

router.get('/', topic.find)

router.get('/:id', topic.findById)

router.post('/create', auth, topic.create)

router.patch('/update/:id', auth, topic.update)

module.exports = router