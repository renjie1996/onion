const Onion = require('./common-middleware')
const log = console.log.bind(console)

const mw1 = async (ctx, next) => {
  log('中间件1开始执行, 设置ctx.md1 = true')
  ctx.md1 = true
  await next()
}

const mw2 = async (ctx, next) => {
  log('中间件2开始执行, 设置ctx.md2 = true')
  setTimeout(async () => {
    ctx.md2 = true
    await next()
  }, 3000) 
}

const mw3 = async (ctx, next) => {
  log('中间件3开始执行, 设置ctx.md3 = false')
  setTimeout(async () => {
    ctx.md3 = false
    await next()
  }, 1000) 

}

const arr = [mw1, [mw3, mw2], mw3]
const ctx = {}
const onion = new Onion()
const run = onion.use(mw2).use(arr).run()

run(ctx, r => log(r))
