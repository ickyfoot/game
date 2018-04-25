function Physics() {
	this.checkWeapons = (data) => {
		var firePrimaryWeapon = (!!data.controls.pressedKeys[' ']);
		return {
			primary: (!!firePrimaryWeapon)
		}
	}
	
	this.detectCollision = (player, items) => {
		var playerTop = player.y - player.radius;
		var playerBottom = player.y + player.radius;
		var playerLeft = player.x - player.radius;
		var playerRight = player.x + player.radius;
		for (var i = 0; i < items.length; i++) {
			if (
					(
						(playerBottom >= items[i].dim.y && playerBottom <= items[i].dim.bottom)
							||
						(playerTop >= items[i].dim.y && playerTop <= items[i].dim.bottom)
					)
						&&
					(
						(playerRight >= items[i].dim.x && playerRight <= items[i].dim.right)
							||
						(playerLeft >= items[i].dim.x && playerLeft <= items[i].dim.right)
					)
				) return i;
		}
		return null;
	}
	
	this.detectEdge = (player, board) => {
		var playerTop = player.y - player.radius;
		var playerBottom = player.y + player.radius;
		var playerLeft = player.x - player.radius;
		var playerRight = player.x + player.radius;
		var edge = (	
				playerTop <= 0
			|| 	playerRight >= board.width
			|| 	playerBottom >= board.height
			|| 	playerLeft <= 0
		);
		return edge;
	}
	
	this.getNewDimensions = (data) => {
		var fullSpeed, radiusDelta, newPosition, tempDim, tempRadius, 
		tempX, tempY, throttledSpeed, xDelta, yDelta, xThrottle, yThrottle, zThrottle;
		// determine if player piece movement or resizing should be throttled
		fullSpeed = 2;
		throttledSpeed = 1;
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
			if (!!data.controls.pressedKeys['g']) {
				tempDim.radius = data.player.radius + radiusDelta;
			} else if (!!data.controls.pressedKeys['s'] && data.player.radius > 0) {
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
		
		newPosition = (!this.detectEdge(tempDim, data.board))
			? tempDim
			: data.player;
		
		return newPosition;
	}
}

onmessage = function(e) {
	var physics = new Physics();
	var appData, action, metaData;
	metaData = e.data;
	appData = metaData.appData;
	action = metaData.action;
	switch (action) {
		case 'move player':
			var dim, weapons, collision;
			dim = physics.getNewDimensions(appData);
			weapons = physics.checkWeapons(appData);
			collision = (appData.obstacles !== null) ? physics.detectCollision(dim,appData.obstacles) : null;
			
			if (collision === null) {
				collision = (appData.enemies !== null) ? physics.detectCollision(dim,appData.enemies) : null;
			}
			
			postMessage({
				action: 'move player',
				appData: {
					collision: collision,
					radius: dim.radius,
					x: dim.x,
					y: dim.y,
					weapons: weapons
				}
			});
		break;
	}
}