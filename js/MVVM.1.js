class MVVM {
  /**
   * 拿到用户传入的 options 初始化
   * @param {object} options 配置项
   */
  constructor(options) {
    this.$options = options
    this.$data = options.data

    // 响应式对象
    observe(this.$data)

    // 需要做代理，一般直接通过vm.xxx 而不是vm.$data.xx
    this.proxyData(this, '$data')

    // 执行编译
    new Compiler(options.el, this)
  }
  $watch() {}

  /**
   * 代理函数，代理 vm.$data.xx ==> vm.xx
   * @param {*} vm
   * @param {*} data
   */
  proxyData(vm, key) {
    Object.keys(vm[key]).forEach((i) => {
      // 为当前实例做代理
      Object.defineProperty(vm, i, {
        get() {
          return vm[key][i]
        },
        set(val) {
          vm[key][i] = val
        },
      })
    })
  }
}
