function Animation() {
	this.fps = 30;
	this.fpsAsMilliseconds = 1000/this.fps;
	this.updateFps = 100;
	this.updateFpsAsMilliseconds = 1000/this.updateFps;
	this.frameLength = null;
	this.lastFrame = null;
	this.main = null;
}

function Board(canvas, animation) {
	this.animated = false;
	this.animation = animation;
	this.canvas = canvas;
	this.context = canvas.getContext('2d');
	this.counters = {
		enemyEntryCounter: 0,
		pinnedToTopCount: 0,
		pinnedToBottomCount: 0
	}
	this.createObstacles = () => {
		this.obstacleWidth = this.dimensions.width / this.settings.maxObstacles;
		var obstaclesLength = this.obstacles.top.length;
		var availableSpace = this.dimensions.width - (obstaclesLength * this.obstacleWidth);
		var availableSpaces = Math.ceil(availableSpace / this.obstacleWidth);

		var pathPadding = this.settings.obstaclePathMinHeight / 2;
		// divide obstacles array length by 2 because obstacles come in pairs
		var currentX = (obstaclesLength * this.obstacleWidth);
		var minPathCenter = this.settings.minObstacleHeight + pathPadding;
		var maxPathCenter = this.dimensions.height - this.settings.minObstacleHeight - pathPadding;
		// add availableSpaces if this is a strictly lineTo draw
		// this is necessary because availableSpaces is calculated to determine how
		// many rectangles of a given width can fit in the full board width
		// but this leaves a gap at the end when doing pure line-to;
		availableSpaces += 2; // 5 prevents flatlining at work, 2 prevents flatlining at home.
		for (var i = 0; i < availableSpaces; i++) {
			var yCenterOffset = this.settings.yCenterOffset;
			var yCenterOffsetMod = this.settings.yCenterOffsetMod;
			var topY = 0;
			var pathCenter = (this.dimensions.height / 2) - yCenterOffset;
			var pinnedToTop = pathCenter < minPathCenter;
			var pinnedToBottom = pathCenter > maxPathCenter
			var pinned = (!!pinnedToTop || !!pinnedToBottom);
			var topHeight = pathCenter - pathPadding;

			if (!!pinnedToTop) pathCenter = minPathCenter;

			if (!!pinnedToBottom) pathCenter = maxPathCenter;
			
			//yCenterOffsetMod += (yCenterOffsetMod < 0) ? i : -i;
				
			// ensure it doesn't get too difficult
			yCenterOffsetMod -= (yCenterOffsetMod > this.settings.maxYCenterOffsetMod) 
				? 10 
				: 0;
			yCenterOffsetMod += (yCenterOffsetMod < -this.settings.maxYCenterOffsetMod) 
				? 10
				: 0;
			
			// randomize y offset direction
			if (!pinned) yCenterOffsetMod = Physics.prototype.toggleValue(yCenterOffsetMod,-yCenterOffsetMod);
			
			// path is bounded within the board
				
			// ensure top obstacles always have a height of at least this.settings.minObstacleHeight
			if (!!pinnedToTop) {
				topHeight = this.settings.minObstacleHeight;
				this.counters.pinnedToTopCount++;
			}
			
			// y coordinate of bottom obstacle = calculated height of the top obstacle + path height
			var bottomY = topHeight + this.settings.obstaclePathMinHeight + Physics.prototype.getRandomInteger(1,10);
			
			// ensure y coordinate is always at least this.settings.minObstacleHeight less than board height
			// thus ensuring that bottom obstacles always have a height of at least this.settings.minObstacleHeight
			if (!!pinnedToBottom) {
				bottomY = this.dimensions.height - this.settings.minObstacleHeight;
				this.counters.pinnedToBottomCount++;
			}

			// set bottomHeight
			var bottomHeight = this.dimensions.height - bottomY;
			
			// ensure topHeight respects min path height when bottomY is restricted from hitting bottom
			topHeight = (bottomY == this.dimensions.height - this.settings.minObstacleHeight) 
				? bottomY - this.settings.obstaclePathMinHeight 
				: topHeight + Physics.prototype.getRandomInteger(10,100);
			
			// unpin path from top or bottom if necessary
			if (this.counters.pinnedToTopCount > this.settings.maxPinnedCount) {
				// home
				yCenterOffset = Math.abs(pathPadding + pathCenter + this.settings.minObstacleHeight + Physics.prototype.getRandomInteger(3,9));
				// work
				// yCenterOffset = Math.abs(pathCenter + this.settings.minObstacleHeight + Physics.prototype.getRandomInteger(3,9));
				this.settings.maxPinnedCount = (this.settings.maxPinnedCount <= this.settings.minPinnedCount) 
					? this.settings.maxPinnedCount 
					: this.settings.maxPinnedCount - Physics.prototype.getRandomInteger(2,7);
				this.counters.pinnedToTopCount = 0;
			} else if (this.counters.pinnedToBottomCount > this.settings.maxPinnedCount) {
				yCenterOffset = -Math.abs(Math.abs(yCenterOffset) - this.settings.minObstacleHeight - Physics.prototype.getRandomInteger(3,9));
				this.settings.maxPinnedCount = (this.settings.maxPinnedCount <= this.settings.minPinnedCount) 
					? this.settings.maxPinnedCount 
					: this.settings.maxPinnedCount - Physics.prototype.getRandomInteger(2,7);
				this.counters.pinnedToBottomCount = 0;
			}

			// randomize the amount by which y is offset unless it's been reset because it's pinned
			this.settings.yCenterOffset = (!!pinned) ? yCenterOffset : Physics.prototype.getRandomInteger(yCenterOffset,yCenterOffset + yCenterOffsetMod);
			this.settings.yCenterOffsetMod = yCenterOffsetMod;
			
			
			this.obstacles.top.push(new Obstacle(
				currentX, // x
				topY, // y
				this.obstacleWidth, // width
				topHeight, // height
				this.settings.rgba.red,
				this.settings.rgba.green,
				this.settings.rgba.blue,
				this.settings.rgba.opacity
			));
			
			// create bottom obstacle and push into obstacles array
			this.obstacles.bottom.push(new Obstacle(
				currentX, // x
				bottomY, // y
				this.obstacleWidth, // w
				bottomHeight, // h
				this.settings.rgba.red,
				this.settings.rgba.green,
				this.settings.rgba.blue,
				this.settings.rgba.opacity
			));
			
			// update the x coordinates for the next pair of obstacles
			currentX += this.obstacleWidth;
		}
	}
	this.dimensions = Physics.prototype.setObjectDimensions($(canvas));
	this.draw = (entity, type, lag) => {
		var drawType = (typeof type != 'undefined') ? type : entity.drawType;
		var lag = (typeof lag != 'undefined') ? lag : 1;
		this.context.lineWidth = 3;
		switch(drawType) {
			case 'arc':
				this.context.beginPath();
				if (!!entity.collided) {
					this.context.strokeStyle = this.context.fillStyle = 'rgba(200,20,20,1.0)';
				} else {
					this.context.strokeStyle = this.context.fillStyle = 'rgba(20,20,20,1.0)';
				}
				this.context.arc(entity.dim.x, entity.dim.y, entity.dim.radius, 0, 2*Math.PI);
				this.context.fill();
			break;
			case 'lineTo':
				this.context.fillStyle = 'rgba('+this.settings.rgba.red+','+this.settings.rgba.green+','+this.settings.rgba.blue+','+(this.settings.rgba.opacity - 0.3)+')';
				this.context.strokeStyle = 'rgba(0,0,120,'+this.settings.rgba.opacity+')';
				
				// draw top
				this.context.beginPath();
				this.context.moveTo(0, 0);
				this.context.lineTo(0, entity.top[0].dim.h);
				for (var i = 0; i < entity.top.length; i++) {
					entity.top[i].dim.x -= (!!this.animated) ? this.obstacleWidth * lag : 0;
					this.context.lineTo(entity.top[i].dim.x, entity.top[i].dim.h);
				}
				this.context.lineTo(this.dimensions.width, entity.top[entity.top.length - 1].dim.h);
				this.context.lineTo(this.dimensions.width, 0);
				this.context.closePath();
				this.context.fill();
				this.context.stroke();
				
				// draw bottom
				this.context.beginPath();
				this.context.moveTo(0, entity.bottom[0].dim.y);
				for (var i = 0; i < entity.bottom.length; i++) {
					entity.bottom[i].dim.x -= (!!this.animated) ? this.obstacleWidth : 0;
					this.context.lineTo(entity.bottom[i].dim.x, entity.bottom[i].dim.y);
				}
				this.context.lineTo(this.dimensions.width, entity.bottom[entity.bottom.length - 1].dim.y);
				this.context.lineTo(this.dimensions.width, this.dimensions.height);
				this.context.lineTo(0, this.dimensions.height);
				this.context.closePath();
				this.context.fill();
				this.context.stroke();
			break;
			case 'rect':
				var offScreen = [];
				for (var i = 0; i < entity.length; i++) {
					/*if (!!entity.collided) {
						console.log('obstacle collided');
						this.context.fillStyle = 'rgba(200,'+entity.rgba.green+',20,'+entity.rgba.opacity+')';
						this.context.strokeStyle = 'rgba(200,'+entity.rgba.green+',20,'+entity.rgba.opacity+')';
					} else {*/
						this.context.fillStyle = 'rgba('+entity[i].rgba.red+',255,'+entity[i].rgba.blue+','+entity[i].rgba.opacity+')';
						this.context.strokeStyle = 'rgba('+entity[i].rgba.red+','+entity[i].rgba.green+','+entity[i].rgba.blue+','+entity[i].rgba.opacity+')';
					/*}*/
					
					entity.xMod = Physics.prototype.getRandomInteger(15,20);
							
					if (entity[i].yDirCount.up > 20) entity[i].yDirCount.up = 0;
					else if (entity[i].yDirCount.down > 20) entity[i].yDirCount.down = 0;
					
					if (entity[i].yDirCount.up == 0 && entity[i].yDirCount.down == 0) {
						entity[i].yMod = Physics.prototype.getRandomInteger(1,7);
						entity[i].yMod = Physics.prototype.toggleValue(Math.abs(entity[i].yMod), -Math.abs(entity[i].yMod));
					}
					
					if (entity[i].yMod > 0) {
						entity[i].yMod = Math.abs(Physics.prototype.getRandomInteger(1,7));
						entity[i].yDirCount.up++; 
					} else if (entity[i].yMod < 0) {
						entity[i].yMod = -Math.abs(Physics.prototype.getRandomInteger(1,7));
						entity[i].yDirCount.down++;
					}
					
					entity[i].dim.x = (!!this.animated && entity[i].status != 'new') 
						? entity[i].dim.x - entity.xMod
						: this.dimensions.width - entity[i].dim.w - 10;
					
					// flag for removal if the entity is offscreen
					if (entity[i].dim.x <= 0 || entity[i].dim.y <= 0 || entity[i].dim.y >= this.dimensions.height) offScreen.push(i);
					
					entity[i].dim.y = (!!this.animated && entity[i].status != 'new') 
						? entity[i].dim.y - entity[i].yMod 
						: this.dimensions.height / 2 - entity[i].yMod;
					entity[i].status = (entity[i].status == 'new') ? 'established' : entity[i].status;
					this.context.beginPath();
					this.context.rect(entity[i].dim.x, entity[i].dim.y, entity[i].dim.w, entity[i].dim.h);
					this.context.fill();
					this.context.stroke();
				}
				
				// remove any entities that have moved off the screen.
				if (offScreen.length > 0)  entity.splice(offScreen[0], offScreen.length);
			break;
		}
	}
	this.enemies = [];
	this.obstacles = {
		top: [],
		bottom: []
	};
	
	this.player = null;
	
	this.settings = {
		enemyEntryPace: 20,
		maxObstacles: 150,
		maxPinnedCount: 15,
		maxYCenterOffsetMod: 30,
		minObstacleHeight: 40,
		minPinnedCount: 3,
		obstaclePathMinHeight: 600,
		rgba: {
			red: 20,
			green: 20,
			blue: 200,
			opacity: 1.0
		},
		// the amount by which to offset the y value from vertical center
		yCenterOffset: Physics.prototype.getRandomInteger(3,9),
		// the amount by which yCenterOffset varies from one obstacle to the next
		yCenterOffsetMod: 10
	}
	
	this.obstacleWidth = this.dimensions.width / this.settings.maxObstacles;
}

