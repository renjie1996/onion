const TYPEOF = Symbol('TYPEOF')
const IS_MIDDLEWARE = Symbol('IS_MIDDLEWARE')
const DECONSTRUCT = Symbol('DECONSTRUCT')
const RESULT = Symbol('RESULT')

/**
 * 中间件模式MWS(middleware-system)
 */
module.exports = class Onion {
  constructor () {
    this.middlewares = []
  }
  /**
   * 添加中间件
   */
  use(mw) {
    // 类型检查
    if('AsyncFunction'!== this[TYPEOF](mw) && 'Function' !== this[TYPEOF](mw) && 'Array' !== this[TYPEOF](mw)) {
      return new Error('use() arguments must be array or function')
    }
    const isMiddlewareFn = this[IS_MIDDLEWARE](mw)
    if(isMiddlewareFn) this.middlewares.push(mw)
    else this[DECONSTRUCT](mw)

    return this
  }

  /**
   * 遍历执行中间件
   */
  run() {
    return (ctx, next) => {
      let index = -1
      const that = this
      return peeling(0)
      function peeling(i) {
        if(i <= index) return Promise.reject(new new Error('next在一个中间件函数中只能调用一次'))
        index = i
        let middlewareFn = that.middlewares[i]
        if(that.middlewares.length === i) middlewareFn = next
        if(!middlewareFn) return Promise.resolve(ctx)

        return Promise.resolve(middlewareFn(ctx, function next() {
          return peeling(i+1)
        }))
      }
    }
  }

   /**
   * 递归解构中间件数组
   */
  [DECONSTRUCT](mw) {
    // 类型检查
    const type = this[TYPEOF](mw)
    if('AsyncFunction' !== type && 'Function' !== type && 'Array' !== type) {
      return new Error('use() arguments must be array or function')
    }

    if('AsyncFunction' === type || 'Function' === type) {
      this.middlewares.push(mw)
    } else {
      for(let i = 0, len = mw.length; i < len; i++) this[DECONSTRUCT](mw[i])
    }
  }

  /**
   * 中间件或中间件数组
   * true(是中间件) && false(是中间件数组)
   */
  [IS_MIDDLEWARE](mw) {
    const type = this[TYPEOF](mw)
    return ('AsyncFunction' === type || 'Function' === type) ? true : false
  }

  /**
   * 类型判断
   */
  [TYPEOF](mw) {
    return Object.prototype.toString.call(mw).split(' ')[1].split(']')[0]
  }

}