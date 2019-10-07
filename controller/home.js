const path = require('path')

class HomeController {
  uploadFile(ctx){
    const file = ctx.request.files.file
    ctx.body = {
      path: `${ctx.origin}/uploads/${path.basename(file.path)}`
    }
  }
}

module.exports = new HomeController()