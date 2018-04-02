var game = {
	player: {
		currentDim: {
			'radius': null,
			'x': null,
			'y': null
		},
		detectCollision: function(player, item2) {			
			var collision = (	
					player.y < 0
				|| 	player.x >= item2.width
				|| 	player.y > item2.height
				|| 	player.x <= 0
			);
			
			return collision;
		},
		getNewDimensions: function(data) {
			var xThrottle, yThrottle, zThrottle, xDelta, yDelta, radiusDelta, 
				fullSpeed, throttledSpeed, tempRadius, tempX, tempY, tempDim, finalPosition;
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
				'radius': data.player.dim.radius,
				'x': data.player.dim.x,
				'y': data.player.dim.y
			}
			
			// resize player piece
			if (!!data.controls.pressedKeys['Control'] &&
					(!!data.controls.pressedKeys['ArrowLeft'] || !!data.controls.pressedKeys['ArrowRight']
					|| !!data.controls.pressedKeys['ArrowUp'] || !!data.controls.pressedKeys['ArrowDown'])) {
				// reset player piece size
				tempDim.radius = data.player.dim.originalDim.radius;
			} else {
				// resize player piece
				if (!!data.controls.pressedKeys['ArrowLeft'] && !!data.controls.pressedKeys['ArrowRight']) {
					tempDim.radius = data.player.dim.radius + radiusDelta;
				}
				
				if (!!data.controls.pressedKeys['ArrowUp'] && !!data.controls.pressedKeys['ArrowDown']
						&& data.player.dim.radius > 0) {
					tempDim.radius = (data.player.dim.radius - radiusDelta <= 0) 
						? 0
						: data.player.dim.radius - radiusDelta;
				}
			}
			
			// move player piece
			if (!!data.controls.pressedKeys['ArrowUp']) tempDim.y = data.player.dim.y - yDelta;					
			if (!!data.controls.pressedKeys['ArrowRight']) tempDim.x = data.player.dim.x + xDelta;					
			if (!!data.controls.pressedKeys['ArrowDown']) tempDim.y = data.player.dim.y + yDelta;					
			if (!!data.controls.pressedKeys['ArrowLeft']) tempDim.x = data.player.dim.x - xDelta;
			
			finalPosition = (!game.player.detectCollision(tempDim, data.board))
				? tempDim
				: data.player.dim;
			
			return finalPosition;
		}
	}
}

onmessage = function(e) {			
	var appData, action, metaData, utils;
	metaData = e.data;
	appData = metaData.appData;
	action = metaData.action;
	switch (action) {
		case 'control player':
			var lastFrame, frameLength, dim;
			frameLength = appData.now - appData.lastFrame;
			if (frameLength > appData.fpsAsMilliseconds) {
				// set new lastFrame time
				lastFrame = appData.now - (frameLength % appData.fpsAsMilliseconds);
				dim = game.player.getNewDimensions(appData);
				postMessage({
					'action': 'control player',
					'appData': {
						'lastFrame': lastFrame,
						'radius': dim.radius,
						'x': dim.x,
						'y': dim.y
					}
				});
			}
		break;
	}
}