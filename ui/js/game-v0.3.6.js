game = {
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
		moveLeft: function() {
			return setInterval(function() {
				for (var i = 0; i < game.board.obstacles.length; i++) {
					game.board.obstacles[i].piece.css('left', game.board.obstacles[i].position.left-- + 'px');
					game.board.obstacles[i].position.right = game.board.obstacles[i].position.left + game.board.obstacles[i].width;
					
					if (!!game.interactions.detect.collision(game.board.player, game.board.obstacles[i])) {
						game.board.player.piece.css('border-color','red');
						game.status = 'collision';
					} else if (game.board.obstacles[i].position.left <= game.board.dimensions.position.left) game.status = 'collision';
				}					
				if (game.status === 'collision') clearInterval(game.controls.moveBoardLeft);
			}, 5)
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
			control: function() {
				// determine if player piece movement or resizing should be modulated
				var xModulate = (!!game.controls.pressedKeys['x'] || !!game.controls.pressedKeys['X']);
				var yModulate = (!!game.controls.pressedKeys['c'] || !!game.controls.pressedKeys['C']);
				var zModulate = (!!game.controls.pressedKeys['z'] || !!game.controls.pressedKeys['Z'] || !!game.controls.pressedKeys['Shift']);
				
				// set movement and resizing amount
				var xDelta = (!!xModulate) ? 0.25 : 1;
				var yDelta = (!!yModulate) ? 0.25 : 1;				
				var radiusDelta = (!!zModulate) ? 0.25 : 1;
				
				// resize player piece
				if (!!game.controls.pressedKeys['Control'] &&
						(!!game.controls.pressedKeys['ArrowLeft'] || !!game.controls.pressedKeys['ArrowRight']
						|| !!game.controls.pressedKeys['ArrowUp'] || !!game.controls.pressedKeys['ArrowDown'])) {
					// reset player piece size
					game.board.player.dim.radius = game.board.player.dim.originalDim.radius;
				} else {
					// resize player piece
					if (!!game.controls.pressedKeys['ArrowLeft'] && !!game.controls.pressedKeys['ArrowRight']) {
						game.board.player.dim.radius += radiusDelta;
					}
					
					if (!!game.controls.pressedKeys['ArrowUp'] && !!game.controls.pressedKeys['ArrowDown']
							&& game.board.player.dim.radius > 0) {
						game.board.player.dim.radius = (game.board.player.dim.radius - radiusDelta <= 0) 
							? 0
							: game.board.player.dim.radius - radiusDelta;
					}
				}
				
				// move player piece
				if (!!game.controls.pressedKeys['ArrowUp']) game.board.player.dim.y -= yDelta;					
				if (!!game.controls.pressedKeys['ArrowRight']) game.board.player.dim.x += xDelta;					
				if (!!game.controls.pressedKeys['ArrowDown']) game.board.player.dim.y += yDelta;					
				if (!!game.controls.pressedKeys['ArrowLeft']) game.board.player.dim.x -= xDelta;
				
				// redraw player
				game.board.player.draw(game.board.context, game.board.player.dim);
			},
			dim: {
				'radius':0,
				'originalDim': {
					'radius': 0,
					'x':0,
					'y':0
				},
				'x':0,
				'y':0
			},
			draw: function(ctx, dim) {
				ctx.beginPath();
				ctx.arc(dim.x, dim.y, dim.radius, 0, 2*Math.PI);
				ctx.closePath();
				ctx.stroke();
			}
		}
	},
	controls: {
		arrowKeys: ['ArrowRight','ArrowLeft','ArrowUp','ArrowDown'],
		keywords: ['start'],
		pressedKeys: {}
	},
	init: function() {
		// get board dimensions
		var gameBoard = $.extend(true, {}, game.board.dimensions);
		game.board.dimensions = game.values.setObjectDimensions(gameBoard, $('#game-board'));
		
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
		game.board.player.draw(game.board.context, game.board.player.dim);
		
		game.start();
	},
	inputs: {
		word: ''
	},
	interactions: {
		detect: {
			collision: function(item1, item2) {
				//	(
				//		VERTICAL OVERLAP
				//		(
				//			(
				/***************item1 top is between item2 top and bottom */
				// 				item1 top is <= item2 top && item1 top is >= item2 bottom
				// 			)
				
				// 			OR
				
				//			(
				/***************item1 bottom is between item2 top and bottom */
				// 				item1 bottom is <= item2 top && item1 bottom is >= item2 bottom
				// 			)
				//		)
				
				//		AND
				//		HORIZONTAL OVERLAP
				
				//		(
				//			(
				/***************item1 right is between item2 right and left */
				// 				item1 right is >= item2 left && item1 right is <= item2 right
				// 			)
				
				// 			OR
				
				//			(
				/***************item1 left is between item2 right and left */
				// 				item1 left is >= item2 left && item1 left is <= item2 right
				// 			)
				//		)
				//	)
				var checkVertical = function(side) {
					return (side >= item2.position.top && side <= item2.position.bottom);
				}
				var checkHorizontal = function(side) {
					return (side >= item2.position.left && side <= item2.position.right);
				}
				
				return 	((!!checkVertical(item1.position.top) || !!checkVertical(item1.position.bottom))) 
							&& 
						((!!checkHorizontal(item1.position.left) || !!checkHorizontal(item1.position.right)));
			}
		}
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
			return obj;
		}
	},
	mode: false,
	run: function() {
		return setInterval(function() {
			if (game.status == 'playing') {
				// clear board to prepare for next animation state
				game.board.context.clearRect(0,0,game.board.dimensions.width,game.board.dimensions.height);
				
				// detect player control
				game.board.player.control();
			}
		}, 1);
	},
	start: function() {
		game.status = 'playing';
		//game.controls.moveBoardLeft = game.board.moveLeft();
		game.run();
	},
	status: 'pending',
	stop: function(status) {
		game.status = status;
		clearInterval(game.controls.moveBoardLeft);
	}
};

$(document).on('ready',function() {
	game.board.canvas = document.getElementById('game-board');
	game.board.context = game.board.canvas.getContext('2d');
	$(game.board.canvas).attr('width', $('#container').width());
	$(game.board.canvas).attr('height', $('#container').height());
	ickyfoot.setUpKeyDetection(function(key,type) {
		game.controls.pressedKeys[key] = (type == 'keydown' || type == 'keypress');
		
		if (type == 'keydown') {
			game.inputs.word += key
			if (game.status == 'pending' && game.inputs.word == 'start') {
				game.init();
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
