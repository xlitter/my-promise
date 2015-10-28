(() => {
	var promise = new XPromise((resolve) => {
		resolve('测试');
	});

	promise = promise.then((data) => {
		console.log('second promise', data);
		return Object.create(Object.prototype, {
			then: {
				get: function () {
					throw undefined;
				}
			}
		});
	});

	promise.then((data)=>{
		console.log('resolve',data);
	}, (e)=>{
		console.log('reject', e);
	});

})();