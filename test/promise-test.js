var promisesAplusTests = require('promises-aplus-tests'),
		promise = require('../scripts/promise.js');

promisesAplusTests(promise, function(err){
	console.log('all done ', err);
});

