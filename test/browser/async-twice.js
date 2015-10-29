/*global XPromise */
(() => {
	'use strict';
	var prm1 = new XPromise(function (resolve, reject) {

				resolve('abc');
	});

	prm1 = prm1.then(function (data) {
				console.log('prm1 second', data);
				return {
					then: function (resolved) {
						resolved({
							then: function (onFulfilled) {
								setTimeout(()=>{
									onFulfilled('123');
								});
							}
						});
						
						resolved({other:'other'});
					}
				};
	});

	prm1.then(function (data) {
				console.log('prm1 resolve', data);
	}, function (data) {
				console.log('prm1 reject----------', data);
	});
})();