function Controls() {
	this.keywords = ['start'];
	this.arrowKeys = ['ArrowRight','ArrowLeft','ArrowUp','ArrowDown'];
	this.pressedKeys = {};
}

function Enemy(w, h) {
	this.dim = {
		h: h,
		originalDim: {
			h: h,
			w: w
		},
		w: w,
		movement: 'random'
	}
	this.yDirCount = {
		up: 0,
		down: 0
	}
	this.xMod;
	this.yMod;
	this.drawType = 'rect';
	this.status = 'new';
	this.update = (x, y, w, h) => {
		this.dim.x = x;
		this.dim.y = y;
		this.dim.w = w;
		this.dim.h = h;
	}
	this.rgba = {
		red: 20,
		green: 120,
		blue: 20,
		opacity: 1.0
	}
}

function Flow() {
	this.init = () => {
	}
	
	this.pause = () => {
	}
	
	this.run = () => {
	}
	
	this.start = () => {
	}
	
	this.stop = () => {
	}
}

function Game(canvas, d_canvas) {
	this.animation = new Animation();
	// display board
	this.board = new Board(canvas, this.animation);
	
	this.controls = new Controls();	
	this.inputs = {
		word: ''
	}
	this.physics = new Physics();
	this.status = 'pending';
	
	this.init = () => {
		// set up entities
			// player
		this.board.player = new Player(15, this.board.dimensions.height/2, 5);
		
			// obstacles
		this.board.createObstacles();
		
			//enemy
		this.board.enemies.push(new Enemy(30, 10));

		// draw entities		
			// enemies
		this.board.draw(this.board.enemies, 'rect');
		
			// player
		this.board.draw(this.board.player);
		
			// obstacles
		this.board.draw(this.board.obstacles, 'lineTo');
		
		// handle Game Worker callback
		this.physics.worker.onmessage = (e) => {
			var action, appData, data;
			data = e.data;
			action = data.action;
			appData = data.appData;
			switch (data.action) {
				// call for controlling the player
				case 'move player':
					if (appData.collision != null) {
						this.board.player.collided = true;
						appData.collision.collided = true;
						this.status = 'collision';
					} else {
						this.board.createObstacles();
						this.board.player.update(appData.x, appData.y, appData.radius);
					}
				break;
			}
		}
	}
	this.filteredObstacles;
	this.lag = 0.0;
	// main loop
	this.run = (timestamp) => {
		// see here for consistent frame rate logic:
		// https://stackoverflow.com/questions/19764018/controlling-fps-with-requestanimationframe
		this.animation.main = window.requestAnimationFrame(this.run);
		this.animation.lastFrame = timestamp;
		this.board.animated = true;
		if (timestamp < this.animation.lastFrame + this.animation.fpsAsMilliseconds) {
			// clear board to prepare for next animation state
			this.board.context.clearRect(0,0,this.board.dimensions.width,this.board.dimensions.height);
			if (this.status == 'playing' && this.animation.lastFrame !== null) {
				this.board.draw(this.board.enemies, 'rect');
				this.board.draw(this.board.player);
				this.board.draw(this.board.obstacles, 'lineTo');
				this.board.obstacles.top.splice(0,1);
				this.board.obstacles.bottom.splice(0,1);
			} else {
				if (this.status == 'collision') {
					this.board.player.collided = true;
					this.board.draw(this.board.player);
					this.board.draw(this.board.enemies, 'rect');
					this.board.animated = false;
					this.board.draw(this.board.obstacles, 'lineTo');
					this.stop('over');
				}
			}
		}
	}
	
	this.start = () => {
		this.animation.lastFrame = performance.now();
		this.status = 'playing';
		// start animation
		window.requestAnimationFrame(this.run);
		// start game updates
		this.update = this.advanceGame();
	}
	
	this.stop = (status) => {
		this.status = status;
		// stop game updates
		clearInterval(this.update);
		// stop animation
		window.cancelAnimationFrame(this.animation.main);
	}
	
	this.update;
	this.updateGame = () => {
		var filteredTopObstacles = this.board.obstacles.top.filter((el) => {
			return (el.dim.x > (this.board.player.dim.x - 5) && el.dim.x < (this.board.player.dim.x + 5));
		});
		var filteredBottomObstacles = this.board.obstacles.bottom.filter((el) => {
			return (el.dim.x > (this.board.player.dim.x - 5) && el.dim.x < (this.board.player.dim.x + 5));
		});
		var filteredObstacles = filteredTopObstacles.concat(filteredBottomObstacles);
		
		if (this.board.counters.enemyEntryCounter >= this.board.settings.enemyEntryPace) {
			this.board.enemies.push(new Enemy(30, 10));
			this.board.counters.enemyEntryCounter = 0;
		} else this.board.counters.enemyEntryCounter++;
		
		// send info to Web Worker to determine if it's time to redraw
		// redrawing is handled in this.worker callback defined in this.init	
		this.physics.worker.postMessage({
			action: 'move player',
			appData: {
				player: this.board.player.dim,
				board: {
					width: this.board.dimensions.width,
					height: this.board.dimensions.height
				},
				obstacles: filteredObstacles,
				controls: this.controls
			}
		});
	}
	
	this.advanceGame = () => {
		return setInterval(() => {
			//this.animation.frameLength = Date.now() - this.animation.lastFrame;
			//this.animation.lastFrame = Date.now();
			this.updateGame();
		}, this.animation.updateFpsAsMilliseconds);
	}
}

