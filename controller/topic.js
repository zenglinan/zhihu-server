const topicModel = require('../dbs/model/topic')

class TopicController{
  async find(ctx){  // 分页查询, 页码从 0 开始
    let { per_page: perPageSum = 10, page = 0 } = ctx.query
    page = Math.max(+page, 0) // 负数检测过滤，最少第 0 页
    perPageSum = Math.max(+perPageSum, 1)  // 负数检测过滤，最少返回 1 条
    ctx.body = await topicModel.find().limit(perPageSum).skip(page*perPageSum)
  }

  async findById(ctx){
    const topic = await topicModel.findById(ctx.params.id).select('+introduction')
    ctx.body = {
      topic
    }
  }

  async create(ctx){
    ctx.verifyParams({
      name: { type: 'string' },
      avatar: { type: 'string', required: false },
      introduction: { type: 'string', required: false }
    })
    const newTopic = await new topicModel(ctx.request.body).save()
    ctx.body = {
      topic: newTopic
    }
  }

  async update(ctx){
    ctx.verifyParams({
      name: { type: 'string', required: false },
      avatar: { type: 'string', required: false },
      introduction: { type: 'string', required: false }
    })
    const topic = await topicModel.findByIdAndUpdate(ctx.params.id, ctx.request.body)
    ctx.body = topic
  }
}

module.exports = new TopicController()