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
	this.createObstacles = () => {
		if (!!this.useLineTo) {
			this.obstacleWidth = this.dimensions.width / this.maxObstacles;
			var obstaclesLength = this.obstacles.top.length;
			var availableSpace = this.dimensions.width - (obstaclesLength * this.obstacleWidth);
			var availableSpaces = Math.ceil(availableSpace / this.obstacleWidth);

			var pathPadding = this.obstaclePathMinHeight / 2;
			// divide obstacles array length by 2 because obstacles come in pairs
			var currentX = obstaclesLength * this.obstacleWidth;
			var minPathCenter = this.minObstacleHeight + pathPadding;
			var maxPathCenter = this.dimensions.height - this.minObstacleHeight - pathPadding;
			// add availableSpaces if this is a strictly lineTo draw
			// this is necessary because availableSpaces is calculated to determine how
			// many rectangles of a given width can fit in the full board width
			// but this leaves a gap at the end when doing pure line-to;
			availableSpaces += 5; // 5 prevents flatlining at work, 4 works at home. Does 5 work at  home?
			for (var i = 0; i < availableSpaces; i++) {
				var yCenterOffset = this.yCenterOffset;
				var yCenterOffsetMod = this.yCenterOffsetMod;
				var topY = 0;
				var pathCenter = (this.dimensions.height / 2) - yCenterOffset;
				var pinnedToTop = pathCenter < minPathCenter;
				var pinnedToBottom = pathCenter > maxPathCenter
				var pinned = (!!pinnedToTop || !!pinnedToBottom);
				var topHeight = pathCenter - pathPadding;

				if (!!pinnedToTop) pathCenter = minPathCenter;

				if (!!pinnedToBottom) pathCenter = maxPathCenter;
				
				yCenterOffsetMod += (yCenterOffsetMod < 0) ? i : -i;
					
				// ensure it doesn't get too difficult
				yCenterOffsetMod -= (yCenterOffsetMod > this.maxYCenterOffsetMod) 
					? this.minObstacleHeight 
					: 0;
				yCenterOffsetMod += (yCenterOffsetMod < -this.maxYCenterOffsetMod) 
					? this.minObstacleHeight 
					: 0;
				
				// randomize y offset direction
				if (!pinned) yCenterOffsetMod = Physics.prototype.toggleValue(yCenterOffsetMod,-yCenterOffsetMod);
				
				if (!!this.travelWithPath) {
					// board travels vertically with path
					
					if (pathCenter <= pathPadding) {
						// encrouching on top, need to adjust top by the difference between pathPadding and pathCenter
						this.topAdjust = pathPadding - pathCenter;				
						topY -= this.topAdjust;
					}
					
					if (pathCenter >= (this.dimensions.height - pathPadding)) {
						//encroaching on bottom
						this.topAdjust = pathPadding + pathCenter;
						topHeight -= this.topAdjust;
					}
					
					// y coordinate of bottom obstacle = calculated height of the top obstacle + path height
					var bottomY = pathCenter + pathPadding;
					
					// set bottomHeight
					var bottomHeight = (bottomHeight > this.dimensions.height) ? 0 : this.dimensions.height - bottomY;// increase difficulty as path progresses 
				
					// randomize the amount by which y is offset
					this.yCenterOffset = Physics.prototype.getRandomInteger(yCenterOffset,yCenterOffset + yCenterOffsetMod);
					this.yCenterOffsetMod = yCenterOffsetMod;
				} else {
					// path is bounded within the board
					
					// ensure top obstacles always have a height of at least this.minObstacleHeight
					if (!!pinnedToTop) {
						topHeight = this.minObstacleHeight;
						this.pinnedToTopCount++;
					}
					
					// y coordinate of bottom obstacle = calculated height of the top obstacle + path height
					var bottomY = topHeight + this.obstaclePathMinHeight;
					
					// ensure y coordinate is always at least this.minObstacleHeight less than board height
					// thus ensuring that bottom obstacles always have a height of at least this.minObstacleHeight
					if (!!pinnedToBottom) {
						bottomY = this.dimensions.height - this.minObstacleHeight;
						this.pinnedToBottomCount++;
					}

					// set bottomHeight
					var bottomHeight = this.dimensions.height - bottomY;
					
					// ensure topHeight respects min path height when bottomY is restricted from hitting bottom
					topHeight = (bottomY == this.dimensions.height - this.minObstacleHeight) 
						? bottomY - this.obstaclePathMinHeight 
						: topHeight;
					
					// unpin path from top or bottom if necessary
					if (this.pinnedToTopCount > this.currentMaxPinnedCount) {
						// home
						// yCenterOffset = Math.abs(pathPadding + pathCenter + this.minObstacleHeight + Physics.prototype.getRandomInteger(3,9));
						// work
						yCenterOffset = Math.abs(pathCenter + this.minObstacleHeight + Physics.prototype.getRandomInteger(3,9));
						this.currentMaxPinnedCount = (this.currentMaxPinnedCount <= this.minPinnedCount) 
							? this.maxPinnedCount 
							: this.currentMaxPinnedCount - Physics.prototype.getRandomInteger(2,7);
						this.pinnedToTopCount = 0;
					} else if (this.pinnedToBottomCount > this.currentMaxPinnedCount) {
						yCenterOffset = -Math.abs(Math.abs(yCenterOffset) - this.minObstacleHeight - Physics.prototype.getRandomInteger(3,9));
						this.currentMaxPinnedCount = (this.currentMaxPinnedCount <= this.minPinnedCount) 
							? this.maxPinnedCount 
							: this.currentMaxPinnedCount - Physics.prototype.getRandomInteger(2,7);
						this.pinnedToBottomCount = 0;
					}

					// randomize the amount by which y is offset unless it's been reset because it's pinned
					this.yCenterOffset = (!!pinned) ? yCenterOffset : Physics.prototype.getRandomInteger(yCenterOffset,yCenterOffset + yCenterOffsetMod);
					this.yCenterOffsetMod = yCenterOffsetMod;
				}
				
				this.obstacles.top.push([currentX,topHeight]);
				this.obstacles.bottom.push([currentX,bottomY]);
				
				//randomize color
				//if ((i % 3 == 0) || (i % 2 == 0)) {
				//	if (i % 3 == 0) this.rgba.blue = Physics.prototype.modulateColor(this.rgba.blue);
				//	else this.rgba.green = Physics.prototype.modulateColor(this.rgba.green);
				//} else this.rgba.red = Physics.prototype.modulateColor(this.rgba.red);
				
				// update the x coordinates for the next pair of obstacles
				currentX += this.obstacleWidth;
			}
		} else {
			this.obstacleWidth = this.dimensions.width / this.maxObstacles;
			// divide obstacles array length by 2 because obstacles come in pairs
			var obstaclesLength = this.obstacles.length / 2;
			var availableSpace = this.dimensions.width - (obstaclesLength * this.obstacleWidth);
			var availableSpaces = Math.ceil(availableSpace / this.obstacleWidth);

			var pathPadding = this.obstaclePathMinHeight / 2;
			// divide obstacles array length by 2 because obstacles come in pairs
			var currentX = obstaclesLength * this.obstacleWidth;
			var minPathCenter = this.minObstacleHeight + pathPadding;
			var maxPathCenter = this.dimensions.height - this.minObstacleHeight - pathPadding;
			
			for (var i = 0; i < availableSpaces; i++) {
				var yCenterOffset = this.yCenterOffset;
				var yCenterOffsetMod = this.yCenterOffsetMod;
				var topY = 0;
				var pathCenter = (this.dimensions.height / 2) - yCenterOffset;
				var pinnedToTop = pathCenter < minPathCenter;
				var pinnedToBottom = pathCenter > maxPathCenter
				var pinned = (!!pinnedToTop || !!pinnedToBottom);
				var topHeight = pathCenter - pathPadding;

				if (!!pinnedToTop) pathCenter = minPathCenter;

				if (!!pinnedToBottom) pathCenter = maxPathCenter;
				
				yCenterOffsetMod += (yCenterOffsetMod < 0) ? i : -i;
					
				// ensure it doesn't get too difficult
				yCenterOffsetMod -= (yCenterOffsetMod > this.maxYCenterOffsetMod) 
					? this.minObstacleHeight 
					: 0;
				yCenterOffsetMod += (yCenterOffsetMod < -this.maxYCenterOffsetMod) 
					? this.minObstacleHeight 
					: 0;
				
				// randomize y offset direction
				if (!pinned) yCenterOffsetMod = Physics.prototype.toggleValue(yCenterOffsetMod,-yCenterOffsetMod);
				
				if (!!this.travelWithPath) {
					// board travels vertically with path
					
					if (pathCenter <= pathPadding) {
						// encrouching on top, need to adjust top by the difference between pathPadding and pathCenter
						this.topAdjust = pathPadding - pathCenter;				
						topY -= this.topAdjust;
					}
					
					if (pathCenter >= (this.dimensions.height - pathPadding)) {
						//encroaching on bottom
						this.topAdjust = pathPadding + pathCenter;
						topHeight -= this.topAdjust;
					}
					
					// y coordinate of bottom obstacle = calculated height of the top obstacle + path height
					var bottomY = pathCenter + pathPadding;
					
					// set bottomHeight
					var bottomHeight = (bottomHeight > this.dimensions.height) ? 0 : this.dimensions.height - bottomY;// increase difficulty as path progresses 
				
					// randomize the amount by which y is offset
					this.yCenterOffset = Physics.prototype.getRandomInteger(yCenterOffset,yCenterOffset + yCenterOffsetMod);
					this.yCenterOffsetMod = yCenterOffsetMod;
				} else {
					// path is bounded within the board
					
					// ensure top obstacles always have a height of at least this.minObstacleHeight
					if (!!pinnedToTop) {
						topHeight = this.minObstacleHeight;
						this.pinnedToTopCount++;
					}
					
					// y coordinate of bottom obstacle = calculated height of the top obstacle + path height
					var bottomY = topHeight + this.obstaclePathMinHeight;
					
					// ensure y coordinate is always at least this.minObstacleHeight less than board height
					// thus ensuring that bottom obstacles always have a height of at least this.minObstacleHeight
					if (!!pinnedToBottom) {
						bottomY = this.dimensions.height - this.minObstacleHeight;
						this.pinnedToBottomCount++;
					}

					// set bottomHeight
					var bottomHeight = this.dimensions.height - bottomY;
					
					// ensure topHeight respects min path height when bottomY is restricted from hitting bottom
					topHeight = (bottomY == this.dimensions.height - this.minObstacleHeight) 
						? bottomY - this.obstaclePathMinHeight 
						: topHeight;
					
					// unpin path from top or bottom if necessary
					if (this.pinnedToTopCount > this.currentMaxPinnedCount) {
						// home
						// yCenterOffset = Math.abs(pathPadding + pathCenter + this.minObstacleHeight + Physics.prototype.getRandomInteger(3,9));
						// work
						yCenterOffset = Math.abs(pathCenter + this.minObstacleHeight + Physics.prototype.getRandomInteger(3,9));
						this.currentMaxPinnedCount = (this.currentMaxPinnedCount <= this.minPinnedCount) 
							? this.maxPinnedCount 
							: this.currentMaxPinnedCount - Physics.prototype.getRandomInteger(2,7);
						this.pinnedToTopCount = 0;
					} else if (this.pinnedToBottomCount > this.currentMaxPinnedCount) {
						yCenterOffset = -Math.abs(Math.abs(yCenterOffset) - this.minObstacleHeight - Physics.prototype.getRandomInteger(3,9));
						this.currentMaxPinnedCount = (this.currentMaxPinnedCount <= this.minPinnedCount) 
							? this.maxPinnedCount 
							: this.currentMaxPinnedCount - Physics.prototype.getRandomInteger(2,7);
						this.pinnedToBottomCount = 0;
					}

					// randomize the amount by which y is offset unless it's been reset because it's pinned
					this.yCenterOffset = (!!pinned) ? yCenterOffset : Physics.prototype.getRandomInteger(yCenterOffset,yCenterOffset + yCenterOffsetMod);
					this.yCenterOffsetMod = yCenterOffsetMod;
				}				
				
				// create top obstacle and push into obstacles array
				this.obstacles.push(new Obstacle(
					currentX, // x
					topY, // y
					this.obstacleWidth, // width
					topHeight, // height
					this.rgba.red,
					this.rgba.green,
					this.rgba.blue,
					this.rgba.opacity
				));
				
				// create bottom obstacle and push into obstacles array
				this.obstacles.push(new Obstacle(
					currentX, // x
					bottomY, // y
					this.obstacleWidth, // w
					bottomHeight, // h
					this.rgba.red,
					this.rgba.green,
					this.rgba.blue,
					this.rgba.opacity
				));
				
				//randomize color
				/* if ((i % 3 == 0) || (i % 2 == 0)) {
					if (i % 3 == 0) this.rgba.blue = Physics.prototype.modulateColor(this.rgba.blue);
					else this.rgba.green = Physics.prototype.modulateColor(this.rgba.green);
				} else this.rgba.red = Physics.prototype.modulateColor(this.rgba.red); */
				
				// update the x coordinates for the next pair of obstacles
				currentX += this.obstacleWidth;
			}
		}
	}
	this.dimensions = Physics.prototype.setObjectDimensions($(canvas));
	this.draw = (entity, type) => {
		drawType = (typeof type != 'undefined') ? type : entity.drawType;
		switch(drawType) {
			case 'arc':
				this.context.beginPath();
				this.context.arc(entity.dim.x, entity.dim.y, entity.dim.radius, 0, 2*Math.PI);
				if (!!entity.collided) {
					this.context.strokeStyle = 'rgba(200,20,20,1.0)';
				} else {
					this.context.strokeStyle = 'rgba(20,20,20,1.0)';
				}
				this.context.closePath();
				this.context.stroke();
			break;
			case 'path':
				entity.dim.x -= (!!this.animated) ? entity.dim.w : 0;
				if (!!this.travelWithPath) {
					entity.dim.y += this.topAdjust
					entity.dim.h -= this.topAdjust;
				}
				this.context.beginPath();
				this.context.moveTo(entity.dim.x, entity.dim.y);
				this.context.lineTo(entity.dim.x, entity.dim.y + entity.dim.h);
				this.context.lineTo(entity.dim.x + entity.dim.w, entity.dim.y + entity.dim.h);
				this.context.lineTo(entity.dim.x + entity.dim.w, entity.dim.y);
				this.context.closePath();
				if (!!entity.collided) {
					this.context.fillStyle = 'rgba(200,'+entity.rgba.green+',20,'+entity.rgba.opacity+')';
					this.context.strokeStyle = 'rgba(200,'+entity.rgba.green+',20,'+entity.rgba.opacity+')';
				} else {
					this.context.fillStyle = 'rgba('+entity.rgba.red+','+entity.rgba.green+','+entity.rgba.blue+','+entity.rgba.opacity+')';
					this.context.strokeStyle = 'rgba('+entity.rgba.red+','+entity.rgba.green+','+entity.rgba.blue+','+entity.rgba.opacity+')';
				}
				this.context.fill();
				this.context.stroke();
			break;
			case 'lineTo':
				if (!!entity.collided) {
					this.context.fillStyle = 'rgba(200,'+this.rgba.green+',20,'+this.rgba.opacity+')';
					this.context.strokeStyle = 'rgba(200,'+this.rgba.green+',20,'+this.rgba.opacity+')';
				} else {
					this.context.fillStyle = 'rgba('+this.rgba.red+','+this.rgba.green+','+this.rgba.blue+','+this.rgba.opacity+')';
					this.context.strokeStyle = 'rgba('+this.rgba.red+','+this.rgba.green+','+this.rgba.blue+','+this.rgba.opacity+')';
				}

				// draw top
				this.context.beginPath();
				this.context.moveTo(0, 0);
				for (var i = 0; i < entity.top.length; i++) {
					entity.top[i][0] -= (!!this.animated) ? this.obstacleWidth : 0;
					if (!!this.travelWithPath) {
						entity.top[i][1] += this.topAdjust
					}
					this.context.lineTo(entity.top[i][0], entity.top[i][1]);
				}
				this.context.lineTo(this.dimensions.width, 0);
				this.context.closePath();
				this.context.fill();
				this.context.stroke();
				
				// draw bottom
				this.context.beginPath();
				this.context.moveTo(entity.bottom[0][0], entity.bottom[0][1]);
				for (var i = 0; i < entity.bottom.length; i++) {
					entity.bottom[i][0] -= (!!this.animated) ? this.obstacleWidth : 0;
					if (!!this.travelWithPath) {
						entity.bottom[i][1] += this.topAdjust
					}
					this.context.lineTo(entity.bottom[i][0], entity.bottom[i][1]);
				}
				this.context.lineTo(this.dimensions.width, this.dimensions.height);
				this.context.lineTo(0, this.dimensions.height);
				this.context.closePath();
				this.context.fill();
				this.context.stroke();
			break;
			case 'point':
			break;
		}
	}
	this.maxObstacles = 150;
	this.obstacleWidth = this.dimensions.width / this.maxObstacles;
	this.maxPinnedCount = 15;
	this.currentMaxPinnedCount = this.maxPinnedCount;
	this.minPinnedCount = 3;
	this.maxYCenterOffsetMod = 40;
	this.minObstacleHeight = 40;
	this.obstaclePathMinHeight = 200;
	this.obstacles = [];
	this.pinnedToTopCount = 0;
	this.pinnedToBottomCount = 0;
	this.rgba = {
		red: 20,
		green: 20,
		blue: 200,
		opacity: 1.0
	}
	
	// the amount by which the board must shift vertically to follow path
	this.topAdjust = 0;
	
	// specify whether or not board should travel vertically with path
	// or path should be bounded by the board
	this.travelWithPath = false;
	
	// the amount by which to offset the y value from vertical center
	this.yCenterOffset = Physics.prototype.getRandomInteger(3,9);
	
	this.useLineTo = true;
	
	// the amount by which yCenterOffset varies from one obstacle to the next
	this.yCenterOffsetMod = 10;
	this.player = null
	
	if (!!this.useLineTo) {
		this.obstacles = {
			top: [],
			bottom: []
		}
	}
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

