var game = {
	animation: {
		fps: 60,
		fpsAsMilliseconds: null,
		frameCount: null,
		frameLength: null,
		lastFrame: null,
		main: null,
		nextFrame: null,
		// how many loops to perform per millisecond in each frame
		// the higher the number, the faster the player moves
		playerLoopsPerFrameMillisecond: 1
	},
	board: {
		canvas: null,
		context: null,
		dimensions: {
			height: null,
			piece: null,
			position: {
				top: null,
				right: null,
				bottom: null,
				left: null,
				x: null,
				y: null
			},
			xFromCenter: null,
			yFromCenter: null,
			width: null
		},
		obstacles: [],
		obstacle: {
			height: null,
			piece: null,
			position: {
				top: null,
				right: null,
				bottom: null,
				left: null,
				x: null,
				y: null
			},
			xFromCenter: null,
			yFromCenter: null,
			width: null
		},
		player: {
			dim: {
				'radius':0,
				'originalDim': {
					'radius': 0,
					'x':0,
					'y':0
				},
				'x':0,
				'y':0
			}
		}
	},
	controls: {
		arrowKeys: ['ArrowRight','ArrowLeft','ArrowUp','ArrowDown'],
		keywords: ['start'],
		pressedKeys: {}
	},
	draw: {
		player: function(ctx, dim) {
			ctx.beginPath();
			ctx.arc(dim.x, dim.y, dim.radius, 0, 2*Math.PI);
			ctx.closePath();
			ctx.stroke();
		}
	},
	init: function() {
		// get board dimensions
		game.board.dimensions = $.extend(true, {}, game.board.dimensions);
		game.values.setObjectDimensions(game.board.dimensions, $('#game-board'));
		
		game.board.player.dim = {
			'radius': 5,
			'originalDim': {
				'radius': 5,
				'x':(game.board.dimensions.width/2),
				'y':(game.board.dimensions.height/2)
			},
			'x':(game.board.dimensions.width/2),
			'y':(game.board.dimensions.height/2)
		}
		
		// draw player
		game.draw.player(game.board.context, game.board.player.dim);
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
		
		game.worker.onmessage = function(e) {
			var action, appData, data;
			data = e.data;
			action = data.action;
			appData = data.appData;
			switch (data.action) {
				// handle Web Worker callback call for controlling the player
				case 'control player':
					// clear board to prepare for next animation state
					game.board.context.clearRect(0,0,game.board.dimensions.width,game.board.dimensions.height);
					game.animation.lastFrame = appData.lastFrame;
					game.board.player.dim.radius = appData.radius;
					game.board.player.dim.x = appData.x;
					game.board.player.dim.y = appData.y;
					game.draw.player(game.board.context, game.board.player.dim);
				break;
			}
		};
	},
	inputs: {
		word: ''
	},
	mode: false,
	// main loop
	run: function() {
		// see here for consistent frame rate logic:
		// https://stackoverflow.com/questions/19764018/controlling-fps-with-requestanimationframe
		game.animation.main = window.requestAnimationFrame(game.run);
		if (game.status == 'playing' && game.animation.lastFrame !== null) {
			// send info to Web Worker to determine if it's time to redraw
			// redrawing is handled in game.worker callback defined in game.init
			game.worker.postMessage({
				'action': 'control player',
				'appData': {
					'now': performance.now(),
					'lastFrame': game.animation.lastFrame,
					'fpsAsMilliseconds': game.animation.fpsAsMilliseconds,
					'player': game.board.player,
					'board': {
						'position': game.board.dimensions.position
					},
					'controls': game.controls
				}
			});
		}
	},
	start: function() {
		game.animation.fpsAsMilliseconds = 1000/game.animation.fps;
		game.animation.lastFrame = performance.now();
		game.status = 'playing';
		game.run();
	},
	status: 'pending',
	stop: function(status) {
		game.status = status;
		window.cancelAnimationFrame(game.animation.main);
	},
	values: {
		keywords: ['start'],
		setObjectDimensions: function(obj, piece) {
			obj.piece = piece;
			obj.position.top = obj.piece.position().top;
			obj.position.left = obj.piece.position().left;
			obj.height = obj.piece.height();
			obj.width = obj.piece.width();
			obj.totalHeight = obj.height +  
				parseInt(obj.piece.css('border-top-width')) +
				parseInt(obj.piece.css('border-bottom-width')) +
				parseInt(obj.piece.css('margin-top')) +
				parseInt(obj.piece.css('margin-bottom')) +
				parseInt(obj.piece.css('padding-top')) +
				parseInt(obj.piece.css('padding-bottom'));
			obj.totalWidth = obj.width + 
				parseInt(obj.piece.css('border-left-width')) +
				parseInt(obj.piece.css('border-right-width')) +
				parseInt(obj.piece.css('margin-left')) +
				parseInt(obj.piece.css('margin-right')) +
				parseInt(obj.piece.css('padding-left')) +
				parseInt(obj.piece.css('padding-right'));
			obj.position.bottom = obj.position.top + obj.totalHeight;
			obj.position.right = obj.position.left + obj.totalWidth;
			obj.xFromCenter = (obj.totalWidth/2);
			obj.yFromCenter = (obj.totalHeight/2);
			obj.position.x = obj.position.left + obj.xFromCenter;
			obj.position.y = obj.position.top + obj.yFromCenter;
		}
	},
	worker: new Worker('/game/ui/js/game-worker.js?'+performance.now())
};

$(document).on('ready',function() {
	game.board.canvas = document.getElementById('game-board');
	game.board.context = game.board.canvas.getContext('2d');
	$(game.board.canvas).attr('width', $('#container').width());
	$(game.board.canvas).attr('height', $('#container').height());
	game.init();
});
