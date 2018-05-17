function Physics() {
	this.checkWeapons = (data) => {
		var firePrimaryWeapon = (!!data.control.pressedKeys[' ']);
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
	
	this.detectShotDown = (projectiles, targets) => {
		var obj = {
			shotDown: [],
			successfulProjectiles: []
		}
		for (var i = 0; i < targets.length; i++) {
			var shotDown = [];
			var successfulProjectiles = [];
			for (var j = 0; j < projectiles.length; j++) {
				if (
						(
							(projectiles[j].dim.bottom >= targets[i].dim.y && projectiles[j].dim.bottom <= targets[i].dim.bottom)
								||
							(projectiles[j].dim.top >= targets[i].dim.y && projectiles[j].dim.top <= targets[i].dim.bottom)
						)
							&&
						(
							(projectiles[j].dim.right >= targets[i].dim.x && projectiles[j].dim.right <= targets[i].dim.right)
								||
							(projectiles[j].dim.left >= targets[i].dim.x && projectiles[j].dim.left <= targets[i].dim.right)
						)
					) {
					shotDown.push(targets[i].id);
					successfulProjectiles.push(projectiles[j].id);
				}
			}
			obj.shotDown = obj.shotDown.concat(shotDown);
			obj.successfulProjectiles = obj.successfulProjectiles.concat(successfulProjectiles);
		}
		return obj;
	}
	
	this.getNewDimensions = (data) => {
		var fullSpeed, radiusDelta, newPosition, tempDim, tempRadius, 
		tempX, tempY, throttledSpeed, xDelta, yDelta, xThrottle, yThrottle, zThrottle;
		// determine if player piece movement or resizing should be throttled
		fullSpeed = 2;
		throttledSpeed = 1;
		xThrottle = (!!data.control.pressedKeys['x'] || !!data.control.pressedKeys['X']);
		yThrottle = (!!data.control.pressedKeys['c'] || !!data.control.pressedKeys['C']);
		zThrottle = (!!data.control.pressedKeys['z'] || !!data.control.pressedKeys['Z'] || !!data.control.pressedKeys['Shift']);
		
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
		if (!!data.control.pressedKeys['Control'] &&
				(!!data.control.pressedKeys['ArrowLeft'] || !!data.control.pressedKeys['ArrowRight']
				|| !!data.control.pressedKeys['ArrowUp'] || !!data.control.pressedKeys['ArrowDown'])) {
			// reset player piece size
			tempDim.radius = data.player.originalDim.radius;
		} else {
			// resize player piece
			if (!!data.control.pressedKeys['g']) {
				tempDim.radius = data.player.radius + radiusDelta;
			} else if (!!data.control.pressedKeys['s'] && data.player.radius > 0) {
				tempDim.radius = (data.player.radius - radiusDelta <= 0) 
					? 0
					: data.player.radius - radiusDelta;
			} else {
				// move player piece
				if (!!data.control.pressedKeys['ArrowUp']) tempDim.y = data.player.y - yDelta;					
				if (!!data.control.pressedKeys['ArrowRight']) tempDim.x = data.player.x + xDelta;					
				if (!!data.control.pressedKeys['ArrowDown']) tempDim.y = data.player.y + yDelta;					
				if (!!data.control.pressedKeys['ArrowLeft']) tempDim.x = data.player.x - xDelta;
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
	var appData, action, metaData, enemyCollisions;
	metaData = e.data;
	appData = metaData.appData;
	action = metaData.action;
	enemyCollisions = [];
	switch (action) {
		case 'move player':
			var dim, weapons, collision;
			dim = physics.getNewDimensions(appData);
			weapons = physics.checkWeapons(appData);
			collision = (appData.obstacles !== null) ? physics.detectCollision(dim,appData.obstacles) : null;
			shotDownObj = (appData.projectiles !== null) 
				? physics.detectShotDown(appData.projectiles, appData.enemyTargets) 
				: null;	
			for (var i = 0; i < appData.enemies; i++) {
				var enemy = appData.enemies[i];
				enemyCollisions.push(physics.detectCollision(enemy.dim,appData.obstacles_enemies));
			}
			console.log(enemyCollisions);
			if (collision === null) {
				collision = (appData.enemies !== null) ? physics.detectCollision(dim,appData.enemies) : null;
			}
			postMessage({
				action: 'move player',
				appData: {
					collision: collision,
					radius: dim.radius,
					shotDownObj: shotDownObj,
					x: dim.x,
					y: dim.y,
					weapons: weapons
				}
			});
		break;
	}
}