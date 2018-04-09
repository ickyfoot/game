var physics = {
	detectCollision: function(player, items) {
		//for (var i = 0; i < items.length; i++) console.log(items[i]);
	},
	detectEdge: function(player, board) {
		var edge = (	
				player.y < 0
			|| 	player.x >= board.width
			|| 	player.y > board.height
			|| 	player.x <= 0
		);
		return edge;
	},
	getNewDimensions: function(data) {
		var xThrottle, yThrottle, zThrottle, xDelta, yDelta, radiusDelta, 
			fullSpeed, throttledSpeed, tempRadius, tempX, tempY, tempDim, newPosition;
		// determine if player piece movement or resizing should be throttled
		fullSpeed = 5;
		throttledSpeed = 2;
		xThrottle = (!!data.controls.pressedKeys['x'] || !!data.controls.pressedKeys['X']);
		yThrottle = (!!data.controls.pressedKeys['c'] || !!data.controls.pressedKeys['C']);
		zThrottle = (!!data.controls.pressedKeys['z'] || !!data.controls.pressedKeys['Z'] || !!data.controls.pressedKeys['Shift']);
		
		// set movement and resizing amount
		xDelta = (!!xThrottle) ? throttledSpeed : fullSpeed;
		yDelta = (!!yThrottle) ? throttledSpeed : fullSpeed;				
		radiusDelta = (!!zThrottle) ? throttledSpeed : fullSpeed;
		
		tempDim = {
			radius: data.player.radius,
			x: data.player.x,
			y: data.player.y
		}
		
		// resize player piece
		if (!!data.controls.pressedKeys['Control'] &&
				(!!data.controls.pressedKeys['ArrowLeft'] || !!data.controls.pressedKeys['ArrowRight']
				|| !!data.controls.pressedKeys['ArrowUp'] || !!data.controls.pressedKeys['ArrowDown'])) {
			// reset player piece size
			tempDim.radius = data.player.originalDim.radius;
		} else {
			// resize player piece
			if (!!data.controls.pressedKeys['ArrowLeft'] && !!data.controls.pressedKeys['ArrowRight']) {
				tempDim.radius = data.player.radius + radiusDelta;
			} else if (!!data.controls.pressedKeys['ArrowUp'] && !!data.controls.pressedKeys['ArrowDown']
					&& data.player.radius > 0) {
				tempDim.radius = (data.player.radius - radiusDelta <= 0) 
					? 0
					: data.player.radius - radiusDelta;
			} else {
				// move player piece
				if (!!data.controls.pressedKeys['ArrowUp']) tempDim.y = data.player.y - yDelta;					
				if (!!data.controls.pressedKeys['ArrowRight']) tempDim.x = data.player.x + xDelta;					
				if (!!data.controls.pressedKeys['ArrowDown']) tempDim.y = data.player.y + yDelta;					
				if (!!data.controls.pressedKeys['ArrowLeft']) tempDim.x = data.player.x - xDelta;
			}
		}
		
		newPosition = (!physics.detectEdge(tempDim, data.board))
			? tempDim
			: data.player;
		
		return newPosition;
	}
}

onmessage = function(e) {			
	var appData, action, metaData;
	metaData = e.data;
	appData = metaData.appData;
	action = metaData.action;
	switch (action) {
		case 'move player':
			var lastFrame, frameLength, dim, collision;
			frameLength = appData.now - appData.lastFrame;
			if (frameLength > appData.fpsAsMilliseconds) {
				// set new lastFrame time
				lastFrame = appData.now - (frameLength % appData.fpsAsMilliseconds);
				dim = physics.getNewDimensions(appData);
				postMessage({
					action: 'move player',
					appData: {
						lastFrame: lastFrame,
						radius: dim.radius,
						x: dim.x,
						y: dim.y
					}
				});
			}
		break;
	}
}