console.log('toast');
game = {
	controls: {
		arrowKeys: ['ArrowRight','ArrowLeft','ArrowUp','ArrowDown'],
		keywords: ['start'],
		pressedKeys: {}
	},
	board: {
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
					} else if (game.board.obstacles[i].position.left <= game.board.edge.left) game.status = 'collision';
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
		edge: {
			top: null,
			left: null
		}
	},
	init: function() {
		$('#game-board').html(
				'<div id="game-piece"></div>'
			+	'<div class="obstacle"></div>'
		);
		
		// set board dimensions
		game.board.edge.left = parseInt($('#game-board').position().left);
		game.board.edge.top = parseInt($('#game-board').position().top);
		game.board.edge.right = game.board.edge.left + parseInt($('#game-board').width());
		game.board.edge.bottom = game.board.edge.top + parseInt($('#game-board').height());
		
		// set up board
		var gameBoard = $.extend(true, {}, game.board.dimensions);
		game.board.dimensions = game.values.setObjectDimensions(gameBoard, $('#game-board'));
		
		// set up player
		var player = $.extend(true, {}, game.board.player);
		game.board.player = game.values.setObjectDimensions(player, $('#game-piece'));
		
		// center player
		game.board.player.piece.css('left', (game.board.dimensions.position.x - game.board.player.xFromCenter) + 'px');
		game.board.player.piece.css('top', (game.board.dimensions.position.y - game.board.player.yFromCenter) + 'px');
		
		// update player params
		game.board.player = game.values.setObjectDimensions(game.board.player, $('#game-piece'));
		
		// set up obstacles
		var obstacles = $('.obstacle');		
		for (var i = 0; i < obstacles.length; i++) {
			var obstacle = $.extend(true, {}, game.board.obstacle);
			game.board.obstacles.push(game.values.setObjectDimensions(obstacle, $(obstacles[i])));
		}
		
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
				var newLeft = 0;
				var newTop = 0;
				var currentTop = parseInt(game.board.player.position.top);
				var pieceWidth = parseInt(game.board.player.piece.height());				
				var pieceHeight = parseInt(game.board.player.piece.height());
				var currentLeft = parseInt(game.board.player.position.left);
				
				if (!!game.controls.pressedKeys['ArrowUp']) {
					if (game.board.player.position.top > parseInt(game.board.edge.top)) newTop = currentTop - 1;
				}
				
				if (!!game.controls.pressedKeys['ArrowRight']) {
					if (game.board.player.position.right < parseInt(game.board.edge.right)) newLeft = currentLeft + 1;
				}
				
				if (!!game.controls.pressedKeys['ArrowDown']) {
					if (game.board.player.position.bottom < parseInt(game.board.edge.bottom)) newTop = currentTop + 1;
				}
				
				if (!!game.controls.pressedKeys['ArrowLeft']) {
					if (game.board.player.position.left > parseInt(game.board.edge.left)) newLeft = currentLeft - 1;
				}
				
				if (newLeft > 0) game.board.player.piece.css('left', (newLeft - game.board.edge.left) + 'px');
				if (newTop > 0) game.board.player.piece.css('top', (newTop - game.board.edge.top) + 'px');
				
				game.board.player = game.values.setObjectDimensions(game.board.player, $('#game-piece'));
			}
		}, 1);
	},
	start: function() {
		game.status = 'playing';
		game.controls.moveBoardLeft = game.board.moveLeft();
		game.run();
	},
	status: 'pending',
	stop: function(status) {
		game.status = status;
		clearInterval(game.controls.moveBoardLeft);
	}
};

$(document).on('ready',function() {
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
