const userModel = require('../dbs/model/user')
const jsonwebtoken = require('jsonwebtoken')
const jwt = require('koa-jwt')
const secret = 'i_love_linan_#HaHa'

class UserController {
  async auth(ctx, next) { // 登录认证
    const result = await jwt({ secret, key: 'user' })
    await next()
  }

  async checkOwner(ctx, next){  // 权限校验, 操作 id 是否为当前登录 id
    if(ctx.params.id !== ctx.state.user._id){
      ctx.throw(403, '无此权限')
    }
    await next()
  }

  async find(ctx) {
    const users = await userModel.find()
    ctx.body = { users }
  }

  async findById(ctx){
    const user = await userModel.findById(ctx.params.id)
    ctx.body = user
  }

  async create(ctx){
    ctx.verifyParams({
      name: { type: 'string', required: true },
      password: { type: 'string', require: true }
    })
    const { name } = ctx.request.body
    const username = await userModel.findOne({ name })
    if(username) { 
      ctx.throw(409, '用户名已被占用')
    }
    const user = await new userModel(ctx.request.body).save()
    ctx.body = user
  }

  async update(ctx){
    ctx.verifyParams({
      name: { type: 'string', required: false },
      password: { type: 'string', required: false }
    })
    const user = await userModel.findByIdAndUpdate(ctx.params.id, ctx.request.body)
    if(!user) { 
      ctx.throw(404, '用户不存在')
    }
    ctx.body = user
  }
  async delete(ctx){
    const user = await userModel.findByIdAndRemove(ctx.params.id, ctx.request.id)
    if(!user) {
      ctx.throw(404, '用户不存在')
    }
    ctx.status = 204
  }
  
  async login(ctx){
    ctx.verifyParams({
      name: { type: 'string', required: true },
      password: { type: 'string', required: true }    
    })
    const user = await userModel.findOne(ctx.request.body)
    if(!user) {
      ctx.throw(401, '用户名或密码错误')
    }
    const { _id, name } = user
    const token = jsonwebtoken.sign({_id, name}, secret, { expiresIn: '1d' })
    ctx.body = { token, name, _id }
  }
}

module.exports = new UserController()