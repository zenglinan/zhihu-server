const Koa = require('koa')
const Bodyparser = require('koa-bodyparser')
const error = require('koa-json-error')
const parameter = require('koa-parameter')
const mongoose = require('mongoose')
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
app.use(parameter(app))
app.use(Bodyparser())
autoUseRouter(app)

app.listen(8000, () => {
  console.log('listening')
})