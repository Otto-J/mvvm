class Utils {}
/**
 * 代理函数，代理 vm.$data.xx ==> vm.xx
 * @param {*} data
 */
Utils.proxyData = (data) => {
  Object.keys(data).forEach((key) => {
    // 为当前实例做代理
    Object.defineProperty(vm, key, {
      get() {
        return vm.$data[key]
      },
      set(newVal) {
        vm.$data[key] = newVal
      },
    })
  })
}

/**
 * 定义数据响应式
 * @param {object} obj
 * @param {string} key
 * @param {any} val
 */
Utils.defineReactive = (obj, key, val) => {
  observe(val)

  // 每个key创建Dep实例
  const dep = new Dep()

  Object.defineProperty(obj, key, {
    get() {
      // console.log("get", key)
      // getter时添加依赖
      Dep.target && dep.addDep(Dep.target)

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
