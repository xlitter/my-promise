(() => {
	var prm1 = new XPromise(function (resolve, reject) {

				resolve('abc');
	});

	prm1 = prm1.then(function (data) {
				console.log('prm1 second', data);
				return {
			then: function (resolved) {
				setTimeout(function () {
					resolved({
						then: function (onFulfilled) {
							onFulfilled('123');
							throw { other: 'other' };
						}
					});
				}, 0);

			}
				};
	});

	prm1.then(function (data) {
				console.log('prm1 resolve', data);
	}, function (reason) {
				console.log('prm1 reject----------', reason);
	});
})();