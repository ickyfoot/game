var game = {
	player: {
		detectCollision: function(item1, item2) {
			//////////////////////////////////////////////////////
			// need to account for stroke width of player piece //
			//////////////////////////////////////////////////////
			var item1Top = item1.y - item1.radius;
			var item1Right = item1.x + item1.radius;
			var item1Bottom = item1.y + item1.radius;
			var item1Left = item1.x - item1.radius;
			
			var collision = (	
					item1Top <= 0
				|| 	item1Right >= item2.width
				|| 	item1Bottom >= item2.height
				|| 	item1Left <= 0
			);
			
			return collision;
		},
		updatePosition: function(data) {
			var xThrottle, yThrottle, zThrottle, xDelta, yDelta, radiusDelta, radius, x, y, fullSpeed, throttledSpeed;
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
				if (!game.player.detectCollision(appData.player.dim, appData.board)) {
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
			}
		break;
	}
}