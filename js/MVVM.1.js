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
    // 这里要操作 this，所以要分开传递
    this.proxyData(this.$data, this)

    // 执行编译
    new Compiler(options.el, this)
  }
  $watch() {}

  /**
   * 代理函数，代理 vm.$data.xx ==> vm.xx
   * @param {*} $data
   * @param {*} this
   */
  proxyData($data, that) {
    Object.keys($data).forEach((dataKey) => {
      // 为当前实例做代理
      Object.defineProperty(that, dataKey, {
        get() {
          return $data[dataKey]
        },
        set(val) {
          //  后续这里可能还会set一个对象，要兼容
          $data[dataKey] = val
        },
      })
    })
  }
}
