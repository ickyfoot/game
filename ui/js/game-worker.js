onmessage = function(e) {
	var appData, action, metaData, utils;
	metaData = e.data;
	appData = metaData.appData;
	action = metaData.action;
	utils = (typeof arguments[1] !== 'undefined') ? arguments[1] : null;
	switch (action) {
		case 'control player':
			var lastFrame, frameLength, dim;
			frameLength = appData.now - appData.lastFrame;
			if (frameLength > appData.fpsAsMilliseconds) {
				// set new lastFrame time
				lastFrame = appData.now - (frameLength % appData.fpsAsMilliseconds);
				dim = game.player.updatePosition(appData);
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

var game = {
	player: {
		updatePosition: function(data) {
			var xThrottle, yThrottle, zThrottle, xDelta, yDelta, radiusDelta, radius, x, y;
			// determine if player piece movement or resizing should be throttled
			xThrottle = (!!data.controls.pressedKeys['x'] || !!data.controls.pressedKeys['X']);
			yThrottle = (!!data.controls.pressedKeys['c'] || !!data.controls.pressedKeys['C']);
			zThrottle = (!!data.controls.pressedKeys['z'] || !!data.controls.pressedKeys['Z'] || !!data.controls.pressedKeys['Shift']);
			
			// set movement and resizing amount
			xDelta = (!!xThrottle) ? 0.25 : 1;
			yDelta = (!!yThrottle) ? 0.25 : 1;				
			radiusDelta = (!!zThrottle) ? 0.25 : 1;
			
			radius = data.player.dim.radius;
			x = data.player.dim.x;
			y = data.player.dim.y;
			
			// resize player piece
			if (!!data.controls.pressedKeys['Control'] &&
					(!!data.controls.pressedKeys['ArrowLeft'] || !!data.controls.pressedKeys['ArrowRight']
					|| !!data.controls.pressedKeys['ArrowUp'] || !!data.controls.pressedKeys['ArrowDown'])) {
				// reset player piece size
				radius = data.player.dim.originalDim.radius;
			} else {
				// resize player piece
				if (!!data.controls.pressedKeys['ArrowLeft'] && !!data.controls.pressedKeys['ArrowRight']) {
					radius += radiusDelta;
				}
				
				if (!!data.controls.pressedKeys['ArrowUp'] && !!data.controls.pressedKeys['ArrowDown']
						&& data.player.dim.radius > 0) {
					radius = (data.player.dim.radius - radiusDelta <= 0) 
						? 0
						: radius - radiusDelta;
				}
			}
			
			// move player piece
			if (!!data.controls.pressedKeys['ArrowUp']) y -= yDelta;					
			if (!!data.controls.pressedKeys['ArrowRight']) x += xDelta;					
			if (!!data.controls.pressedKeys['ArrowDown']) y += yDelta;					
			if (!!data.controls.pressedKeys['ArrowLeft']) x -= xDelta;
			
			return {
				'radius': radius,
				'x': x,
				'y': y
			};
		}
	}
}