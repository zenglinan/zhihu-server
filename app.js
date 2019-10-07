const Koa = require('koa')
const koaBody = require('koa-body')
const koaStatic = require('koa-static')
const error = require('koa-json-error')
const parameter = require('koa-parameter')
const mongoose = require('mongoose')
const path = require('path')
const { connectUrl } = require('./dbs/config')
const autoUseRouter = require('./router/autoUseRouter')

const app = new Koa()

mongoose.connect(connectUrl, {useUnifiedTopology: true, useNewUrlParser: true},(err) => {
  if(err) console.error('mongoose 出错了',err)
  else {
    console.log('mongoose 连接成功！')
  }
})

app.use(error({
  postFormat: (e, { stack, ...rest }) => process.env.NODE_ENV === 'production' ? rest : { stack, ...rest }
}));
app.use(koaBody({
  multipart: true,
  formidable: {
    uploadDir: path.resolve(__dirname, './public/uploads'),
    keepExtensions: true
  },
}));
app.use(koaStatic(path.resolve(__dirname, './public')))
app.use(parameter(app))
autoUseRouter(app)

app.listen(8000, () => {
  console.log('listening at 8000')
})