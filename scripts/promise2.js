(function (global, undefined) {
  'use strict';

  var PENDING = 'PENDING',
    FULFILLED = 'FULFILLED',
    REJECTED = 'REJECTED';

  function enqueue(fn) {
    setTimeout(fn, 0);
  }
  function extend(d, s) {
    var k;
    for (k in s) {
      if (s.hasOwnProperty(k)) {
        d[k] = s[k];
      }
    }
    return d;
  }

  function isObject(o) {
    return o === Object(o);
  }

  function isFunction(f) {
    return typeof f === 'function';
  }

  function _resolve(promise, _state, v) {
    try {
      _handle(promise, _state, FULFILLED, v);
    } catch (e) {
      _reject(promise, _state, e);
    }
  }

  function _reject(promise, _state, r) {
    _handle(promise, _state, REJECTED, r);
  }

  function _handle(promise, _state, status, value) {
    var then;
    if (_state.status !== PENDING) {
      return;
    }

    if (promise === value) {
      _reject(promise, _state, new TypeError('Expected promise to be resolved with value other than itself'));
      return;
    }

    if (isObject(value)) {
      then = value.then;
    }

    if (isFunction(then) && status === FULFILLED) {
      new Promise(then.bind(value)).then(function (v) {
        _resolve(promise, _state, v);
      }, function (reason) {
        _reject(promise, _state, reason)
      });
      return;
    }
    _state.status = status;
    _state.value = value;
    
    // async exec
    enqueue(function () {
      _process(_state);
    });
  }

  function _process(_state) {
    var messages = _state.messages,
      status = _state.status,
      value = _state.value,
      i, len = messages.length;

    for (i = 0; i < len; i++) {
      messages[i][status](value);
    }
  }

  function Promise(resolver) {
    var that = this,
      _state = {
        status: PENDING,
        messages: [],
        value: void 0,
        //是否已执行
        process: false
      };

    function resolve(v) {
      if (_state.process) {
        return;
      }
      _state.process = true;
      _resolve(that, _state, v);
    }

    function reject(r) {
      if (_state.process) {
        return;
      }
      _state.process = true;
      _reject(that, _state, r);
    }

    this.then = function (onFulfilled, onRejected) {
      return new Promise(function (resolve, reject) {
        var resolveFunc = function (v) {
          try {
            isFunction(onFulfilled) ? resolve(onFulfilled(v)) : resolve(v);
          } catch (e) {
            reject(e);
          }
        }, rejectFunc = function (reason) {
          try {
            isFunction(onRejected) ? resolve(onRejected(reason)) : reject(reason);
          } catch (e) {
            reject(e);
          }
        }, handler = {
          FULFILLED: resolveFunc,
          REJECTED: rejectFunc
        };

        if (_state.status === PENDING) {
          _state.messages.push(handler);
        } else {
          // async exec
          enqueue(function () {
            handler[_state.status](_state.value);
          });
        }
      });
    };
    
    // call resolver
    try {
      resolver(resolve, reject);
    } catch (e) {
      reject(e);
    }

  }

  Promise.resolved = Promise.resovle = function (v) {
    return new Promise(function (resolve) {
      resolve(v);
    });
  };

  Promise.rejected = Promise.reject = function (reason) {
    return new Promise(function (resolve, reject) {
      reject(reason);
    });
  };

  Promise.deferred = function () {
    var defer = {};
    defer.promise = new Promise(function (resolve, reject) {
      defer.resolve = resolve;
      defer.reject = reject;
    });
    return defer;
  };

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = Promise;
    }
  } else {
    this.XPromise2 = Promise;
  }
})(this, undefined);