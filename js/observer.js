/**
 * 执行数据响应式
 * @param {any} obj
 */
function observe(value) {
  if (!value || typeof value !== 'object') {
    return value
  }
  // return new Observer(value)
  new Observer(value)
}

class Observer {
  constructor(value) {
    this.value = value
    if (Array.isArray(value)) {
      //  to do
    } else {
      // 单独处理对象的响应式
      this.walk(value)
    }
  }
  /**
   * 设定对象响应式
   * @param {object} obj
   */
  walk(obj) {
    Object.keys(obj).forEach((key) => this.defineReactive(obj, key, obj[key]))
  }

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
        // Dep.target && dep.addSub(Dep.target)

        return val
      },
      set(newVal) {
        if (newVal !== val) {
          // console.log("set", key, newVal)
          val = newVal

          // 通知依赖更新
          dep.notify()
        }
      },
    })
  }

  /**
   * 定义数据响应式
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
          // console.log("set", key, newVal)
          val = newVal

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

// Dep.prototype = {
//   depend: function () {
//     Dep.target.addDep(this)
//   },
// }

Dep.target = null
