const Router = require('koa-router')
const user = require('../controller/user')
const jwt = require('koa-jwt')
const { secret } = require('../dbs/config')

const router = new Router({
  prefix: "/users"
})

const auth = jwt({ secret })

router.get('/', user.find)

router.post('/', user.create)

router.get('/:id', user.findById)

router.delete('/:id', auth, user.checkOwner, user.delete)

router.patch('/update/:id', auth, user.checkOwner, user.update)

router.post('/login', user.login)

router.get('/:id/following', user.getFollowingList)

router.get('/:id/follower', user.getFollowerList)

router.patch('/follow/:id', auth, user.checkUserExist, user.follow)

router.delete('/unfollow/:id', auth, user.checkUserExist, user.unfollow)

router.get('/:id/topics', auth, user.getFollowingTopic)

router.patch('/follow_topic/:id', auth, user.followTopic)

router.delete('/unfollow_topic/:id', auth, user.unfollowTopic)

module.exports = router