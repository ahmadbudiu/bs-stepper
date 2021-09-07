let matches = (typeof window !== 'undefined') ? window.Element.prototype.matches : undefined
let closest = (element, selector) => element.closest(selector)
let WinEvent = (inType, params) => (typeof window !== 'undefined') ? new window.Event(inType, params) : undefined
let createCustomEvent = (eventName, params) => {
  const cEvent = (typeof window !== 'undefined') ? new window.CustomEvent(eventName, params) : undefined

  return cEvent
}

/* istanbul ignore next */
function polyfill () {
  if (typeof window !== 'undefined' && !window.Element.prototype.matches) {
    matches = window.Element.prototype.msMatchesSelector ||
      window.Element.prototype.webkitMatchesSelector
  }

  if (typeof window !== 'undefined' && !window.Element.prototype.closest) {
    closest = (element, selector) => {
      if (!document.documentElement.contains(element)) {
        return null
      }

      do {
        if (matches.call(element, selector)) {
          return element
        }

        element = element.parentElement || element.parentNode
      } while (element !== null && element.nodeType === 1)

      return null
    }
  }

  if (typeof window !== 'undefined' && (!window.Event || typeof window.Event !== 'function')) {
    WinEvent = (inType, params = {}) => {
      const e = document.createEvent('Event')
      e.initEvent(inType, Boolean(params.bubbles), Boolean(params.cancelable))
      return e
    }
  }

  if (typeof window !== 'undefined' && typeof window.CustomEvent !== 'function') {
    const originPreventDefault = window.Event.prototype.preventDefault

    createCustomEvent = (eventName, params) => {
      const evt = document.createEvent('CustomEvent')

      params = params || { bubbles: false, cancelable: false, detail: null }
      evt.initCustomEvent(eventName, params.bubbles, params.cancelable, params.detail)
      evt.preventDefault = function () {
        if (!this.cancelable) {
          return
        }

        originPreventDefault.call(this)
        Object.defineProperty(this, 'defaultPrevented', {
          get: function () { return true }
        })
      }

      return evt
    }
  }
}

polyfill()

export {
  closest,
  WinEvent,
  createCustomEvent
}
