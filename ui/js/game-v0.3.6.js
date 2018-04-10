function Animation() {
	this.fps = 30,
	this.fpsAsMilliseconds = 1000/this.fps,
	this.frameCount = null,
	this.frameLength = null,
	this.lastFrame = null,
	this.main = null,
	this.nextFrame = null,
	// how many loops to perform per millisecond in each frame
	// the higher the number, the faster the player moves
	this.playerLoopsPerFrameMillisecond = 1
}

function Board(canvas) {
	this.animated = false;
	this.canvas = canvas;
	this.context = canvas.getContext('2d');
	this.createObstacles = (report) => {
		var obstacleWidth = this.dimensions.width / this.obstacleCount;
		var availableSpace = this.dimensions.width - ((this.obstacles.length / 2) * obstacleWidth);
		var availableSpaces = Math.ceil(availableSpace / obstacleWidth);
		var pathPadding = this.obstaclePathMinHeight / 2;
		var currentX = ((this.obstacles.length / 2) * obstacleWidth);
		var diffOffset = 50;
		for (var i = 0; i < availableSpaces; i++) {
			var topHeight = ((this.dimensions.height / 2) - this.yDiff) - pathPadding;
			var bottomY = topHeight + this.obstaclePathMinHeight;
			var bottomHeight = this.dimensions.height - bottomY;
			// top
			this.obstacles.push(new Obstacle(
				currentX, // x
				0, // y
				obstacleWidth, // width
				topHeight, // height
				this.rgba.red,
				this.rgba.green,
				this.rgba.blue,
				this.rgba.opacity
			));
			
			// bottom
			this.obstacles.push(new Obstacle(
				currentX, // x
				bottomY, // y
				obstacleWidth, // w
				bottomHeight, // h
				this.rgba.red,
				this.rgba.green,
				this.rgba.blue,
				this.rgba.opacity
			));
			//if ((i % 3 == 0) || (i % 2 == 0)) {
			//	if (i % 3 == 0) this.rgba.blue = Physics.prototype.modulateColor(this.rgba.blue);
			//	else this.rgba.green = Physics.prototype.modulateColor(this.rgba.green);
			//} else this.rgba.red = Physics.prototype.modulateColor(this.rgba.red);
			
			diffOffset = (diffOffset < 0)
				? (bottomHeight <= 100) 
					? 20 
					: Physics.prototype.toggleValue(20,-20)
				: (topHeight <= 20) 
					? -20 
					: Physics.prototype.toggleValue(20,-20);
			this.yDiff = Physics.prototype.getRandomInteger(this.yDiff,this.yDiff + diffOffset);
			currentX += obstacleWidth;
		}
	}
	this.dimensions = Physics.prototype.setObjectDimensions($(canvas));
	this.draw = (entity) => {
		switch(entity.drawType) {
			case 'arc':
				this.context.beginPath();
				this.context.arc(entity.dim.x, entity.dim.y, entity.dim.radius, 0, 2*Math.PI);
				this.context.closePath();
				this.context.stroke();
			break;
			case 'path':
				entity.dim.x = (!!this.animated) ? entity.dim.x - entity.dim.w : entity.dim.x;
				this.context.beginPath();
				this.context.moveTo(entity.dim.x, entity.dim.y);
				this.context.lineTo(entity.dim.x, entity.dim.y + entity.dim.h);
				this.context.lineTo(entity.dim.x + entity.dim.w, entity.dim.y + entity.dim.h);
				this.context.lineTo(entity.dim.x + entity.dim.w, entity.dim.y);
				this.context.closePath();
				this.context.fillStyle = 'rgba('+entity.rgba.red+','+entity.rgba.green+','+entity.rgba.blue+','+entity.rgba.opacity+')';
				this.context.fill();
				//this.context.stroke();
			break;
		}
	}
	this.obstacleCount = 150;
	this.obstaclePathMinHeight = 200;
	this.obstacles = [];
	this.rgba = {
		red: 20,
		green: 35,
		blue: 152,
		opacity: 1.0
	}
	this.yDiff = Physics.prototype.getRandomInteger(3,20);
	this.player = null
}

function Controls() {
	this.keywords = ['start'];
	this.arrowKeys = ['ArrowRight','ArrowLeft','ArrowUp','ArrowDown'];
	this.pressedKeys = {};
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

function Game(canvas) {
	this.animation = new Animation();
	this.board = new Board(canvas);
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
		
		// draw entities
		// player
		this.board.draw(this.board.player);
		
		// obstacles
		for (var i = 0; i < this.board.obstacles.length; i++) this.board.draw(this.board.obstacles[i]);
		
		// handle Game Worker callback
		this.physics.worker.onmessage = (e) => {
			var action, appData, data;
			data = e.data;
			action = data.action;
			appData = data.appData;
			this.animation.lastFrame = appData.lastFrame;
			
			switch (data.action) {
				// call for controlling the player
				case 'move player':
					var obstacleDims = [];
					for (var i = 0; i < this.board.obstacles.length; i++) obstacleDims.push(this.board.obstacles[i].dim);
					
					// clear board to prepare for next animation state
					this.board.context.clearRect(0,0,this.board.dimensions.width,this.board.dimensions.height);
					
					// update entities
						// player
					this.board.player.update(appData.x, appData.y, appData.radius);
					
						// obstacles
					this.board.obstacles.splice(0,2);
					this.board.createObstacles();
					
					// draw entities
						// player
					this.board.draw(this.board.player);
					
					for (var i = 0; i < this.board.obstacles.length; i++) this.board.draw(this.board.obstacles[i]);
			
					if (appData.collision > -1) this.stop('over');
				break;
			}
		}
	}
	
	// main loop
	this.run = () => {
		// see here for consistent frame rate logic:
		// https://stackoverflow.com/questions/19764018/controlling-fps-with-requestanimationframe
		this.animation.main = window.requestAnimationFrame(this.run);
		if (this.status == 'playing' && this.animation.lastFrame !== null) {
			// send info to Web Worker to determine if it's time to redraw
			// redrawing is handled in this.worker callback defined in this.init
			var obstacleDims = [];
			this.board.animated = true;
			//for (var i = 0; i < this.board.obstacles.length; i++) obstacleDims.push(this.board.obstacles[i].dim);
			this.physics.worker.postMessage({
				action: 'move player',
				appData: {
					now: performance.now(),
					lastFrame: this.animation.lastFrame,
					fpsAsMilliseconds: this.animation.fpsAsMilliseconds,
					player: this.board.player.dim,
					board: {
						width: this.board.dimensions.width,
						height: this.board.dimensions.height
					},
					obstacles: this.board.obstacles,
					controls: this.controls
				}
			});
		}
	}
	
	this.start = () => {
		this.animation.lastFrame = performance.now();
		this.status = 'playing';
		this.run();
	}
	
	this.stop = (status) => {
		this.status = status;
		window.cancelAnimationFrame(this.animation.main);
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
	this.rgba = {
		red: r,
		green: g,
		blue: b,
		opacity: a
	};
	this.drawType = 'path';
	/*this.update = (x, y, w, h) => {
		this.dim.x = x;
		this.dim.y = y;
		this.dim.w = w;
		this.dim.h = h;
		this.dim.right = x + w;
		this.dim.bottom = y + h;
	}*/
}
//Obstacle.prototype.update = (x, y, w, h) => {
//}

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
