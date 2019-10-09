const userModel = require('../dbs/model/user')
const jsonwebtoken = require('jsonwebtoken')
const secret = 'i_love_linan_#HaHa'

class UserController {

  async checkOwner(ctx, next){  // 权限校验, 操作 id 是否为当前登录 id
    if(ctx.params.id !== ctx.state.user._id){
      ctx.throw(403, '没有权限')
    }
    await next()
  }

  async find(ctx) {
    const users = await userModel.find()
    ctx.body = { users }
  }

  async findById(ctx){
    // 通过查询参数 fields 指定要显示的默认隐藏字段
    const queryFields = ctx.query.fields || ''
    const formatFields = queryFields.split(';').filter(f => f).map(f => `+${f}`).join(' ')
    const user = await userModel.findById(ctx.params.id).select(formatFields)
    ctx.body = user
  }

  async create(ctx){
    ctx.verifyParams({
      name: { type: 'string', required: true },
      password: { type: 'string', require: true },
      sex: { type: 'string', required: true}
    })
    const { name } = ctx.request.body
    const username = await userModel.findOne({ name })
    if(username) { 
      ctx.throw(409, '用户名已被占用')
    }
    const user = await new userModel(ctx.request.body).save()
    ctx.body = user
  }

  async update(ctx){  // 更新用户资料
    ctx.verifyParams({
      name: { type: 'string', required: false },
      password: { type: 'string', required: false },
      banner: { type: 'string', required: false },
      avatar: { type: 'string', required: false },
      sex: { type: 'string', required: false },
      headline: { type: 'string', required: false },
      resident: { type: 'array', itemType: 'string', required: false},
      career : { type: 'array', itemType: 'object', required: false },
      educations: { type: 'array', itemType: 'object', required: false }
    })
    const user = await userModel.findByIdAndUpdate(ctx.params.id, ctx.request.body)
    if(!user) {
      ctx.throw(404, '用户不存在')
    }
    ctx.body = user
  }
  async delete(ctx){  // 删除用户
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

  async getFollowingList(ctx){  // 关注的人列表
    const userWithFollowings = await userModel.findById(ctx.params.id).select('+followings').populate('followings')
    if(!userWithFollowings){
      ctx.throw(404, '用户不存在')
    }
    ctx.body = userWithFollowings.followings
  }

  async follow(ctx){  // 关注某个用户
    const myId = ctx.state.user._id
    const targetUserId = ctx.params.id
    const me = await userModel.findById(myId).select('+followings')
    if(!me.followings.map(id => id.toString()).includes(targetUserId)){
      me.followings.push(targetUserId)
      me.save()
      ctx.status = 204
    }
  }
}

module.exports = new UserController()