function Game(canvas, d_canvas) {
	this.animation = new Animation();
	this.board = new Board(canvas);
	this.boardIndex = 1;
	this.controls = new Controls();	
	this.d_board = new Board(d_canvas);
	this.inputs = {
		word: ''
	}
	this.physics = new Physics();
	this.status = 'pending';
	
	this.init = () => {
		// set up entities
			// player
		this.d_board.player = new Player(15, this.d_board.dimensions.height/2, 5);
		
			// obstacles
		this.d_board.createObstacles();

		// draw entities
		// player
		this.d_board.draw(this.d_board.player);
		
		// obstacles
		if (!!this.d_board.useLineTo) {
			this.d_board.draw(this.d_board.obstacles, 'lineTo');
		} else {
			for (var i = 0; i < this.d_board.obstacles.length; i++) this.d_board.draw(this.d_board.obstacles[i]);
		}
		
		this.board.context.drawImage(this.d_board.canvas, 0, 0);
		
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
					for (var i = 0; i < this.d_board.obstacles.length; i++) obstacleDims.push(this.d_board.obstacles[i].dim);
					
					// clear board to prepare for next animation state
					this.d_board.context.clearRect(0,0,this.d_board.dimensions.width,this.d_board.dimensions.height);
					
					// update and draw entities			
					if (appData.collision != null) {
						this.stop('over');
						this.d_board.player.collided = true;
						appData.collision.collided = true;
						this.d_board.draw(this.d_board.player);
						for (var i = 0; i < this.d_board.obstacles.length; i++) this.d_board.draw(this.d_board.obstacles[i]);
						this.d_board.draw(appData.collision);
					} else {
						if (!!this.d_board.useLineTo) {
							this.d_board.draw(this.d_board.obstacles, 'lineTo');
							this.d_board.draw(this.d_board.player);
							this.d_board.obstacles.top.splice(0,1);
							this.d_board.obstacles.bottom.splice(0,1);
							this.d_board.createObstacles();
							this.d_board.player.update(appData.x, appData.y, appData.radius);
						} else {
							for (var i = 0; i < this.d_board.obstacles.length; i++) this.d_board.draw(this.d_board.obstacles[i]);
							this.d_board.draw(this.d_board.player);
							this.d_board.obstacles.splice(0,2);
							this.d_board.createObstacles();
							this.d_board.player.update(appData.x, appData.y, appData.radius);
						}
					}
										
					var frameLength = performance.now() - this.animation.lastFrame;
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
			if (this.boardIndex < 0) {
				console.log('toast');
				var obstacleDims = [];
				this.d_board.animated = true;
				
				if (!!this.d_board.useLineTo) {
					var filteredTopObstacles = this.d_board.obstacles.top.filter((el) => {
						return (el.x > (this.d_board.player.dim.x - 5) && el.x < (this.d_board.player.dim.x + 5));
					});
					var filteredBottomObstacles = this.d_board.obstacles.top.filter((el) => {
						return (el.x > (this.d_board.player.dim.x - 5) && el.x < (this.d_board.player.dim.x + 5));
					});
					var filteredObstacles = filteredTopObstacles.concat(filteredBottomObstacles);
				} else {
					var filteredObstacles = this.d_board.obstacles.filter((el) => {
						return el.dim.x > (this.d_board.player.dim.x - 5) && el.dim.x < (this.d_board.player.dim.x + 5);
					});
				}

				this.physics.worker.postMessage({
					action: 'move player',
					appData: {
						now: performance.now(),
						lastFrame: this.animation.lastFrame,
						fpsAsMilliseconds: this.animation.fpsAsMilliseconds,
						player: this.d_board.player.dim,
						board: {
							width: this.d_board.dimensions.width,
							height: this.d_board.dimensions.height
						},
						obstacles: filteredObstacles,
						controls: this.controls
					}
				});
				this.boardIndex = 1;
			} else {
				console.log('test');
				// clear board to prepare for next animation state
				this.board.context.clearRect(0,0,this.board.dimensions.width,this.board.dimensions.height);
				this.board.context.drawImage(this.d_board.canvas, 0, 0);
				this.boardIndex = -1;
			}
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
	var d_canvas = document.getElementById('drawing-board');
	$(canvas).attr('width', $('#container').width());
	$(canvas).attr('height', $('#container').height());
	
	$(d_canvas).attr('width', $('#container').width());
	$(d_canvas).attr('height', $('#container').height());
	
	// set up board
	var game = new Game(canvas, d_canvas);
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
