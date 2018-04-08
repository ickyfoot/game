function Animation() {
	this.fps = 60,
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
	this.canvas = canvas;
	this.context = canvas.getContext('2d');
	this.dimensions = Physics.prototype.setObjectDimensions($(canvas));
	this.draw = (entity) => {
		var ctx = this.context,
			type = entity.drawType,
			dim = entity.dim;
		switch(type) {
			case 'arc':
				ctx.beginPath();
				ctx.arc(dim.x, dim.y, dim.radius, 0, 2*Math.PI);
				ctx.closePath();
				ctx.stroke();
			break;
			case 'path':
				ctx.beginPath();
				ctx.moveTo(dim.x, dim.y);
				ctx.lineTo(dim.x, dim.y + dim.h);
				ctx.lineTo(dim.x + dim.w, dim.y + dim.h);
				ctx.lineTo(dim.x + dim.w, dim.y);
				ctx.closePath();	
				ctx.fill();
				ctx.stroke();
			break;
		}
	}
	this.obstacles = [],
	this.player = null
}

function Controls() {
	this.keywords = ['start'];
	this.arrowKeys = ['ArrowRight','ArrowLeft','ArrowUp','ArrowDown'];
	this.pressedKeys = {};
}

function Obstacle(x, y, w, h) {
	this.dim = {
		x: x,
		y: y,
		w: w,
		h: h,
		right: x + w,
		bottom: y + h
	};
	this.drawType = 'path';
	this.update = (x, y, w, h) => {
		this.dim.x = x;
		this.dim.y = y;
		this.dim.w = w;
		this.dim.h = h;
		this.dim.right = x + w;
		this.dim.bottom = y + h;
	}
};

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
};

function Game(canvas) {
	this.animation = new Animation();
	this.physics = new Physics();
	this.board = new Board(canvas);
	this.controls = new Controls();
	this.init = () => {
		// set up entities
		// player
		this.board.player = new Player(this.board.dimensions.width/2, this.board.dimensions.height/2, 5);
		
		// obstacles
		// top
		this.board.obstacles.push(new Obstacle(
			0, 
			0, 
			this.board.dimensions.width, 
			(this.board.dimensions.height / 2) - 30
		));
		
		// bottom
		this.board.obstacles.push(new Obstacle(
			0, (this.board.dimensions.height / 2) + 30, 
			this.board.dimensions.width, 
			(this.board.dimensions.height / 2) - 30
		));
		
		// draw entities
		// player
		this.board.draw(this.board.player);
		
		// obstacles
		for (var i = 0; i < this.board.obstacles.length; i++) this.board.draw(this.board.obstacles[i]);
		
		this.worker.onmessage = (e) => {
			var action, appData, data;
			data = e.data;
			action = data.action;
			appData = data.appData;
			switch (data.action) {
				// handle Web Worker callback call for controlling the player
				case 'control player':
					// clear board to prepare for next animation state
					this.board.context.clearRect(0,0,this.board.dimensions.width,this.board.dimensions.height);
					this.animation.lastFrame = appData.lastFrame;
					
					// update entities
					this.board.player.update(appData.x, appData.y, appData.radius);
					
					// draw entities
					// player
					this.board.draw(this.board.player);
					
					// obstacles
					for (var i = 0; i < this.board.obstacles.length; i++) this.board.draw(this.board.obstacles[i]);
				break;
			}
		};
	};
	this.inputs = {
		word: ''
	};
	this.mode = false;
	// main loop
	this.run = () => {
		// see here for consistent frame rate logic:
		// https://stackoverflow.com/questions/19764018/controlling-fps-with-requestanimationframe
		this.animation.main = window.requestAnimationFrame(this.run);
		if (this.status == 'playing' && this.animation.lastFrame !== null) {
			// send info to Web Worker to determine if it's time to redraw
			// redrawing is handled in this.worker callback defined in this.init
			this.worker.postMessage({
				'action': 'control player',
				'appData': {
					'now': performance.now(),
					'lastFrame': this.animation.lastFrame,
					'fpsAsMilliseconds': this.animation.fpsAsMilliseconds,
					'player': this.board.player.dim,
					'board': {
						'width': this.board.dimensions.width,
						'height': this.board.dimensions.height
					},
					'controls': this.controls
				}
			});
		}
	}
	this.start = () => {
		this.animation.lastFrame = performance.now();
		this.status = 'playing';
		this.run();
	},
	this.status = 'pending';
	this.stop = (status) => {
		this.status = status;
		window.cancelAnimationFrame(this.animation.main);
	}
	this.worker = new Worker('/game/ui/js/game-worker.js?'+performance.now());
};

function Physics() {}
Physics.prototype.setObjectDimensions  = (piece) => {
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
				this.stop('over');
				return;
			} else return;
		}
	});
});
