var promisesAplusTests = require('promises-aplus-tests'),
		promise = require('../scripts/promise2.js');
    

promisesAplusTests(promise, function(err){
	console.log('all done ', err);
});

