const topicModel = require('../dbs/model/topic')

class TopicController{
  async findAll(ctx){  
    ctx.body = await topicModel.find()
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