function Obstacle(x, y, w, h, r, g, b, a) {
	this.dim = {
		x: x,
		y: y,
		w: w,
		h: h,
		right: x + w,
		bottom: y + h
	};
	this.drawType = 'path';
	this.rgba = {
		red: r,
		green: g,
		blue: b,
		opacity: a
	};
}

function Physics() {
	this.worker = new Worker('/game/ui/js/physics-worker.js?'+performance.now());
}

// borrowed from https://stackoverflow.com/questions/4959975/generate-random-number-between-two-numbers-in-javascript#_=_
// see second answer (by Francisc)
Physics.prototype.getRandomInteger = (min,max) => {
	return Math.floor(Math.random()*(max-min+1)+min);
}

Physics.prototype.modulateColor = (i) => {
	var multiplier = Physics.prototype.getRandomInteger(1,5)
	return (i == 0) 
		? 10
		: (i * multiplier > 255) 
			? (i * multiplier) % 255
			: i * multiplier;
}

Physics.prototype.toggleValue = (a, b) => {
	var toggle = Physics.prototype.getRandomInteger(1,2);
	return (toggle % 2 == 0) ? b : a;
}

Physics.prototype.setObjectDimensions = (piece) => {
	var dim = {
		piece: piece,
		height: piece.height(),
		width: piece.width(),
		totalHeight: (piece.height() +  
			parseInt(piece.css('border-top-width')) +
			parseInt(piece.css('border-bottom-width')) +
			parseInt(piece.css('margin-top')) +
			parseInt(piece.css('margin-bottom')) +
			parseInt(piece.css('padding-top')) +
			parseInt(piece.css('padding-bottom'))
		),
		totalWidth: (piece.width() + 
			parseInt(piece.css('border-left-width')) +
			parseInt(piece.css('border-right-width')) +
			parseInt(piece.css('margin-left')) +
			parseInt(piece.css('margin-right')) +
			parseInt(piece.css('padding-left')) +
			parseInt(piece.css('padding-right'))
		),
		position: {
			top: piece.position().top,
			left: piece.position().left
		},
	};
	dim.position.bottom = dim.position.top + dim.totalHeight;
	dim.position.right = dim.position.left + dim.totalWidth;
	dim.xFromCenter = dim.totalWidth/2;
	dim.yFromCenter = dim.totalWidth/2;
	dim.position.x = dim.position.left + dim.xFromCenter;
	dim.position.y = dim.position.top + dim.yFromCenter;
	
	return dim;
}

