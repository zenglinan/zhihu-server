const Router = require('koa-router')
const topic = require('../controller/topic')

const router = new Router({
  prefix: '/topic'
})

router.get('/', topic.findAll)

router.get('/:id', topic.findById)

router.put('/create', topic.create)

module.exports = router