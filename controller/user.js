const userModel = require('../dbs/model/user')
const jsonwebtoken = require('jsonwebtoken')
const { secret } = require('../dbs/config')

class UserController {

  async checkUserExist(ctx, next) {
    const user = await userModel.findById(ctx.params.id)
      .catch(e => { ctx.throw(404, '用户不存在') })
    await next();
  }

  async checkOwner(ctx, next){  // 权限校验, 操作 id 是否为当前登录 id
    if(ctx.params.id !== ctx.state.user._id){
      ctx.throw(403, '没有权限')
    }
    await next()
  }

  async find(ctx) {
    let { per_page: perPageSum = 10, page = 0 } = ctx.query
    page = Math.max(+page, 0) // 负数检测过滤，最少第 0 页
    perPageSum = Math.max(+perPageSum, 1)  // 负数检测过滤，最少返回 1 条
    const users = await userModel
      .find({ name: new RegExp(ctx.query.keyword) })
      .limit(perPageSum).skip(page*perPageSum)
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
    const userWithFollowings = await userModel
      .findById(ctx.params.id)
      .select('+followings').populate('followings')
    if(!userWithFollowings){
      ctx.throw(404, '用户不存在')
    }
    ctx.body = userWithFollowings.followings
  }

  async getFollowerList(ctx){
    const followers = await userModel.find({ followings: ctx.params.id })
    ctx.body = followers
  }

  async follow(ctx){  // 关注某个用户
    const myId = ctx.state.user._id
    const targetUserId = ctx.params.id
    const me = await userModel.findById(myId).select('+followings')
    if(!me.followings.map(id => id.toString()).includes(targetUserId)){
      me.followings.push(targetUserId)
      me.save()
      ctx.status = 204
    }else {
      ctx.body = '请勿重复关注！'
    }
  }

  async unfollow(ctx){
    const myId = ctx.state.user._id // 当前登录用户的 id
    const targetUserId = ctx.params.id
    const me = await userModel.findById(myId).select('+followings')
    const targetIndex = me.followings.map(id => id.toString()).indexOf(targetUserId)  // 目标用户的 id 在关注列表中的索引
    if(targetIndex > -1){
      me.followings.splice(targetIndex, 1)
      me.save()
    }
    ctx.status = 204
  }

  async followTopic(ctx){ // 关注话题
    const myId = ctx.state.user._id
    const topicId = ctx.params.id
    const me = await userModel.findById(myId).select('+followingTopics')
    if(me.followingTopics.indexOf(topicId) === -1){
      me.followingTopics.push(topicId)
      me.save()
      ctx.status = 204
    }
    ctx.body = '请勿重复关注同一话题！'
  }

  async unfollowTopic(ctx){
    const myId = ctx.state.user._id
    const topicId = ctx.params.id
    const me = await userModel.findById(myId).select('+followingTopics')
    const targetIndex = me.followingTopics.map(id => id.toString()).indexOf(topicId)
    if(targetIndex !== -1){
      me.followingTopics.splice(targetIndex, 1)
      me.save()
      ctx.status = 204
    }
    ctx.body = '该用户尚未关注此话题！'
  }

  async getFollowingTopic(ctx){ // 获取用户关注的话题
    const id = ctx.params.id
    const user = await userModel
      .findById(id)
      .select('+followingTopics')
      .populate('followingTopics')
    ctx.body = { topics: user.followingTopics }
  }
}

module.exports = new UserController()