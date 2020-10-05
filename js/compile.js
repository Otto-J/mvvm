class Compiler {
  /**
   * 实现 new Compiler(el, vm)
   * @param {string|HTMLElement} el 页面宿主选择器
   * @param {MVVM} vm MVVM的实例
   */
  constructor(el, vm) {
    this.$el = this.isElementNode(el) ? el : document.querySelector(el)
    this.$vm = vm

    this.$el && this.compile(this.$el)
  }

  /**
   * 是否是指令
   * @param {string}} attr 属性值
   */
  isDirective(attr) {
    return attr.startsWith('v-')
  }

  /**
   * 是否是事件 要处理两种
   * @param {string}} attr 属性值
   */
  isEventDirectiveWithOn(dir) {
    return dir.startsWith('on:')
  }
  isEventDirectiveWithAt(dir) {
    return dir.startsWith('@')
  }

  /**
   * 判断是否是元素节点
   * @param {string} el 选择器
   * @return {boolean}
   */
  isElementNode(el) {
    return el.nodeType === 1
  }

  /**
   * 判断是否是文本节点 且 包含 {{}}
   * @param {HTMLElement} node
   */
  isInter(node) {
    // 如果能匹配到，就放到 RegExp.$1
    return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent)
  }

  /**
   * 遍历子元素，判断类型并响应处理
   * @param {HTMLElement} element
   */
  compile(element) {
    let fragment = document.createDocumentFragment()
    let child
    while ((child = element.firstChild)) {
      fragment.appendChild(child)
    }

    const repeat = (fragment) => {
      Array.from(fragment.childNodes).forEach((node) => {
        if (this.isElementNode(node)) {
          // 如果是元素
          // console.log('编译元素', node.nodeName)
          this.compileElement(node)
        } else if (this.isInter(node)) {
          // console.log('文本节点', node.textContent)
          this.compileText(node)
        }
        // 还要考虑递归
        if (node.childNodes.length) {
          repeat(node)
        }
      })
    }
    repeat(fragment)

    element.appendChild(fragment)
  }

  /**
   * 编译 v-text v-html 等事件和指令
   * @param {HTMLElement} node
   */
  compileElement(node) {
    const { attributes } = node

    Array.from(attributes).forEach((attr) => {
      // attr 是一个对象 {name, value} v-text=counter
      const { name, value } = attr
      // 判断是否是一个指令 v- 开头
      if (this.isDirective(name)) {
        // 获取指令 dir
        // const dir = name.substring(2) 等同
        const [, dir] = name.split('-')
        // eg: text html model
        this.update(node, value, dir)
      } else if (this.isEventDirectiveWithOn(name)) {
        // 观察是否有on-开头的事件
      } else if (this.isEventDirectiveWithAt(name)) {
        // 观察是否有@开头的事件
      }
    })
  }

  /**
   * compoileText 绑定插值
   * @param {HTMLelement} node
   */
  compileText(node) {
    // DOM 操作 获取匹配的表达式 eg: counter --> this.counter
    // 这里的 RegExp.$1 拿到的就是 'counter'
    // 这里还要考虑 this.a.b 获取嵌套的值 和 <p>值-{{a}}-</p> 插值在中间的情况
    this.update(node, RegExp.$1, 'text')
  }

  /**
   * 提取一个通用的update方法，统一收口方便统一操作
   * @param {HTMLElement} node 节点
   * @param {string} data eg this.x
   * @param {string} dir 是指令名 eg text
   */
  update(node, data, dir) {
    const fn = this[dir + 'Updater']
    data = data.trim() // 避免左右空格
    // eg this.textUpdater
    // 这里要考虑 传入 a.b 的情况
    const arr = data.split('.') // ['a','b']

    let flatData = this.$vm

    arr.forEach((key) => (flatData = flatData[key]))
    // arr.reduce((acc, cur) => {},this.$vm)

    fn && fn(node, flatData)

    // Watcher
    // new Watcher(this.$vm, data, (value) => {
    //   fn && fn(node, value)
    // })
  }

  /**
   * 更新节点，替代 text方法
   * @param {HTMLElement} node
   * @param {*} value
   */
  textUpdater(node, value) {
    console.log(node, value)
    if (node.textContent) {
      // 要考虑
      node.textContent = node.textContent.replace(/\{\{(.*)\}\}/, value)
    } else {
      node.textContent = value
    }
  }

  /**
   * 更新节点，替代 html
   * @param {HTMLElement} node
   * @param {*} value
   */
  htmlUpdater(node, value) {
    node.innerHTML = value
  }

  modelUpdater() {}
}
function Compile2(el, vm) {
  if (this.$el) {
    this.$fragment = this.node2Fragment(this.$el)
    this.init()
    this.$el.appendChild(this.$fragment)
  }
}

