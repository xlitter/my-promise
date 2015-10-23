(function () {
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

		function _handler(value, status) {
			var then;
			
			if (_state.status !== pending) {
					return;
			}
			
			if (value === this.promise) {
					this.reject(new TypeError('Expected promise to be resolved with value other than itself '));
					return;
			}

			if (isObject(value) || isFunction(value)) {
				then = value.then;
			}

			if (isFunction(then)) {
				then.call(value, this.resolve.bind(this), this.reject.bind(this));
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
			enqueue(function () {
				for (len = messages.length; i < len; i++) {
					messages[i][_state.status](value);
				}
			});
		}

		return {
			resolve: function (value) {
				_handler.call(this, value, fulfilled);
			},
			reject: function (value) {
				_handler.call(this, value, rejected);
			},
			promise: {
				then: function (onFulfilled, onRejected) {
					var defer = deferred(),
						_resolveFunc = function (value) {
							try {
								value = isFunction(onFulfilled) ? onFulfilled(value) : value
								//保留新建defer的引用,以便可以向下调用
								defer.resolve(value);
							} catch (e) {
								defer.reject(e);
							}
						},
						_rejectFunc = function (value) {
							try {
								//onRejected是函数,则下一次使用resolve,而非继续reject
								isFunction(onRejected) && defer.resolve(onRejected(value)) || defer.reject(value);
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
						enqueue(function () {
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
		resolver(defer.resolve.bind(defer), defer.reject.bind(defer));
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