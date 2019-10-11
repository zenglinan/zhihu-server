## HTTP 状态码
- 204: 成功但无返回内容，例：删除用户
- 409: 请求发生冲突，例：注册用户时，用户名已存在
- 401: 缺乏身份凭证，例：登录时，用户名或密码不正确
- 403: 没有权限
## HTTP OPTIONS
OPTIONS 方法的作用:
- 向服务器请求该接口所支持的方法
- CORS 的预检请求

## Koa allowedMethods 
Koa 中用 koa-router 的 allowedMethods 响应 OPTIONS 请求, 返回可用的方法
```JavaScript
app.use(userRouter.allowedMethods())
```

#### allowedMethods 返回的 405 和 501
- 405 表示该请求方法被 koa-router 支持, 但是没有实现
- 501 表示该方法不被 koa-router 支持

koa-router 支持的请求方法有: GET POST PUT PATCH DELETE OPTIONS(用 allowedMethods 支持)

## jsonwebtoken


## 获取一些请求参数
- query：ctx.query
- 路由参数：比如 /:id, ctx.params
- 请求体 body：用 koa-bodyparser 中间件解析后，在 ctx.request.body 中
- header：ctx.header

## 响应数据
- status：ctx.status
- 响应体：ctx.body
- header：ctx.set('Content-Type', 'xxxx')

## 错误处理
koa 自带的错误处理：遇到错误时，ctx.throw(412, "id 不存在")
koa-json-error：
```javascript
app.use(error({
  postFormat: (e, {stack, ...rest}) => {
    const env = process.env.NODE_ENV
    return env === 'production' ? {...rest} : {stack, ...rest}
  }
}))
```

## 设置环境变量
在 package.json 的运行命令里设置即可
但是注意，在 windows 环境下会报错，需要安装 cross-env 包，只需在开发阶段使用这个包，生产环境下部署到 linux 服务器上了
```javascript
{
  "start": "cross-env NODE_ENV=production nodemon app"
  "dev": "nodemon app"
}
```

## koa-parameter 校验参数
```javascript
app.use(parameter(app)) // 注册的时候传入 app 实例，koa-parameter 会给 ctx 注册一个实例方法供给校验

// 校验
ctx.verifyParams({
  name: { type: 'string', required: true },
  name: { type: 'number', required: true }
})

```
## session
### session 的优势
- 相比 JWT，最大优势就是可以主动清除 session
- session 保存在服务端，相对安全
- session 比较灵活，客户端可以主动清除，服务端也可以主动清除

### session 的劣势
- 如果使用分布式部署，需要做多机共享 session 机制
- 基于 cookie 机制可能会被 CSRF 攻击
- 查询 session 需要进行数据库查询操作，需要损耗一定性能

### JWT vs session
- JWT 扩展性好
- JWT 每次客户端向服务端发送的请求里面可能携带大量用户信息的载荷，相比于 session-id 要大得多，但 JWT 不用查询数据库
- JWT 时效性没有 session 好，session 机制下服务端可以主动销毁 session-id，但 JWT 只能等过期时间到

## Schema 设置字段默认不被选中
```javascript
const UserSchema = new Schema({
  name: { type: String, required: true },
  password: { type: String, required: true, select: false }
})
```
通过设置 select 为 false，在 find 的时候默认该项不被选中，除非主动 select：
```javascript
const users = await userModel.find().select('+password')
```

## 路由函数 this 失效问题
```javascript
class User{
  find(){
    console.log(this)
  }
}

const user = new User()

router.get('/', user.find)  // this  为undefined
```
传递给 router 的只是函数的引用，执行时相当于直接调用函数 ```xxx()```，丢失了 this，如果需要用到 this，需要这样使用：
```javascript
router.get('/', async (ctx) => {
  user.find(ctx)
})
```

## 自写 Koa 中间件
1. 自动加载路由
2. 错误处理
3. jwt 认证授权

## async await
搞不懂

## 登录授权认证
1. 用户登录，服务器检查用户名密码是否正确，无误则返回 token，不正确则抛出 401
2. 前端带着 token 访问其他接口，服务器获取 token，进行 token 校验，不合法则返回，合法则检验权限
3. 检验用户是否有权限(比如修改用户接口只能修改自己的)，无权限则抛出 403

## 上传图片方案
- 阿里云 OSS 等云服务
- 直接上传到服务器(不推荐，服务器挂掉后会丢失数据)

使用 koa-body 解析上传的文件并保存到配置路径
使用 koa-static 生成图片链接
```javascript
`${ctx.origin}/uploads/${path.basename(file.path)}`
```
url 不能写死，不然上线后还需要修改。用ctx.origin 可以获取请求的来源，path.basename 可以返回路径的最后一部分

## 用户列表返回字段的过滤
mongodb 可以用 ```select: false``` 默认隐藏一些字段，当需要显示时，通过 ```find().select('+xxx +yyy')``` 加入字段

在用户 Schema 中默认不显示的字段，加上 ```select: false```，当需要显示默认隐藏字段时，

前端在查询参数中写入字段名 ```?fields=resident;career```, 以分号隔开。

后端获取查询参数中的字段，在查询时加上这些字段
```javascript
const queryFields = ctx.query.fields
const formatFields = queryFields.split(';').filter(f => f).map(f => `+${f}`).join(' ')
const user = await userModel.findById(ctx.params.id).select(formatFields)
```

## 我关注的人与关注我的人
我关注的人的 Schema 设计，关注的人保存的是用户的 id，类型可以跟 User 里面的 id 关联起来
```javascript
followings: {
  type: [{
    type: Schema.Types.ObjectId, ref: 'User'
  }],
  select: false
}
```

### 获取我关注的人列表
当获取```我关注的人```的列表时，除了需要获取到那些用户的 id，还需要获取一些基本用户信息，

通过 populate 可以填充数据，前提是对应字段的类型关联了 User 里的 ObjectId
```javascript
userModel.findById(ctx.params.id).select('+followings').populate('followings')
```
### 关注
只需将当前登录用户的 followings 字段添加 关注的人的 id 即可

这里要注意的是：

followings 虽然是数组，但是没有 js 数组的方法，需要进行转换
字段也需要转换成字符串

```javascript
if(!me.followings.map(id => id.toString()).includes(targetUserId)){
  // ...
}
```
### 获取粉丝列表
因为粉丝不同于关注的人，关注的人不会特别多，但粉丝可能会很多，所以不适合作为 Schema 的字段，只需要查找所有用户，找出关注的人包含指定 id 的用户，就可以找出指定 id 用户的粉丝列表

mongoose 的语法里，要找出指定字段包含某个内容时十分灵活，比如：followings 是数组，如下匹配即可
```javascript
  const followers = await userModel.find({ followings: ctx.params.id })
```

### 分页查询
利用 mongodb 的 limit 限制返回的条数(每页条数)，用 skip 跳过的条数(页码 * 每页的条数)。页码从 0 开始，就不用 - 1
```javascript
topicModel.find().limit(perPageSum).skip(page*perPageSum)
```