Compile2.prototype = {
  // constructor: Compile,
  node2Fragment: function (el) {
    var fragment = document.createDocumentFragment(),
      child

    // 将原生节点拷贝到fragment
    while ((child = el.firstChild)) {
      fragment.appendChild(child)
    }

    return fragment
  },

  init: function () {
    this.compileElement(this.$fragment)
  },

  compileElement: function (el) {
    var childNodes = el.childNodes,
      me = this

    ;[].slice.call(childNodes).forEach(function (node) {
      var text = node.textContent
      var reg = /\{\{(.*)\}\}/

      if (me.isElementNode(node)) {
        me.compile(node)
      } else if (me.isTextNode(node) && reg.test(text)) {
        me.compileText(node, RegExp.$1.trim())
      }

      if (node.childNodes && node.childNodes.length) {
        me.compileElement(node)
      }
    })
  },

  compile: function (node) {
    var nodeAttrs = node.attributes,
      me = this

    ;[].slice.call(nodeAttrs).forEach(function (attr) {
      var attrName = attr.name
      if (me.isDirective(attrName)) {
        var exp = attr.value
        var dir = attrName.substring(2)
        // 事件指令
        if (me.isEventDirective(dir)) {
          compileUtil.eventHandler(node, me.$vm, exp, dir)
          // 普通指令
        } else {
          compileUtil[dir] && compileUtil[dir](node, me.$vm, exp)
        }

        node.removeAttribute(attrName)
      }
    })
  },

  compileText: function (node, exp) {
    compileUtil.text(node, this.$vm, exp)
  },

  isDirective: function (attr) {
    return attr.indexOf('v-') == 0
  },

  isEventDirective: function (dir) {
    return dir.indexOf('on') === 0
  },

  isElementNode: function (node) {
    return node.nodeType == 1
  },

  isTextNode: function (node) {
    return node.nodeType == 3
  },
}

// 指令处理集合
var compileUtil = {
  model: function (node, vm, exp) {
    this.bind(node, vm, exp, 'model')

    var me = this,
      val = this._getVMVal(vm, exp)
    node.addEventListener('input', function (e) {
      var newValue = e.target.value
      if (val === newValue) {
        return
      }

      me._setVMVal(vm, exp, newValue)
      val = newValue
    })
  },

  class: function (node, vm, exp) {
    this.bind(node, vm, exp, 'class')
  },

  bind: function (node, vm, exp, dir) {
    var updaterFn = updater[dir + 'Updater']

    updaterFn && updaterFn(node, this._getVMVal(vm, exp))

    new Watcher(vm, exp, function (value, oldValue) {
      updaterFn && updaterFn(node, value, oldValue)
    })
  },

  // 事件处理
  eventHandler: function (node, vm, exp, dir) {
    var eventType = dir.split(':')[1],
      fn = vm.$options.methods && vm.$options.methods[exp]

    if (eventType && fn) {
      node.addEventListener(eventType, fn.bind(vm), false)
    }
  },

  _getVMVal: function (vm, exp) {
    var val = vm
    exp = exp.split('.')
    exp.forEach(function (k) {
      val = val[k]
    })
    return val
  },

  _setVMVal: function (vm, exp, value) {
    var val = vm
    exp = exp.split('.')
    exp.forEach(function (k, i) {
      // 非最后一个key，更新val的值
      if (i < exp.length - 1) {
        val = val[k]
      } else {
        val[k] = value
      }
    })
  },
}

var updater = {
  classUpdater: function (node, value, oldValue) {
    var className = node.className
    className = className.replace(oldValue, '').replace(/\s$/, '')

    var space = className && String(value) ? ' ' : ''

    node.className = className + space + value
  },

  modelUpdater: function (node, value, oldValue) {
    node.value = typeof value == 'undefined' ? '' : value
  },
}
