const Router = require('koa-router')
const home = require('../controller/home')

const router = new Router()

router.post('/upload', home.uploadFile)
module.exports = router