onmessage = function(e) {
	//console.log('worker received message:');
	//console.log(e);
	postMessage('message sent by worker'); 
}