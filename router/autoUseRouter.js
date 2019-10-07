const fs = require('fs')

function autoUseRouter(app){
  fs.readdirSync(__dirname).forEach(file => {
    if(file === 'autoUseRouter.js'){
      return
    }
    const router = require(`./${file}`)
    app.use(router.routes()).use(router.allowedMethods())
  })
}

module.exports = autoUseRouter