/**
 * 执行数据响应式 为啥分开写，方便里面递归
 * @param {any} obj this.$data 必须是一个对象
 */
function observe(value) {
  // 忽略null和非object
  if (!value || typeof value !== 'object') {
    return value
  }
  new Observer(value)
}

class Observer {
  /**
   * 初始化 暂时只考虑 对象和数组两种类型
   * @param {object | array} value
   */
  constructor(value) {
    this.value = value
    if (Array.isArray(value)) {
      //  to do
      this.arr(value)
    } else {
      // 单独处理对象的响应式
      this.walk(value)
    }
  }

  /**
   * 设定数组响应式
   * @param {array} arr
   */
  arr(arr) {
    // 为什么是这七个 url https://cn.vuejs.org/v2/guide/list.html#%E5%8F%98%E6%9B%B4%E6%96%B9%E6%B3%95
    const arrMethods = [
      'push',
      'pop',
      'shift',
      'unshift',
      'splice',
      'sort',
      'reverse',
    ]

    // 保存数组原来的原型
    const oldPrototype = Array.prototype
    // 创建一个新的
    const newPrototype = Object.create(origanPrototype)

    // 重写数组的方法，在旧方法的基础上增加代码
    arrMethods.forEach((method) => {
      newPrototype[method] = function () {
        // console.log(method)
        // 旧方法
        oldPrototype[method].apply(this, arguments)
      }
    })
  }

  /**
   * 设定对象响应式
   * @param {object} obj
   */
  walk(obj) {
    Object.keys(obj).forEach((key) => this.defineReactive(obj, key, obj[key]))
  }

  /**
   *
   * @param {*} obj
   * @param {*} key
   * @param {*} val
   */

  /**
   * 定义对象数据响应式
   * @param {object} obj
   * @param {string} key
   * @param {any} val
   */
  defineReactive(obj, key, val) {
    observe(val)

    // 每个key创建Dep实例
    const dep = new Dep()

    Object.defineProperty(obj, key, {
      get() {
        // console.log("get", key)
        // getter时添加依赖
        Dep.target && dep.addSub(Dep.target)

        return val
      },
      set(newVal) {
        if (newVal !== val) {
          console.log('set', key, newVal)
          val = newVal
          // 处理重新赋值对象的情况，vm.class
          observe(newVal)

          // 通知依赖更新
          dep.notify()
        }
      },
    })
  }
}

let uid = 0

// Dep 管理多个watcher实例，如果key发生变化同时对应的watcher
class Dep {
  constructor() {
    this.id = uid++
    this.subs = []
  }

  addSub(sub) {
    this.subs.push(sub)
  }

  removeSub(sub) {
    var index = this.subs.indexOf(sub)
    if (index > -1) {
      this.subs.splice(index, 1)
    }
  }

  notify() {
    this.subs.forEach((sub) => sub.update())
  }
}

// Dep.target = null
