(function() {
  'use strict';

  function enqueue(callback) {
    setTimeout(callback, 0);
  }
  function isObject(obj) {
    return obj !== null && typeof obj === 'object';
  }

  function isFunction(func) {
    return typeof func === 'function';
  }

  function deferred() {
    var pending = 'pending',
      fulfilled = 'fulfilled',
      rejected = 'rejected',
      _state = {
        status: pending,
        messages: [],
        value: void 0
      };

    function _resolved(value) {
      try {
        _handler.call(this, value, fulfilled);
      } catch (e) {
        _rejected.call(this, e);
      }
    }

    function _rejected(reason) {
      _handler.call(this, reason, rejected);
    }

    function _handler(value, status) {
      var then;

      if (_state.status !== pending) {
        return;
      }

      if (value === this.promise) {
        _rejected.call(this, new TypeError('Expected promise to be resolved with value other than itself '));
        return;
      }

      if (isObject(value) || isFunction(value)) {
        then = value.then;
      }

      if (isFunction(then) && status === fulfilled) {
        //当value为promise或thenable时,生成一个新的promise
        //用于确保promise的resolve方法只会执行一次,通过_state._process控制
        new Promise(then.bind(value)).then(_resolved.bind(this), _rejected.bind(this));
        return;
      }
      //此时仍调用当前对象的_state
      _state.status = status;
      _process(value);

    }

    function _process(value) {
      var i = 0, len,
        messages = _state.messages;

      _state.value = value;

      enqueue(function() {
        for (len = messages.length; i < len; i++) {
          messages[i][_state.status](value);
        }
        messages.length = 0;
      });
    }

    return {
      resolve: function(value) {
        if (_state._process) {
          return;
        }
        _state._process = true;

        _resolved.call(this, value);
      },
      reject: function(reason) {
        if (_state._process) {
          return;
        }
        _state._process = true;

        _rejected.call(this, reason);
      },
      promise: {
        then: function(onFulfilled, onRejected) {
          var defer = deferred(),
            _resolveFunc = function(value) {
              try {
                value = isFunction(onFulfilled) ? onFulfilled(value) : value
                //保留新建defer的引用,以便可以向下调用
                defer.resolve(value);
              } catch (e) {
                defer.reject(e);
              }
            },
            _rejectFunc = function(value) {
              try {
                //onRejected是函数,则下一次使用resolve,而非继续reject
                isFunction(onRejected) ? defer.resolve(onRejected(value)) : defer.reject(value);
              } catch (e) {
                defer.reject(e);
              }
            },
            handler = {};

          handler[fulfilled] = _resolveFunc;
          handler[rejected] = _rejectFunc;

          if (_state.status === pending) {
            _state.messages.push(handler);
          } else {
            enqueue(function() {
              handler[_state.status](_state.value);
            });

          }

          return defer.promise;
        }

      }
    }
  }

  function Promise(resolver) {
    var defer = deferred();
    try {
      resolver(defer.resolve.bind(defer), defer.reject.bind(defer));
    } catch (e) {
      defer.reject(e);
    }

    return defer.promise;

  }

  Promise.deferred = deferred;

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = Promise;
    }
  } else {
    this.XPromise = Promise;
  }

}).call(this);