function Player(x, y, r) {
	this.dim = {
		radius: r,
		originalDim: {
			radius: r,
			x: x,
			y: y
		},
		x: x,
		y: y
	}
	this.drawType = 'arc';
	this.update = (x, y, r) => {
		this.dim.x = x;
		this.dim.y = y;
		this.dim.radius = r;
	}
}

$(document).on('ready',function() {
	var canvas = document.getElementById('game-board');
	$(canvas).attr('width', $('#container').width());
	$(canvas).attr('height', $('#container').height());
	
	// set up board
	var game = new Game(canvas);
	game.init();	
		
	ickyfoot.setUpKeyDetection(function(key,type) {
		game.controls.pressedKeys[key] = (type == 'keydown' || type == 'keypress');
		if (type == 'keydown') {
			game.inputs.word += key
			if (game.status == 'pending' && game.inputs.word == 'start') {
				game.start();
				game.inputs.word = '';
			} else {
				for (var i = 0; i < game.controls.keywords.length; i++)
					game.inputs.word = (game.controls.keywords[i].indexOf(game.inputs.word) == -1) ? '' : game.inputs.word;
			}
		}		
				
		if (key == ' ') {
			if (type == 'keydown' || type == 'keypress') {
				if (game.status != 'over') {
					game.status = (game.status == 'paused') ? 'playing' : 'paused';
					if (game.status == 'paused') {
						game.stop(game.status);
					} else {
						game.start();
					}
				}
			} else return;
		}
		
		if (key == 'Escape') {
			if (type == 'keydown' || type == 'keypress') {
				game.stop('over');
				return;
			} else return;
		}
	});
});
