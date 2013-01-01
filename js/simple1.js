//experimental game code
//author: Ivan Schütz

//var width = 1280;

var TILE_W = 100; //-> 7 * 5 tiles -> 8 * 5 tiles
var TILE_H = 50;

var width = 700;
//var height = 800;
var height = 500;
var MENU_HEIGHT = 50;

var worldHeight = height - MENU_HEIGHT;

//var borderSize = 20;
var borderSize = 15;

var borderRight = width - borderSize;
var borderBottom = height - borderSize - MENU_HEIGHT;

var ctx;
//var stage;

var player;
var fruits = [];
var npcs = [];
var menu;

var LEFT = 0;
var UP = 1;
var RIGHT = 2;
var DOWN = 3;

var tileOverlays = [];

//canvas labels which always appear on top
var textOverlays = [];
var coordsTextOverlay;

var hud = [];

var lastArrowSet = 4;

//loaded map tiles
var tiles = [];
//loaded minimap tiles
var minimapTiles = [];

var markedMinimapTile;

var IMG_DIR = "img/small/";

var ARROW_WIDTH = 40;
var ARROW_WIDTH_H = ARROW_WIDTH / 2;
var ARROW_HEIGHT = 24;
var ARROW_HEIGHT_H = ARROW_HEIGHT / 2;
var ARROW_LEFT_STR = "url(" + IMG_DIR + "arrow_left.png) 0 " + ARROW_HEIGHT_H + ",default";
var ARROW_RIGHT_STR = "url(" + IMG_DIR + "arrow_right.png) " + ARROW_WIDTH_H + " " + ARROW_HEIGHT + ",default";
var ARROW_UP_STR = "url(" + IMG_DIR + "arrow_up.png) " + ARROW_WIDTH_H + " 0,default";
var ARROW_DOWN_STR = "url(" + IMG_DIR + "arrow_down.png) " + ARROW_WIDTH_H + " " + (ARROW_HEIGHT - 10) + ",default";

var currentAction = "walk";

//////////////////////////////////////////////////////////////////////////////////////////
//inventory
//var INV_ITEM_SIZE = 70;
var INV_ITEM_SIZE = 40;
//var INV_COUNT_HEIGHT = 20;
var INV_COUNT_HEIGHT = 10;
var INV_COLS = 8;
var INV_ROWS = 6;
//var INV_BORDER = 5;
var INV_BORDER = 2;
//var INV_PADDING = 5;
var INV_PADDING = 2;
var INV_WIDTH = INV_ITEM_SIZE * INV_COLS + INV_BORDER * 2 + INV_PADDING * (INV_COLS + 1);
var INV_HEIGHT = INV_ITEM_SIZE * INV_ROWS + INV_PADDING * (INV_COLS + 1);

var inventory;
//////////////////////////////////////////////////////////////////////////////////////////
var about;
var clothes;

var itemNames = ["orange", "banana", "pear", "apple", "water", "iron", "coal", "shield"];

var statColors = {vit:"#FF0000", str:"#000000", agi:"#FFFFFF", cha:"#0000FF", wis:"#CF3556"};

var itemToStat = {
		orange:{agi:1},
		banana:{str:1},
		pear:{wis:1},
		apple:{vit:1},
		water:{cha:1}
	};
//////////////////////////////////////////////////////////////////////////////////////////
var currentTile;
//////////////////////////////////////////////////////////////////////////////////////////
var enemies = [];
var bullets = [];
var speechbubbles = [];

var tiles2 = [];

function init() {
	initTiles2();
	
	initMap();
	initMinimap();
	
	//TODO correct here?
	initNpcs();
	
	initScene();
	initAssets();
	
	///should be on demand/////////////
	initAbout();
	initClothes();
	initInventory();
	///////////////////////////////////
	
	initMenu();
	$("#canvas").click(onClick);
	$("#canvas").mousemove(onMouseMove);
//	$("#canvas").keydown(function(e){
//		e.preventDefault();
//		switch(e.keyCode) {
//		case 37: player.move(LEFT); break;
//		case 38: player.move(UP); break;
//		case 39: player.move(RIGHT); break;
//		case 40: player.move(DOWN); break;
//		}
//	});

	//FIXME
//	$("#fastAccess img").click(onFastAccessClick);
	$("#walk").click(function() {
		onFastAccessClick("walk");
	});
	$("#gun").click(function() {
		onFastAccessClick("gun");
	});
	
	//	document.addEventListener('onmousemove', onMouseMove, false);
	document.body.addEventListener('dragover', dragOver, false); 
	document.body.addEventListener('drop', drop, false); 
	
	initEnemies();
	
//	setInterval(fruit, 1000);
	setInterval(render, 1000 / 50);
	
	
}


//FIXME
function onFastAccessClick(clickedItem) {
	if (clickedItem === "walk" && currentAction != "walk") {
		currentAction = "walk";
		$("#gun").attr("src", "img/small/gun.png");
		$("#walk").attr("src", "img/small/walk_s.png");
	} else if (clickedItem === "gun" && currentAction != "gun") {
		currentAction = "gun";
		$("#walk").attr("src", "img/small/walk.png");
		$("#gun").attr("src", "img/small/gun_s.png");
	}
}

function initScene() {
	var canvas = document.getElementById('canvas');
//	stage = new Stage(canvas);
	ctx = canvas.getContext('2d');
}

function initAssets() {
	player = new Player();
	player.addWeapon(new Gun());
	player.currentWeapon = 0;
}

function initAbout() {
	about = new About();
	document.getElementById('about').addEventListener('dragstart', dragStart, false); 
}

function initInventory() {
	inventory = new Inventory();
	document.getElementById('inventory').addEventListener('dragstart', dragStart, false); 
}

function initMenu() {
	menu = new Menu();
	hud.push(menu);
	initMenuItems();
}

///////////////////////////////////////////////////////////////////////////////////////////
function dragStart(event) {
    var style = window.getComputedStyle(event.target, null);
    event.dataTransfer.setData("text/plain",
    (parseInt(style.getPropertyValue("left"), 10) - event.clientX) + ',' + (parseInt(style.getPropertyValue("top"), 10) - event.clientY));
} 

function dragOver(event) { 
    event.preventDefault(); 
    return false; 
} 

function drop(event) { 
    var offset = event.dataTransfer.getData("text/plain").split(',');
    var inventory = document.getElementById('inventory');
    inventory.style.left = (event.clientX + parseInt(offset[0], 10)) + 'px';
    inventory.style.top = (event.clientY + parseInt(offset[1], 10)) + 'px';
    event.preventDefault();
    return false;
}

///////////////////////////////////////////////////////////////////////////////////////////

function render() {
	///TODO event queue////////////////////////////////////////////////////////////////////
	
	///update part/////////////////////////////////////////////////////////////////////////
	player.move();
	
	for (var i in bullets) {
		bullets[i].move();
	}
	for (var i in enemies) {
		enemies[i].move();
	}
	
	for (var i = 0; i < fruits.length; i++) {
//	for each (fruit in fruits) {
		var rect = fruits[i].getRect();
		if (collides(player.getRect(), rect)) {
			player.interact(fruits[i]);
//			fruits.splice(i, 1);
			
			//TODO event handling for this like mouse over / mouse out
//			console.log("CHECKING FRUIT TYPE:" + fruit.type);
			if (fruits[i].type === "button") {
				fruits[i].setState("pressed");
			}
		} else {
			if (fruits[i].type === "button") {
				fruits[i].setState("unpressed");
			}
		}
		
		if (fruits[i].state === "picked") {
			fruits.splice(i, 1);
		}
	}
	///////////////////////////////////////////////////////////////////////////////////////

	ctx.drawImage(currentTile.bgImg, 0, 0);
//	clear();
	
//	drawTile(TILE_W, TILE_H, 0, 0);
	drawTiles();
	
	for (var i in fruits) {
		fruits[i].draw();
	}
	for (var i in bullets) {
		bullets[i].draw();
	}
	for (var i in enemies) {
		enemies[i].draw();
	}
	for (var i in npcs) {
		npcs[i].draw();
	}
	player.draw();
	
	for (var i in tileOverlays) {
		tileOverlays[i].draw();
	}
	for (var i in textOverlays) {
		textOverlays[i].draw();
	}
	//overlays: menu, inventory, panels, etc.
	for (var i in hud) {
		hud[i].draw();
	}
}

function fruit() {
	var x = Math.random() * width;
	var y = Math.random() * height;
	var itemName = itemNames[Math.floor(itemNames.length * Math.random())];
	fruits.push(new Fruit(itemName, x, y, itemName + ".png", 50, fruits.length));
}

function onClick(e) {
	var x = e.layerX;
	var y = e.layerY;
		
//	getTileAt2(x, y);

	
	//traverse all objects and check where we clicked
	//first approach: traverse with linear search and select highest z order
	var overlay;
	var overlayFront;
	for (var i in hud) {
		overlay = hud[i];
		if (isInSquare(x, y, overlay.getRect())) {
			if (overlayFront) {
				if (overlay.z > overlayFront.z) {
					overlayFront = overlay;
				}
			} else {
				overlayFront = overlay;
			}
		}
	}

	if (overlayFront) {
		overlayFront.handleEvent("click", {x: x, y: y});
	} else {
		for (var i in npcs) {
			if (isInSquare(x, y, npcs[i].getRect())) {
				npcs[i].handleEvent("click");
				return;
			}
		}
		
		//TODO arrow must not be displayed outide of canvas 
		if (x < width && y < height) {
			if (lastArrowSet === 4) {
				if (currentAction === "walk") {
					var point = getPointToMove(x, y);
					var x = point.x;
					var y = point.y;
					player.walkTo(x, y);
				} else if (currentAction === "gun") {
					player.shoot(x, y);
				}
			} else {
				if (currentAction === "walk") {
					player.walkTo(x, y, changeToTile, [lastArrowSet]);
//				changeToTile(lastArrowSet);
				}
			}
		}
	}
}

function drawTilesOld() {
	var tilesx = width / TILE_W;
	var tilesy = height / TILE_H;
	
	var tileWH = TILE_W / 2;
	var tileHH = TILE_H / 2;
	
	for (var y = -tileHH; y < height; y += tileHH) {
		for (var x = -tileWH * (y % 2); x < width; x += TILE_W) {
			drawTileOld(TILE_W, TILE_H, x, y);
		}
	}
}

function drawTiles() {
	for (var yi in tiles2) {
		for (var xi in tiles2[yi]) {
			drawTile(tiles2[yi][xi]);
		}
	}
}

//topleft x, topleft y
function drawTileOld(w, h, tlx, tly) {
//  Draw a red diamond that spans the entire canvas.
	ctx.fillStyle = '#'+ Math.floor(Math.random()*16777215).toString(16);
	ctx.beginPath();
	ctx.moveTo(tlx + w / 2, tly);
	ctx.lineTo(tlx, tly + h / 2);
	ctx.lineTo(tlx + w / 2, tly + h);
	ctx.lineTo(tlx + w, tly + h / 2);
	ctx.closePath();
	ctx.fill();
}

function drawTile(tile) {
	var tlx = tile.x;
	var tly = tile.y;
	var w = TILE_W;
	var h = TILE_H;
	
//  Draw a red diamond that spans the entire canvas.
	ctx.fillStyle = tile.color;
	ctx.beginPath();
	ctx.moveTo(tlx + w / 2, tly);
	ctx.lineTo(tlx, tly + h / 2);
	ctx.lineTo(tlx + w / 2, tly + h);
	ctx.lineTo(tlx + w, tly + h / 2);
	ctx.closePath();
	ctx.fill();
}

function getTileAt2(pageX, pageY) {
	console.log("CLICKEd: x:" + pageX + " y:" + pageY);
	
	var x = Math.floor(((TILE_W * pageY) + (TILE_H * pageX)) / (TILE_W * TILE_H));
	
	//((TILE_W * pageY) + (TILE_H * pageX)) = x * (TILE_W * TILE_H)
	//(TILE_H * pageX) =  x * (TILE_W * TILE_H) - (TILE_W * pageY)
	//pageX = (x * (TILE_W * TILE_H) - (TILE_W * pageY)) / TILE_H
	
	var y = Math.floor(((TILE_W * pageY) - (TILE_H * pageX)) / (TILE_W * TILE_H));
	//((TILE_W * pageY) - (TILE_H * pageX)) = x * (TILE_W * TILE_H)
	//(TILE_H * pageY) =  x * (TILE_W * TILE_H) + (TILE_W * pageX)
	//pageY = (x * (TILE_W * TILE_H) + (TILE_W * pageX)) / TILE_H
	
	console.log("#### getTileAt2: x:" + x + " y: " + y);
	return {x:x, y:y};
}

function getPointToMove(pageX, pageY) {
	console.log("getpointtomove pagex:" + pageX + " pageY:" + pageY);
	var tile = getTileAt3(pageX, pageY);
	//var x = tile.x * TILE_W + (TILE_W / 2);
//	var x = ((tile.x * (TILE_W * TILE_H) - (TILE_W * pageY)) / TILE_H) + (TILE_W / 2);
//	
////	var y = tile.y * TILE_H + (TILE_H / 2);
//	var y = ((tile.y * (TILE_W * TILE_H) + (TILE_W * pageX)) / TILE_H) + (TILE_H / 2);
	
	console.log("###coords of tile sx:" +tile.x + "sy:" + tile.y);
	return {x:tile.x, y:tile.y};
}

function getTileAt(pageX, pageY) {
	//adjustment will be 4*tileWidth in your example.
	var x = pageX - TILE_W;

	//Y*2 -> squares instead of diamonds => 90° = PI/2
	//easyer calculations!
	var y = pageY * 2;

	//distance from origin to point in ISO
	var r = Math.sqrt((x*x) + (y*y));
	var theta = Math.atan2(x, y);
	var angle = (Math.PI/4) - theta;

	//length of the side of one tile (128/64 are mine)
	var rr = Math.sqrt(2*64*64);

	//’real x’ is the projection of screen distance by the angles cos
	var rx = Math.floor(r* Math.cos(angle) / rr);

	//’real x’ is the projection of screen distance by the angles sin
	var ry = Math.floor(r* Math.sin(angle) / rr);

	console.log("#### THE TILE: x:" + rx + " y:" + ry);
	return {x:rx, y:ry};
}

function getTileAt3(pageX, pageY) {
	var partW = TILE_W / 2;
	var partH = TILE_H / 2;
	
	var partX = Math.floor(pageX / partW);
	var partY = Math.floor(pageY / partH);
	
	var screenX = pageX;
	var screenY = pageY;

	var xDiv = Math.floor(screenX / partW);
	var yDiv = Math.floor(screenY / partH);

	var xCornerOfTheBox = xDiv * partW;
	var yCornerOfTheBox = yDiv * partH;

	var xDistanceFromCornerOfTheBox = screenX - xCornerOfTheBox;
	var yDistanceFromCornerOfTheBox = screenY - yCornerOfTheBox;

	var above = isAbovetheTileLine(xDiv, yDiv, 	xDistanceFromCornerOfTheBox, yDistanceFromCornerOfTheBox);

	var evenx = xDiv % 2 == 0;
	var eveny = yDiv % 2 == 0;

	var x;
	var y;
	var sx;
	var sy;
	
	if (evenx) {
		if (eveny) {
			if (above) {
				x = xDiv + 1;
				y = yDiv / 2;
			} else {
				x = xDiv;
				y = yDiv / 2;
			}
		} else {
			if (above) {
				x = xDiv;
				y = (yDiv - 1) / 2;
			} else {
				x = xDiv + 1;
				y = (yDiv - 1) / 2 + 1;
			}
		}
		
	} else {
		if (eveny) {
			if (above) {
				x = xDiv;
				y = yDiv / 2;
			} else {
				x = xDiv + 1;
				y = yDiv / 2;
			}
		} else {
			if (above) {
				x = xDiv + 1;
				y = (yDiv - 1) / 2;
			} else {
				x = xDiv;
				y = (yDiv - 1) / 2 + 1;
			}
		}
		
	}
	
	var offsetx = -TILE_W / 2 + TILE_W / 2 - player.image.width / 2;
	
	sx = offsetx + (x * (TILE_W / 2));
	var offsety = 0;
	if (x % 2 != 0) {
		offsety = -TILE_H / 2;
	}
	sy = offsety + (y * TILE_H) + TILE_H / 2 - player.image.height;

	console.log("#####GET TILE >>>> x:" + x + "y:" + y);
	return {x:sx, y:sy};
}

function isAbovetheTileLine(xDiv, yDiv, xDistanceFromCornerOfTheBox, yDistanceFromCornerOfTheBox) {
	var partW = TILE_W / 2;
	var partH = TILE_H / 2;
	
	var tangent = partW / partH;
	
	var above = true;

	var even = true;
	if ((xDiv + yDiv) % 2 == 0) {
		even = false;
	}
	var xToCalculateAdjacent = xDistanceFromCornerOfTheBox;
	var yToCalculateAdjacent = yDistanceFromCornerOfTheBox;

	if (even) {
		xToCalculateAdjacent = partW - xDistanceFromCornerOfTheBox;
	}

	var adjacent = Math.floor(xToCalculateAdjacent / tangent);

	if (yToCalculateAdjacent > adjacent) {
		above = false;
	}
	return above;
}

//direction: 0: left, 1: right, 2: up, 3: down
function changeToTile(direction) {
	var newx;
	var newy;
	var playerNewx;
	var playerNewy;
	
	switch (direction) {
		case 0:
			newx = currentTile.x - 1;
			newy = currentTile.y;
			playerNewx = width - player.getRect().width;
			playerNewy = player.y;
			break;
		case 1:
			newx = currentTile.x + 1;
			newy = currentTile.y;			
			playerNewx = 0;
			playerNewy = player.y;
			break;
		case 2:
			newx = currentTile.x;
			newy = currentTile.y - 1;
			playerNewx = player.x;
			playerNewy = worldHeight - player.getRect().height;
			break;
		case 3:
			newx = currentTile.x;
			newy = currentTile.y + 1;
			playerNewx = player.x;
			playerNewy = 0;
			break;
		default:
			"error, changeToTile, not allowed direction:" + direction;
	}
	
	if (tiles[newx] && tiles[newx][newy]) {
		tileOverlays.splice(0, tileOverlays.length);
		enemies.splice(0, enemies.length);
//		
		//FIXME
		for (var i in speechbubbles) {
			speechbubbles[i].remove();
		}
		speechbubbles.splice(0, speechbubbles.length);
		temp = true;
			
		currentTile = tiles[newx][newy];
		initCollectables();
		initNpcs();
		player.x = playerNewx;
		player.y = playerNewy;
		coordsTextOverlay.setCoords(newx, newy);
		selectCurrentMiniTile(newx, newy);
		
		for (var i in talkingCubes) {
			talkingCubes[i].remove();
		}
		for (var i in videos) {
			videos[i].remove();
		}
		/////////////////////////////////////////////////////////
		//hacks TODO remove / generic solution
		if (newx === 101 && newy === 100) {
			addTalkingCube(100, 100);
			addTalkingCube(50, 300);
			addTalkingCube(500, 350);
		}
		if (newx === 99 && newy === 99) {
			addVideo(50, 100);
		}
		/////////////////////////////////////////////////////////
	}
}

function onMouseMove(e) {
	if (currentAction === "walk") {
		var x = e.pageX;
		var y = e.pageY;
		var cursor;
	//	var lastArrowSet;
		var change = false;
		if (x < borderSize && y < worldHeight) {
			if (lastArrowSet != 0) {
				cursor = ARROW_LEFT_STR;
				lastArrowSet = 0;
				change = true;
			}
		} else if (x > borderRight && y < worldHeight) {
			if (lastArrowSet != 1) {
				cursor = ARROW_RIGHT_STR;
				lastArrowSet = 1;
				change = true;
			}
		} else if (y < borderSize) {
			if (lastArrowSet != 2) {
				cursor = ARROW_UP_STR;
				lastArrowSet = 2;
				change = true;
			}
		} else if (y > borderBottom && y < height - MENU_HEIGHT) {
			if (lastArrowSet != 3) {
				cursor = ARROW_DOWN_STR;
				lastArrowSet = 3;
				change = true;
			}
		} else {
			if (lastArrowSet != 4) {
				cursor = "default";
				lastArrowSet = 4;
				change = true;
			}
		}
		if (change) {
			$("#canvas").css('cursor', cursor);
		}
	} else {
		$("#canvas").css('cursor', "default");
		lastArrowSet = 4;
	}
}

function collides(o1, o2) {
	if (isInSquare(o1.x, o1.y, o2) || isInSquare(o1.x + o1.width, o1.y, o2) || isInSquare(o1.x + o1.width, o1.y + o1.height, o2) || isInSquare(o1.x, o1.y + height, o2)) {
		return true;
	}
	if (intersectsSquare(o1.x, o1.y, o1.y + o1.height, o2) || intersectsSquare(o1.x + o1.width, o1.y, o1.y + o1.height, o2)) {
		return true;
	}
	if (intersectsSquareY(o1.y, o1.x, o1.x + o1.width, o2) || intersectsSquareY(o1.y + o1.height, o1.x, o1.x + o1.width, o2)) {
		return true;
	}
	return false;
} 

function intersectsSquare(x, y1, y2, square) {
	if (x > square.x && x < square.x + square.width && y1 < square.y && y2 > square.y) {
		return true;
	}
}

function intersectsSquareY(y, x1, x2, square) {
	if (y > square.y && y < square.y + square.height && x1 < square.x && x2 > square.x) {
		return true;
	}
}

function isInSquare(x, y, square) {
	if (x > square.x && x < square.x + square.width && y > square.y && y < square.y + square.height) {
		return true;
	}
}

function clear() {  
	ctx.fillStyle = '#d0e7f9';  
	ctx.beginPath();  
	ctx.rect(0, 0, width, height);  
	ctx.closePath();  
	ctx.fill();  
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function Player() {
	this.stats = {vit:50, str:50, agi:50, cha:50, wis:50};

	this.vitC = 0;
	this.image = new Image();
	this.image.src = IMG_DIR + 'player.png';
	this.x = 0;
	this.y = 0;
	this.vel = 20;
//	this.rect = new Rect(this.x, this.y, this.image.width, this.image.height);
	this.rect;
	
	this.weapons = [];
	this.currentWeapon;
	
	this.clothes = [];
	
	//TODO implement as stack or more suitable data structure//////////
	this.currentPath;
	this.currentPathLength;
	this.currentPathIndex;
	///////////////////////////////////////////////////////////////////
	this.onTargetReached;
	this.onTargetReachedArgs;
	
	this.level = 1;
	
	this.incrementLevel = function() {
		this.level++;
		//get abs position of level img
		//add span with level at certain offset
	}
	
	//initialize stats
	for (var stat in this.stats) {
		$('#' + stat).width(this.stats[stat]);
	}
	
	this.setPosition = function(x, y) {
		this.x = x;
		this.y = y;
	};

	this.addWeapon = function(weapon) {
		this.weapons.push(weapon);
	}
	
	this.draw = function() {
		try {
            ctx.drawImage(this.image, this.x, this.y);
			//cutting source image and pasting it into destination one, drawImage(Image Object, source X, source Y, source Width, source Height, destination X (X position), destination Y (Y position), Destination width, Destination height)
            //draw stats
            for (var i in clothes) {
            	
            }
            $('#mercury').width(Math.min(300, this.vitC));
		} catch (e) {
			alert('exc:' + e);
		}
	};
	
	this.move = function(dir) {
		if (dir) {
			switch(dir) {
				case UP: this.y -= this.vel; break;
				case DOWN: this.y += this.vel; break;
				case RIGHT: this.x += this.vel; break;
				case LEFT: this.x -= this.vel; break;
			}
		} else {
			if (this.currentPath) {
				if (this.currentPathIndex < this.currentPathLength) {
					var pointToMove = this.currentPath[this.currentPathIndex];
					this.x = pointToMove.x;
					this.y = pointToMove.y;
					this.currentPathIndex++;
				} else {
					if (this.onTargetReached) {
						this.onTargetReached.apply(null, this.onTargetReachedArgs);
						delete this.onTargetReached;
						delete this.onTargetReachedArgs;
					}
					delete this.currentPath;
				}
			};
		}
	}
	
	this.getRect = function() {
		//TODO not create new object!
		return new Rect(this.x, this.y, this.image.width, this.image.height);
	};
	
	this.interact = function(item) {
//		console.log("interacting with item:" + item.type);
//			item.beConsumed(this, fruits);

		if (item.type === "consumable" && item.state !== "picked") {
			for (var element in item.elements) {
				//assumes element === stat
				if (this.canConsume(element)) {
					drawItemText(item.getConsumedText(element), item.getRect(), statColors[element]);
					this.incrementStat(element, item.elements[element]);
					delete item.elements[element];
				}
			}
			if (size(item.elements) > 0) {
				//TODO all items are consumable. differentiate between directly (food) and others
				//TODO remove directly and don't use "picked"
				
				//not consumable item or consumable was not completly consumed, collect
				drawInventoryText(item.name + ": +1 -> Inventory", item.getRect(), "#000000");
				inventory.addItem(item, 1);
				item.state = "picked";
			} else {
				console.log("consumed:" + item.name);
				//consumed item (maybe better delete directly?)
				item.state = "picked";
			}
		}
	};
	
	this.incrementStat = function(statName, value) {
		this.setStatValue(statName, this.stats[statName] + value);
	}
	
	this.setStatValue = function(statName, value) {
		this.stats[statName] = value;
		//TODO gui manager
		$('#' + statName).width(Math.min(300, value));
	}
	
	this.canConsume = function(element) {
		//assumes element === stat
		return this.stats.hasOwnProperty(element);
//		return contains(this.stats, element);
	}
	
	this.walkTo = function(x, y, onTargetReached, onTargetReachedArgs) {
		this.currentPath = getLinearPath({x: this.x, y: this.y}, {x: x, y: y}, this.vel);
		this.currentPathLength = this.currentPath.length;
		this.currentPathIndex = 0;
		this.onTargetReached = onTargetReached;
		this.onTargetReachedArgs = onTargetReachedArgs;
	}
	
	//FIXME method
	this.shoot = function(x, y) {
		this.weapons[this.currentWeapon].shoot(this.x, this.y, x, y);
	}
	
	//TODO layering clothes types, no coordinates, clothes class etc.
	this.addClothe = function(x, y, bitmap) {
		this.clothes.push({x: x, y: y, bitmap: bitmap});
	}
}

function Item(name, img) {
	this.name = name;
	this.invImage = new Image();
	this.invImage.src = IMG_DIR + img;
	this.realImage = new Image();
	this.realImage.src = IMG_DIR + img;
	
	this.draw = function() {
		try {
            ctx.drawImage(this.realImage, this.x, this.y);
			//cutting source image and pasting it into destination one, drawImage(Image Object, source X, source Y, source Width, source Height, destination X (X position), destination Y (Y position), Destination width, Destination height)
		} catch (e) {
			alert('exc:' + e);
		}
	};
	
	this.equals = function(other) {
		//for now item equality only name based. more characteristics includable, like stats. this would allow having multiple inventory entries for same item type, based in element differences
	     return other.name == this.name;
	};
	
	this.hashCode = function() {
		return this.name;
	};
}

//TODO rename fruit -> consumable, consumable extends item
//position property of consumable ? after collected?
function Fruit(name, x, y, img, points, index, itemStates) {
	this.name = name;
	///////////////////////////////////////////////////
	//TODO typesystem
	this.type = name === "button" ? "button" : "consumable"; 
	this.state = "consumable";
	this.elements = {};
	this.index = index;
	
	this.itemStates = itemStates;
	this.currentState;
	
	switch (name) {
		case "water":
			this.elements = {cha:3};
		break;
		case "pear":
			this.elements = {wis:3};
		break;
		case "orange":
			this.elements = {agi:3};
		break;
		case "banana":
			this.elements = {str:3};
		break;
		case "apple":
			this.elements = {vit:3};
		break;
		case "coal":
			this.elements = {energy:5};
		break;
		case "iron":
			this.elements = {iron:1};
		break;
		case "shield":
			this.elements = {protect_earth:3};
		break;
		case "slime":
			this.elements = {slime:1};
		break;
		case "cap":
			this.elements = {cap:1};
	}
	///////////////////////////////////////////////////
	this.invImage = new Image();
	this.invImage.src = IMG_DIR + img;
	this.realImage = new Image();
	this.realImage.src = IMG_DIR + img;
	
	this.x = x;
	this.y = y;
	this.rect;
//	this.rect = new Rect(this.x, this.y, this.image.width, this.image.height);
	
	this.setPosition = function(x, y) {
		this.x = x;
		this.y = y;
	};
	
	this.draw = function() {
		try {
            ctx.drawImage(this.realImage, this.x, this.y);
			//cutting source image and pasting it into destination one, drawImage(Image Object, source X, source Y, source Width, source Height, destination X (X position), destination Y (Y position), Destination width, Destination height)
		} catch (e) {
			alert('exc:' + e);
		}
	};
	
	this.getRect = function() {
		//TODO not create new object!
		return new Rect(this.x, this.y, this.realImage.width, this.realImage.height);
	};
	
//	this.beConsumed = function(consumer) {
//		if (this.state !== "picked") {
//			for (var element in this.elements) {
//				//assumes element === stat
//				if (consumer.canConsume(element)) {
//					drawItemText(this.getConsumedText(element), this.getRect(), statColors[element]);
//					consumer.incrementStat(element, this.elements[element]);
//				}
//			}
//			//assumes can be consumed only one time
//			this.state = "picked";
//		}
//	};
	
	this.getConsumedText = function(element) {
		return this.name + ": +" + this.elements[element] + " " + element;
	}
	
	this.equals = function(other) {
		//for now item equality only name based. more characteristics includable, like stats. this would allow having multiple inventory entries for same item type, based in element differences
	     return other.name == this.name;
	};
	
	this.hashCode = function() {
		return this.name;
	};
	
//	this.goToNextState = function() {
//		currentState++;
//		if () {
//			
//		}
//	}
	
	this.loopState = function() {
		this.setState(this.currentState + 1 % this.itemStates.length);
	}
	
	//set a state and trigger function attached to it. only works when the state changes
	this.setState = function(state) {
		if (this.currentState !== state) {
			this.currentState = state;
			var newState = this.itemStates[state];
			if (newState) {
				this.realImage = newState.image;
				newState.action();
			}
		}
	}
}

//TODO? image could be also a function to draw the visual representation (animation, html etc)
function ItemState(imageFileName, action) {
	this.image = new Image();
	this.image.src = imageFileName;
	this.action = action;
}

////////////////////menu//////////////////////////////////////////////////////////////////////////////////////
function Menu() {
	this.HEIGHT = MENU_HEIGHT;
	this.items = new Array();
	this.itemWidth = 28;
	this.itemHeight = 27;
	this.x = 0;
	this.y = height - this.HEIGHT;
	this.INITIAL_OFFSET = 5;
	
	this.draw = function() {
		ctx.fillStyle = '#0000FF';  
		ctx.beginPath();
		ctx.rect(0, this.y, width, height);  
		ctx.closePath();  
		ctx.fill();
		
		//TODO z order?
		for (var i in this.items) {
			this.items[i].draw();
		}
	}
	
//	this.addMenuItemToRow(imgSrc, position) {
//		var x = width - (itemWidth * (items.length + 1));
//		var y = HEIGHT - (itemHeight / 2);
//		addMenuItem(imgSrc, x, y);
//	}
	
//	this.addMenuItem(imgSrc, x, y) {
//		var item = new MenuItem(imgSrc, x, y);
//		items.push(item);
//	}
	
	this.addMenuItemToRow = function(menuItem, position) {
		var x = width - (this.itemWidth * (this.items.length + 1)) - this.INITIAL_OFFSET;
//		var y = this.y + ((this.HEIGHT - menuItem.getHeight()) / 2);
		var y = 462;
		menuItem.x = x;
		menuItem.y = y;
		this.addMenuItem(menuItem);
	}
	
	this.addMenuItem = function(menuItem) {
		this.items.push(menuItem);
	}
	
	this.getRect = function() {
		//TODO not create new object!
		return new Rect(this.x, this.y, width, height);
	};
	
//	this.addEventListener = function(eventName, listenerFunction) {
//		if (!this.eventListeners[eventName]) {
//			this.eventListeners[eventName] = [];
//		}
//		console.log(this.eventListeners[eventName]);
//		this.eventListeners[eventName].push(listenerFunction);
//	};
	
	this.handleEvent = function(eventName, par) {
		switch (eventName) {
			case "click": 
				//do menu checks
				//forward to children
				//REVIEW strange system, investigate about generic display lists and event forwarding
				for (var i in this.items) {
					if (isInSquare(par.x, par.y, this.items[i].getRect())) {
						//asummes only one item at position
						this.items[i].handleEvent("click");
					}
				}
			break;
		}
	}
}

function MenuItem(imgSrc, x, y) {
	this.img = new Image();
	this.img.src = imgSrc;
	//this variable is free to set to anything, which represents the current state of this item in a useful way
	//i = initial
	this.state = "i";
	this.x = x;
	this.y = y;
	
	//TODO this depends of this.state - how to encapsulate in safe way?
	//states: range available. menuitems can have different ranges
	//default action map for default states.
	//TODO set map from outside.
	this.stateActions = {i:this.onInitial, e:this.onEnabled, d:this.onDisabled};
	
	this.eventListeners = {state:this.onSetState};
	
	this.draw = function() {
		ctx.drawImage(this.img, this.x, this.y);
	}
	
	this.handleEvent = function(eventName) {
		var listeners = this.eventListeners[eventName];
		if (listeners) {
			for (var i in listeners) {
				listeners[i](this);
			}
		}
	}
	
	this.addEventListener = function(eventName, listenerFunction) {
		if (!this.eventListeners[eventName]) {
			this.eventListeners[eventName] = [];
		}
		this.eventListeners[eventName].push(listenerFunction);
	};
	
	this.setState = function(state) {
		this.state = state;
		this.handleEvent("state", state);
	}
	
//	this.handleEvent = function(eventName, par) {
//		switch (eventName) {
//			case "state": onSetState(par); break;
//		}
//	}
	
	this.onSetState = function(state) {
		if (stateActions[state]) {
			stateActions[state](this);
		}
	}
	
	this.getHeight = function() {
		return this.img.height;
	}
	
	this.getWidth = function() {
		return this.img.width;
	}
	/////////////////////////////////////////////////////////////////////////////////////
	//define outside menuitem in default menu item or something
	this.onInitial = function(menuItem) {
		//nothing
	}
	this.onEnabled = function(menuItem) {
		//enable click
		//remove filter
	}
	this.onDisabled = function(menuItem) {
		//disable click
		//add filter
	}
	/////////////////////////////////////////////////////////////////////////////////////
	
	
//	this.addStateAction = function(state, action) {
//		if (states)
//	}
	
	this.getRect = function() {
		return new Rect(this.x, this.y, this.img.width, this.img.height);
	};
	
//	this.onObserverNotification(not, arg) = function {
//		switch(not) {
//			case "close":
//			
//			break;
//		}
//	}
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
//inventory functions
//TODO generic

function initMenuItems() {
	var menuItem = new MenuItem(IMG_DIR + 'menu_inv.png');
	menuItem.addEventListener("click", onClickInventoryMenuItem);
	menu.addMenuItemToRow(menuItem, 0);
	
	menuItem = new MenuItem(IMG_DIR + 'menu_about.png');
	menuItem.x = 10;
	menuItem.y = 462;
	menuItem.addEventListener("click", onClickAboutMenuItem);
	menu.addMenuItem(menuItem);
	
	menuItem = new MenuItem(IMG_DIR + 'menu_clothes.png');
	menuItem.x = 50;
	menuItem.y = 462;
	menuItem.addEventListener("click", onClickClothesMenuItem);
	menu.addMenuItem(menuItem);
}

function onClickInventoryMenuItem(menuItem) {
	if (menuItem.state === "e" || menuItem.state === "i") {
		openInventory(function() {menuItem.state = "e"}); //close callback enables menuitem again
		menuItem.state = "a";
	} else {
		//active
		menuItem.state = "e";
		closeInventory();
	}
}

function onClickAboutMenuItem(menuItem) {
	if (menuItem.state === "e" || menuItem.state === "i") {
		openAbout(function() {menuItem.state = "e"}); //close callback enables menuitem again
		menuItem.state = "a";
	} else {
		//active
		menuItem.state = "e";
		closeAbout();
	}
}

function onClickClothesMenuItem(menuItem) {
	if (menuItem.state === "e" || menuItem.state === "i") {
		openClothes(function() {menuItem.state = "e"}); //close callback enables menuitem again
		menuItem.state = "a";
	} else {
		//active
		menuItem.state = "e";
		closeClothes();
	}
}

function openInventory(closeCallback) {
	inventory.setCloseCallback(closeCallback);
	inventory.open();
}

function openAbout(closeCallback) {
	about.setCloseCallback(closeCallback);
	about.open();
}

function openClothes(closeCallback) {
//	clothes.setCloseCallback(closeCallback);
	//TODO
	//clothes.open();
	$("#clothes").css("left", (width - 400) / 2 + "px").css("top", (height - 300) / 2 + "px");
	$("#clothes").show();
}

function closeInventory() {
//	hud.splice(hud.indexOf(inventory), 1);
	inventory.close();
}

function closeAbout() {
//	hud.splice(hud.indexOf(inventory), 1);
	about.close();
}

function closeClothes() {
//	hud.splice(hud.indexOf(inventory), 1);
	//TODO
	//clothes.close();
	$("#clothes").hide();
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

function Rect(x, y, width, height) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	
	this.toString = function() {
		return "Rect x:" + x + ", y:" + y + ", width:" + width + ", height:" + height;
	}
}

function About() {
	this.closeCallback;
	this.x = (width - 512) / 2;
	this.y = 5; //TODO height - menu.height
	
	this.setCloseCallback = function(closeCallback) {
		this.closeCallback = closeCallback;
	}
	
	this.open = function() {
		var aboutDiv = $("#about").show();
		aboutDiv.css("left", this.x).css("top", this.y);
		
		webGLStart(document.getElementById('glcanvas'));
	}
	
	this.close = function() {
		var aboutDiv = $("#about");
		aboutDiv.hide();
		if (this.closeCallback) {
			this.closeCallback();
		}
	}
}

function Inventory() {
	this.objects = new Array(); //entities, also implement interface drawable
	this.closeCallback;
	this.x = (width - INV_WIDTH) / 2;
	this.y = (height - INV_HEIGHT) / 2; //TODO height - menu.height
	
	//TODO ordered hash map////
	this.model = [];
	this.itemCount = {};
	//////////////////////////
	
	this.updateView = true;
		
	this.addObject = function(object) {
		this.objects.push(object);
		this.updateView = true;
	}
	
	this.draw = function() {
		ctx.beginPath();
		
		ctx.rect(
				this.x, 
				this.y,
				INV_WIDTH, INV_HEIGHT);
		ctx.fillStyle = "#000000";
		ctx.fill();
		ctx.lineWidth = INV_BORDER;
		ctx.strokeStyle = "#993300";
		ctx.stroke();
		
		var entity;
		for (var i = 0; i < this.objects.length; i++) {
			entity = this.objects[i];
			entity.draw();
		}
	}
	
	this.setCloseCallback = function(closeCallback) {
		this.closeCallback = closeCallback;
	}
	
	this.open = function() {
		//add to overlay system
//		hud.push(this);
		
		var inventoryDiv = $("#inventory");
		if (this.updateView) {
			
			inventoryDiv.empty(); //FIX not efficient
			inventoryDiv.css("left", this.x).css("top", this.y).css("width", INV_WIDTH).css("height", INV_HEIGHT);
			
			//make inventory visible
			for (var i = 0; i < INV_COLS * INV_ROWS; i++) {
				//add div with height + INV_COUNT_HEIGHT and width INV_ITEM_SIZE
				var x = i % INV_COLS;
				var y = Math.floor(i / INV_COLS);
				
				var itemDiv = $("<div></div>");
				itemDiv.attr("id", "inv_item" + i);
				itemDiv.addClass("inventory_item");
				itemDiv.css("width", INV_ITEM_SIZE).css("height", INV_ITEM_SIZE);
				
				itemDiv.css("left", INV_BORDER + INV_PADDING + (INV_PADDING + INV_ITEM_SIZE) * x);
				itemDiv.css("top", INV_BORDER + INV_PADDING + (INV_PADDING + INV_ITEM_SIZE) * y);
				inventoryDiv.append(itemDiv);
			}
			
			for (var i = 0; i < this.model.length; i++) {
				var itemDiv = $("#inv_item" + i);
				var item = this.model[i];
				
				var itemImg = $("<img/>");
				itemImg.attr("height", INV_ITEM_SIZE - INV_COUNT_HEIGHT * 2);
				itemImg.attr("width", INV_ITEM_SIZE);
				itemImg.attr("src", item.invImage.src);
				itemDiv.append(itemImg);
				
				var itemNameDiv =  $("<div></div>");
				itemNameDiv.css("width", INV_ITEM_SIZE).css("height", INV_COUNT_HEIGHT);
				itemNameDiv.css("border-top", "1px solid #000000");
				itemNameDiv.css("background-color", "#AAFFAA");
				itemNameDiv.text(item.name);
				itemDiv.append(itemNameDiv);
				
				var itemCountDiv =  $("<div></div>");
				itemCountDiv.css("width", INV_ITEM_SIZE).css("height", INV_COUNT_HEIGHT);
				itemCountDiv.text(this.itemCount[item.hashCode()]);
				itemCountDiv.css("background-color", "#333333");
				itemCountDiv.css("color", "#FFFFFF");
				itemDiv.append(itemCountDiv);
				
				itemDiv.mouseover(function() {
					//green background fade in
				});
				
				itemDiv.click(function() {
					console.log("item clicked!");
				});
			}
			this.updateView = false;
		}
		
		inventoryDiv.show();
	}
	
	this.close = function() {
		var inventoryDiv = $("#inventory");
		inventoryDiv.hide();
//		for (var i = 0; i < hud.length; i++) {
//			if (hud[i] === this) {
//				hud.splice(i, 1);
//			}
//		}
		if (this.closeCallback) {
			this.closeCallback();
		}
	}
	
	this.getRect = function() {
		//TODO don't create new object!
		return new Rect(this.x, this.y, INV_WIDTH, INV_HEIGHT);
	};
	
	this.addItem = function(item, count) {
		if (!contains(this.model, item)) { //quickfix for now only name
			this.model.push(item);
			this.itemCount[item.hashCode()] = count;
		} else {
			this.itemCount[item.hashCode()] += count;
		}
		this.updateView = true;
	}
}

function Entity() {
	
	this.draw = function() {
	
	}
	
	this.drawInv = function(ctx, x, y) {
		this.draw(this.invImage);
	}
	
	this.drawWorld = function(ctx, x, y) {
		this.draw(this.realImage);
	}
}

/////////////////////////////framework OO//////////////////////////////////////////////////////////////////////////////
if (typeof Object.create !== 'function') {
    Object.create = function (o) {
        function F() {}
        F.prototype = o;
        return new F();
    };
}

////////////////////////////observer////////////////////////////////////////////////////////////////////////////////////
//var observerMap = new Array();


////////////////////////////canvas//////////////////////////////////////////////////////////////////////////////////////
function ItemText(text, x, y, color, index) {
	this.TIME = 3000;
	
	this.text = text;
	this.x = x;
	this.y = y;
	this.color = color;
	this.alpha = 1;
	
	var that = this;
	setTimeout(function(){that.remove()}, this.TIME);
	
	this.draw = function() {
		ctx.fillStyle = this.color;
	    ctx.font = "italic 10pt Arial";
	    ctx.fillText(this.text, this.x, this.y);
	}
	
	this.remove = function() {
		//FIXME stop and remove all timers on tile change instead of this check
		var index = tileOverlays.indexOf(this);
		if (index != -1) {
			tileOverlays.splice(index, 1);
		}
	}
}

function CoordsText(xCoord, yCoord) {
	this.x = 5;
	this.y = 20;
	this.color = "#000000";
	this.xCoord;
	this.yCoord;
	this.text;
	
	this.draw = function() {
		ctx.fillStyle = this.color;
	    ctx.font = "12pt Arial";
	    ctx.fillText(this.text, this.x, this.y);
	}
	
	this.setCoords = function(xCoord, yCoord) {
		this.xCoord = xCoord;
		this.yCoord = yCoord;
		this.text = xCoord + " x " + yCoord;
	}

	this.setCoords(xCoord, yCoord);
}

function drawItemText(text, itemRect, color) {
	tileOverlays.push(new ItemText(text, itemRect.x + (itemRect.width / 2), itemRect.y - 10, color, tileOverlays.length));
//	drawFillText(text, itemRect.x + (itemRect.width / 2), itemRect.y - 10, color);
}

function drawInventoryText(text, itemRect, color) {
	tileOverlays.push(new ItemText(text, itemRect.x + (itemRect.width / 2), itemRect.y - 10, color, tileOverlays.length));
//	drawFillText(text, itemRect.x + (itemRect.width / 2), itemRect.y - 10, color);
}

//function drawFillText(text, x, y, color) {
//	console.log("drawing text:" + text + "at " + x + " " + y + " c:" + color);
//	ctx.fillStyle = color;
////    ctx.strokeStyle = "#F00";
//    ctx.font = "italic 10pt Arial";
//    ctx.fillText(text, x, y);
//    //ctx.font = 'bold 30px sans-serif';
//    //ctx.strokeText("Stroke text", 20, 100); 
//}

////////////////////////////utilities/////////////////////////////////////////////////////////////////////////////////////
//copied from http://bytes.com/topic/javascript/answers/91636-getting-class-name-string 
function getClassName(obj) {
	if (typeof obj != "object" || obj === null) return false;
	return /(\w+)\(/.exec(obj.constructor.toString())[1];
}

//Array.prototype.contains = function(obj) {
function contains(a, obj) {
	for (var key in a) {
    	if (a[key].equals) {
    		if (a[key].equals(obj)) {
    			return true;
    		}
    	} else {
    		if (a[key] === obj) {
    			return true;
    		}
    	}
	}
    return false;
}

function size(obj) {
	var count = 0;
	for (var key in obj) {
	    if (obj.hasOwnProperty(key)) {
	       count++;
	    }
	}
	return count;
}

//from http://html5demos.com/js/h5utils.js
var addEvent = (function () {
	  if (document.addEventListener) {
	    return function (el, type, fn) {
	      if (el && el.nodeName || el === window) {
	        el.addEventListener(type, fn, false);
	      } else if (el && el.length) {
	        for (var i = 0; i < el.length; i++) {
	          addEvent(el[i], type, fn);
	        }
	      }
	    };
	  } else {
	    return function (el, type, fn) {
	      if (el && el.nodeName || el === window) {
	        el.attachEvent('on' + type, function () { return fn.call(el, window.event); });
	      } else if (el && el.length) {
	        for (var i = 0; i < el.length; i++) {
	          addEvent(el[i], type, fn);
	        }
	      }
	    };
	  }
	})();
////////////////////////////utilities2/////////////////////////////////////////////////////////////////////////////////////
function getLinearPath(p1, p2, speed) {
	var path = new Array();
	var vector = {x: p2.x - p1.x, y: p2.y - p1.y};
	var vectorBetrag = lineDistance(p1, p2);
	var evector = {x: vector.x / vectorBetrag, y: vector.y / vectorBetrag};
	
	var i = 1;
	var betrag = i * speed;
	var partVector;
	while (betrag < vectorBetrag) {
		partVector = {x: evector.x * betrag + p1.x, y: evector.y * betrag + p1.y};
		path.push(partVector);
		betrag = ++i * speed;
	}
	path.push(p2);
	return path;
}

function lineDistance(p1, p2) {
  var c1 = p2.x - p1.x;
  c1 *=  c1;
  var c2 = p2.y - p1.y;
  c2 *= c2;
  return Math.sqrt(c1 + c2);
}

/////////////////////////////event////////////////////////////////////////////////////////////////////////////////////////
function Event(name) {
	this.name = name;
}

function MouseEvent(x, y) {
	this.x = x;
	this.y = y;
}

/////////////////////////////CSS hud////////////////////////////////////////////////////////////////////////////////////////
//function openInventory() {
//	
//}

/////////////////////////////map////////////////////////////////////////////////////////////////////////////////////////////
function initTile(x, y) {
	currentTile = tiles[x][y];
}

function getTile(x, y) {
	
}

function Tile(x, y, bgImgPath, items, npcs) {
	this.x = x;
	this.y = y;
	this.bgImg = new Image();
	this.bgImg.src = bgImgPath;
	
	this.itemsLight = items;
	this.npcs = npcs;
}

function initMap() {
	//init surrounding and current tile cache
	initTiles();
	//init current tile
	currentTile = tiles[100][100];
	//add collectable items of current tile to the map
	initCollectables();
	//init text overlay with coords
	coordsTextOverlay = new CoordsText(100, 100);
	textOverlays.push(coordsTextOverlay);
}

function initCollectables() {
	fruits.splice(0, fruits.length);
	for (var index in currentTile.itemsLight) {
		var itemLight = currentTile.itemsLight[index];
		fruits.push(new Fruit(itemLight.name, itemLight.x, itemLight.y, itemLight.name + ".png", 50, fruits.length));
	}
}

function initNpcs() {
	npcs.splice(0, npcs.length);
	for (var index in currentTile.npcs) {
		var npc = currentTile.npcs[index];
		npcs.push(new Npc(npc.name, npc.x, npc.y, npc.img));
	}
}

//populate with tiles from server instead
function initTiles() {
	tiles[99] = [];
	tiles[100] = [];
	tiles[101] = [];

	tiles[100][100] = new Tile(100, 100, IMG_DIR + "bg100x100.png", [
		{name:"apple", x:50, y:50}, {name:"banana", x:300, y:60}, {name:"coal", x:500, y:30}, {name:"iron", x:20, y:100}, {name:"apple", x:400, y:150}, {name:"pear", x:650, y:200}, 
		{name:"water", x:500, y:500}, {name:"water", x:600, y:550}, {name:"coal", x:400, y:600}, {name:"orange", x:300, y:500}, {name:"apple", x:10, y:670}, {name:"pear", x:50, y:700}, 
		{name:"shield", x:200, y:600}, {name:"coal", x:400, y:350}, {name:"banana", x:100, y:310}, {name:"iron", x:600, y:450}, {name:"orange", x:340, y:300}, {name:"water", x:600, y:480}
	],
   	//npcs
   	[{name:"seller", x:100, y:100, img: IMG_DIR + "seller.png"}]
	);
	tiles[99][99] = new Tile(99, 99, IMG_DIR + "bg99x99.png", [
   		{name:"coal", x:50, y:50}, {name:"coal", x:300, y:60}, {name:"coal", x:500, y:30}, {name:"coal", x:20, y:100}, {name:"coal", x:400, y:150}, {name:"coal", x:250, y:200}, 
   		{name:"coal", x:500, y:500}, {name:"coal", x:600, y:550}, {name:"coal", x:670, y:600}, {name:"coal", x:100, y:400}, {name:"coal", x:10, y:470}, {name:"coal", x:50, y:200}, 
   		{name:"shield", x:200, y:500}, {name:"coal", x:400, y:350}, {name:"coal", x:650, y:510}, {name:"iron", x:100, y:350}, {name:"coal", x:340, y:300}, {name:"coal", x:500, y:470}
   	]
	);
	tiles[100][99] = new Tile(100, 99, IMG_DIR + "bg100x99.png", [
  		{name:"shield", x:50, y:50}, {name:"shield", x:300, y:60}, {name:"shield", x:500, y:30}, {name:"shield", x:20, y:100}, {name:"shield", x:400, y:150}, {name:"shield", x:250, y:200}, 
  		{name:"shield", x:500, y:500}, {name:"water", x:670, y:550}, {name:"shield", x:500, y:500}, {name:"shield", x:300, y:300}, {name:"shield", x:10, y:370}, {name:"shield", x:50, y:100}, 
  		{name:"shield", x:200, y:500}, {name:"shield", x:400, y:150}, {name:"shield", x:500, y:50}, {name:"shield", x:400, y:450}, {name:"shield", x:340, y:300}, {name:"water", x:600, y:420}
  	]);
	tiles[101][99] = new Tile(101, 99, IMG_DIR + "bg101x99.png", [
  		{name:"apple", x:50, y:50}, {name:"apple", x:300, y:60}, {name:"apple", x:500, y:30}, {name:"apple", x:20, y:100}, {name:"apple", x:400, y:150}, {name:"pear", x:250, y:200}, 
  		{name:"water", x:400, y:400}, {name:"apple", x:600, y:550}, {name:"apple", x:100, y:300}, {name:"apple", x:300, y:500}, {name:"apple", x:10, y:340}, {name:"apple", x:50, y:280}, 
  		{name:"apple", x:200, y:300}, {name:"apple", x:400, y:350}, {name:"apple", x:500, y:410}, {name:"iron", x:650, y:450}, {name:"apple", x:340, y:300}, {name:"water", x:600, y:470}
  	]);
	tiles[99][100] = new Tile(99, 100, IMG_DIR + "bg99x100.png", [
  		{name:"water", x:50, y:50}, {name:"water", x:300, y:60}, {name:"water", x:500, y:30}, {name:"water", x:20, y:100}, {name:"water", x:400, y:150}, {name:"water", x:650, y:200}, 
  		{name:"water", x:500, y:500}, {name:"water", x:1000, y:550}, {name:"water", x:1100, y:600}, {name:"water", x:1000, y:600}, {name:"water", x:10, y:670}, {name:"water", x:50, y:700}, 
  		{name:"water", x:200, y:600}, {name:"water", x:400, y:650}, {name:"water", x:900, y:710}, {name:"water", x:1000, y:750}, {name:"water", x:340, y:300}, {name:"water", x:600, y:490}
  	]);
	tiles[101][100] = new Tile(101, 100, IMG_DIR + "bg101x100.png", [
  		{name:"banana", x:50, y:50}, {name:"banana", x:300, y:60}, {name:"banana", x:500, y:30}, {name:"banana", x:20, y:100}, {name:"apple", x:400, y:150}, {name:"banana", x:850, y:200}, 
  		{name:"banana", x:500, y:400}, {name:"banana", x:100, y:150}, {name:"banana", x:200, y:400}, {name:"orange", x:150, y:400}, {name:"apple", x:10, y:300}, {name:"banana", x:50, y:450}, 
  		{name:"banana", x:200, y:600}, {name:"banana", x:400, y:650}, {name:"banana", x:900, y:710}, {name:"banana", x:1000, y:750}, {name:"banana", x:340, y:300}, {name:"water", x:600, y:490}
  	]);
	tiles[99][101] = new Tile(99, 101, IMG_DIR + "bg99x101.png", [
  		{name:"pear", x:50, y:50}, {name:"pear", x:300, y:60}, {name:"pear", x:500, y:30}, {name:"pear", x:20, y:100}, {name:"pear", x:400, y:150}, {name:"pear", x:850, y:200}, 
  		{name:"pear", x:500, y:500}, {name:"pear", x:1000, y:550}, {name:"pear", x:1100, y:600}, {name:"pear", x:1000, y:600}, {name:"pear", x:10, y:670}, {name:"pear", x:50, y:700}, 
  		{name:"pear", x:200, y:400}, {name:"pear", x:400, y:390}, {name:"pear", x:90, y:330}, {name:"pear", x:500, y:300}, {name:"pear", x:650, y:400}, {name:"water", x:600, y:80}
  	]);
	tiles[100][101] = new Tile(100, 101, IMG_DIR + "bg100x101.png", [
  		{name:"orange", x:50, y:50}, {name:"orange", x:300, y:60}, {name:"orange", x:500, y:30}, {name:"orange", x:20, y:100}, {name:"apple", x:400, y:150}, {name:"orange", x:350, y:200}, 
  		{name:"orange", x:500, y:500}, {name:"water", x:200, y:250}, {name:"orange", x:600, y:300}, {name:"orange", x:100, y:300}, {name:"orange", x:10, y:410}, {name:"orange", x:50, y:450}, 
  		{name:"orange", x:200, y:390}, {name:"orange", x:400, y:150}, {name:"orange", x:300, y:310}, {name:"orange", x:680, y:450}, {name:"orange", x:340, y:300}, {name:"water", x:600, y:480}
  	]);
	tiles[101][101] = new Tile(101, 101, IMG_DIR + "bg101x101.png", [
		{name:"apple", x:50, y:50}, {name:"iron", x:300, y:60}, {name:"iron", x:500, y:30}, {name:"iron", x:20, y:100}, {name:"apple", x:400, y:150}, {name:"iron", x:550, y:200}, 
		{name:"iron", x:500, y:500}, {name:"iron", x:670, y:350}, {name:"iron", x:10, y:300}, {name:"iron", x:600, y:400}, {name:"iron", x:10, y:470}, {name:"iron", x:50, y:200}, 
		{name:"iron", x:200, y:100}, {name:"iron", x:400, y:350}, {name:"iron", x:300, y:210}, {name:"iron", x:400, y:550}, {name:"iron", x:340, y:300}, {name:"iron", x:600, y:490}
	]);
}

/////////////////////////////minimap////////////////////////////////////////////////////////////////////////////////////////////
function MinimapTile(x, y, bgImgPath) {
	this.x = x;
	this.y = y;
	this.bgImgPath = bgImgPath;
	
	//save here to avoid dom traversal each time
	//TODO decouple
	this.domElement;
}

function initMinimap() {
	initMinimapTiles();
	
	//draw tiles in minimap
//	var tileWidth = 200;
	var tileWidth = 90;
//	var tileHeight = 125;
	var tileHeight = 64;
	var tilesInRow = 3;
	
	var minimapWidth = ((tileWidth + 2) * tilesInRow) + "px";
	$("#minimap").css("width", minimapWidth); //6px border
	var minimapWrapper = $("#minimap #wrapper");
	minimapWrapper.css("width", minimapWidth); //6px border
	var minimapLabel = $("#minimap .label");
	minimapLabel.css("width", minimapWidth); //6px border
	
	for (var y = 99; y < 102; y++) {
		for (var x = 99; x < 102; x++) {
			var img = $("<img/>").attr("src", minimapTiles[x][y].bgImgPath);
			minimapTiles[x][y].domElement = img;
			minimapWrapper.append(img);
		}
//		minimap.append($("<div class='clear' />"));
	}

	selectCurrentMiniTile(100, 100);
	//scrollable, later: drag & drop move
	
	//draw currentposition in tile
	
	//center around certain tile?
}

function initMinimapTiles() {
	minimapTiles[99] = [];
	minimapTiles[100] = [];
	minimapTiles[101] = [];
	minimapTiles[99][99] = new MinimapTile(99, 99, IMG_DIR + "mini_1/bg99x99.png");
	minimapTiles[100][99] = new MinimapTile(100, 99, IMG_DIR + "mini_1/bg100x99.png");
	minimapTiles[101][99] = new MinimapTile(101, 99, IMG_DIR + "mini_1/bg101x99.png");
	minimapTiles[99][100] = new MinimapTile(99, 100, IMG_DIR + "mini_1/bg99x100.png");
	minimapTiles[100][100] = new MinimapTile(100, 100, IMG_DIR + "mini_1/bg100x100.png");
	minimapTiles[101][100] = new MinimapTile(101, 99, IMG_DIR + "mini_1/bg101x100.png");
	minimapTiles[99][101] = new MinimapTile(99, 101, IMG_DIR + "mini_1/bg99x101.png");
	minimapTiles[100][101] = new MinimapTile(100, 101, IMG_DIR + "mini_1/bg100x101.png");
	minimapTiles[101][101] = new MinimapTile(101, 101, IMG_DIR + "mini_1/bg101x101.png");
}

function selectCurrentMiniTile(x, y) {
	if (markedMinimapTile) {
		markedMinimapTile.css("outline", "");
	}
	markedMinimapTile = $(minimapTiles[x][y].domElement);
	markedMinimapTile.css("outline", "2px solid #000000");
}

//TODO method of minimap class
function displayPlayerPosition(playerx, playery) {
	
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function Enemy(x, y, imgName) {
	this.x = x;
	this.y = y;
	this.imgName = imgName;
	
	this.image = new Image();
	this.image.src = IMG_DIR + imgName + "1.png";
	this.rotation;
	
	this.vel = 1;

	this.live = 3;
	//TODO implement as stack or more suitable data structure//////////
	this.currentPath;
	this.currentPathLength;
	this.currentPathIndex;
	///////////////////////////////////////////////////////////////////
	this.onTargetReached;
	this.onTargetReachedArgs;
	
	this.animation = ["insect1.png", "insect2.png", "insect3.png"];
	this.drops = ["slime", "cap"];
	
	var that = this;
	
	this.draw = function() {
		//TODO rotate image
		ctx.drawImage(this.image, this.x, this.y);
	}
	
	this.move = function() {
		if (this.currentPath) {
			if (this.currentPathIndex < this.currentPathLength) {
//				console.log("and we are not finished with it: currentPathIndex:" + this.currentPathIndex + " currentPathlength:" + this.currentPathLength);
				var pointToMove = this.currentPath[this.currentPathIndex];
				this.x = pointToMove.x;
				this.y = pointToMove.y;
				this.currentPathIndex++;
			} else {
//				if (this.onTargetReached) {
//					console.log("calling onTargetReached:" + this.onTargetReached);
					//FIXME refactor with Player
					delete this.currentPath;
					
					//FIXME scope why this doesn't work - this.walkToRandomTarget in walkToRandomTarget is undefined
//					this.onTargetReached.apply(this, this.onTargetReachedArgs);
					this.walkToRandomTarget();
					this.currentTargetx = Math.random() * width;
					this.currentTargety = Math.random() * worldHeight;
//					console.log("#######################that:" + that + " calling walkTo, walkToRandomTarget is:" + this.walkToRandomTarget);
					this.walkTo(this.currentTargetx, this.currentTargety);
					
//					delete this.onTargetReached;
//					delete this.onTargetReachedArgs;
//				}
			}
		};
	}
	
	this.walkTo = function(x, y) {
		this.currentPath = getLinearPath({x: this.x, y: this.y}, {x: x, y: y}, this.vel);
		//TODO also get direction vector
		//get rotation from direction
		
		this.currentPathLength = this.currentPath.length;
		this.currentPathIndex = 0;
//		this.onTargetReached = onTargetReached;
//		this.onTargetReachedArgs = onTargetReachedArgs;
	}
	
	this.walkToRandomTarget = function() {
		this.currentTargetx = Math.random() * width;
		this.currentTargety = Math.random() * worldHeight;
		that.walkTo(this.currentTargetx, this.currentTargety);
	}
	
	this.takeHit = function(power) {
		this.live -= power;
		this.image.src = IMG_DIR + imgName + "1_hit.png";
		var that = this;
		setTimeout(function(){that.image.src = IMG_DIR + imgName + "1.png"}, 500);
		if (this.live <= 0) {
			this.die();
		}
	}
	
	this.die = function() {
		var index = enemies.indexOf(this);
		if (index != -1) {
			enemies.splice(index, 1);
		}
		var dropIndex = Math.floor(Math.random() * 10) % 4;
		if (dropIndex < this.drops.length) {
			var dropName = this.drops[dropIndex];
			fruits.push(new Fruit(dropName, this.x, this.y, dropName + ".png", 50, fruits.length));
		}
	}
	
	this.getRect = function() {
		//TODO not create new object!
		return new Rect(this.x, this.y, this.image.width, this.image.height);
	};
}

function spawnEnemyGroup() {
	var x = Math.random() * width;
	var y = Math.random() * worldHeight;
	var enemy = new Enemy(x, y, "insect");
	enemy.walkToRandomTarget();
	enemies.push(enemy);
}

function initEnemies() {
//	spawnEnemyGroup();
//	setInterval(spawnEnemyGroup, 10000);
}

function Npc(name, x, y, image) {
	this.name = name;
	this.x = x;
	this.y = y;
	this.image = new Image();
	this.image.src = image;

	this.draw = function() {
		ctx.drawImage(this.image, this.x, this.y);
	}
	
	this.getRect = function() {
		//FIXME + 5
		return new Rect(this.x, this.y, this.image.width + 5, this.image.height);
	};
	
	this.handleEvent = function(event) {
		this.runCurrentState();
	}
	
	this.runCurrentState = function(event) {
		var speechbubble = new Speechbubble(this.x, this.y, "Hi, what do you want?");
		speechbubbles.push(speechbubble);
		speechbubble.show();
	}
}

//FIXME remove
var temp = true;

function Speechbubble(speakerx, speakery, text, timeout) {
	this.x = speakerx - 43;//TODO add arrow offset dynamically
	this.y = speakery;
	this.text = text;
	this.timeout = timeout ? timeout : 500; //default

	var that = this;
	
	var view;
	
	//FIXME quick fix, remove!
	var run = true;
	
	this.show = function() {
		if (temp) {
			setTimeout(function(){that.expand()}, this.timeout);
			temp = false;
			this.view = $("<p class='speechbubble'>" + text + "</p>");
			
			//FIXME
//			this.y = this.y + this.view.css("height");
			this.y = this.y - 16 - 35; //TODO 16 is height of the bubble, and 35 ?
			console.log("this.y:" + this.y);
			this.view.css("left", this.x + "px").css("top", this.y + "px");
			$("body").append(this.view);
		}
	}
	
	this.expand = function() {
		var element = this.view.get()[0];
		
		var eventName = 'transitionend'; //default - firefox
		if (BrowserDetect.browser === "Chrome") {
			eventName = 'webkitTransitionEnd';
		} else if (BrowserDetect.browser === "Opera") {
			eventName = 'oTransitionEnd';
		} //TODO handle rest
		
		var that = this;
		element.addEventListener(eventName, function(event) {
			if(run) {
				var o1 = $("<p class='speechoption'>Buy</p>");
				var o2 = $("<p class='speechoption'>Sell</p>");
				o1.click(function() {
					that.remove();
				});
				o2.click(function() {
					that.remove();
				});
				that.view.append(o1);
				that.view.append(o2); 
				setTimeout(function(){$(".speechoption").css("opacity", 1);}, 200);
				run = false;
			}
			
		}, false);
		
		this.view.css("height", "40px");
		//go up
		this.view.css("top", this.y - (40 - 16));
	}
	
	this.remove = function() {
		if (this.view) {
			this.view.remove();
		}
		temp = true;
	}
}

function Gun() {
	this.power = 1;
	this.vel = 3;
	
	this.shoot = function(x, y, targetx, targety) {
		var path = getLinearPath({x: x, y: y}, {x: targetx, y: targety}, this.vel);
		bullets.push(new Bullet(x, y, this.power, this.vel, path));
	}
}

function Bullet(x, y, power, vel, path) {
	this.x = x;
	this.y = y;
	this.power = power;
	this.vel = vel;
	//TODO implement as stack or more suitable data structure//////////
	this.currentPath = path;
	this.currentPathLength = this.currentPath.length;
	this.currentPathIndex = 0;
	///////////////////////////////////////////////////////////////////
	this.image = new Image();
	this.image.src = IMG_DIR + "bullet.png";
	
	this.draw = function() {
		ctx.drawImage(this.image, this.x, this.y);
	}
	
	this.move = function() {
		if (this.currentPath) {
			if (this.currentPathIndex < this.currentPathLength) {
//				console.log("and we are not finished with it: currentPathIndex:" + this.currentPathIndex + " currentPathlength:" + this.currentPathLength);
				var pointToMove = this.currentPath[this.currentPathIndex];
				this.x = pointToMove.x;
				this.y = pointToMove.y;
				this.currentPathIndex++;
				
				//TODO better algorithm
				for (var i in enemies) {
					if (isInSquare(this.x, this.y, enemies[i].getRect())) {
						enemies[i].takeHit(this.power);
						this.remove();
						break;
					}
				}
				
			} else {
//				if (this.onTargetReached) {
//					console.log("calling onTargetReached:" + this.onTargetReached);
					//FIXME refactor with Player
					this.remove();
			}
		};
	}
	
	this.remove = function() {
		var index = bullets.indexOf(this);
		if (index != -1) {
			bullets.splice(index, 1);
		}
	}
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//quest management

var npcStates = [];

//function initNpcs() {
//	//TODO init at game startup or at tile change?
//	npcStates["seller"] = [];
//	npcStates["seller"].push([
//	                          
//	new State(0, 
//		[new Speech("Hi, what do you want?", 0)],
//	    [new Answer("Who are you?", [(new StateId("seller", 2))]), new Answer("Nothing, bye!", [(new StateId("seller", 1))])], 
//	    null),
//	
//	new State(1, [new Speech("Ok, bye", 0)], 
//		null, null),
//	
//	//TODO execute action for want to buy and want to sell
//	//TODO split in 2 states, look in second state "do you need something?"
//	new State(2, [new Speech("I'm a trader, do you need something?", 2)], 
//        [new Answer("I want to buy", [new StateId("seller", 3)]), new Answer("I want to sell", [new StateId("seller", 1)]), new Answer("Not now, bye", [new StateId("seller", 1)])], 
//        null),
//	]);
//}

function sellGoods() {
	//TODO
}

function buyGoods() {
	//TODO
}

function State(id, speeches, answers, itemToState) {
	this.id = id;
	this.speeches = speeches;
	this.answers = answers;
	this.itemToState = itemToState;
}

function Speech(text, stateId, delayBefore, rewards, stop) {
    this.text = text;
    this.stateId = stateId;
    this.delayBefore = delayBefore;
    this.rewards = rewards;
    this.stop = stop;
}

function StateId(entity, state) {
    this.entity = entity;
    this.state = state;    
}

function Answer(text, stateId, requiredItems, questUpdate) {
	this.text = text;
    this.stateId = stateId;
    this.requiredItems = requiredItems; //the answer is displayed only when the user has this item(s). they are removed from the inventory when this answer is selected
    this.questUpdate = questUpdate;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//clothes
//TODO integrate

var dragElement;

function initClothes() {
	 $("#clothes_selection_right img").bind('dragstart', function(e){
                e.originalEvent.dataTransfer.effectAllowed = 'move';
                e.originalEvent.dataTransfer.setData('text/html', 'test');
                dragElement = this;
     });
	 
	 $('#clothes_selection img').bind('dragover', function (e) {
		    e.originalEvent.preventDefault();
		    
		    //TODO replace with type system
		    if (dragElement.id.indexOf(this.id) !== -1) {
		    	$(this).css("background-color", "#CCFFCC");
		    } else {
//		    	$(this).css("background-color", "#FFCCCC");
		    }
		    return false;
	 });
	 
	 $('#clothes_selection img').bind('dragleave', function (e) {
		    e.originalEvent.preventDefault();
		    $(this).css("background-color", "#FFFFFF");
		    return false;
	 });
	 
	 $('#clothes_selection img').bind('drop', function (e) {
		    e.originalEvent.preventDefault();
		    if (e.originalEvent.stopPropagation) {
		        e.originalEvent.stopPropagation();
		    }
		    if (dragElement.id.indexOf(this.id) !== -1) {
		    	this.src = dragElement.src;
		    	$(dragElement).remove();
		    	
		    	var newImg = $("<img src='" + this.src + "'></img>");
		    	newImg.css("position", "absolute");
		    	
		    	//TODO
		    	if (this.id === "helmet") {
		    		newImg.css("top", 13).css("left", 74);
		    	} else if (this.id === "body") {
		    		newImg.css("top", 58).css("left", 74);
		    	} else if (this.id === "weap") {
		    		newImg.css("top", 47).css("left", 106);
		    	}
		    	$("#clothes_on").append(newImg);
		    }
		    $(this).css("background-color", "#FFFFFF");
		    return false;
		});
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//talking cube TODO remove
var talkingCubes = [];
var cubeIndex = 0;

function addTalkingCube(x, y) {
	var cube = $("<div id='cube" + cubeIndex++ + "'class='cube'></div>");
	cube.append("<div class='topFace'><div>Talk!</div></div><div class='leftFace'><img src='img/small/face1.png' /></div><div class='rightFace'></div>");
	cube.css("left", x);
	cube.css("top", y);
	talkingCubes.push(cube);
	$("body").append(cube);
	bla();
}

var currentIndex = 1;
var timerId;

var text = "";
var chars = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
var chars2 = ['a','e','i','o','u'];

function bla() {
	$(".cube").mouseover(function() {
		var that = this;
		if (!timerId) {
			timerId = setInterval(function() {
				$(".leftFace img", that).attr("src", "img/small/face" + ((currentIndex++ % 3) + 1) + ".png");
				$(".topFace", that).css("color", '#'+Math.floor(Math.random()*16777215).toString(16));
				
				var rightFace = $('.rightFace', that);
				console.log(rightFace.text());
				if (rightFace.text().length < 6) {
					var char;
					if (Math.random() < 0.6) {
						char = chars[Math.floor(Math.random() * chars.length)];
					} else {
						char = chars2[Math.floor(Math.random() * chars2.length)];
					}
					rightFace.text(rightFace.text() + char);
				} else {
					rightFace.text("");
				}
				
			}, 100);
		}
	});
	
	$(".cube").mouseout(function() {
		currentIndex = 1;
		$(".leftFace img", this).attr("src", "img/small/face1.png");
		$(".topFace", this).css("color", 0xFFFFFF);
		clearInterval(timerId);
		timerId = null;
	});
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//video TODO remove
var videos = [];

function addVideo(x, y) {
	var video = $("<div class='cube2'></div>");
	video.append("<div class='topFace'><div></div></div><div class='leftFace'></div><div class='rightFace'><img id='video' src='img/small/niancat.png'/></div>");
	video.css("left", x);
	video.css("top", y);
	videos.push(video);
	$("body").append(video);
	
	var snd = new Audio("sound/nyan.mp3");
	snd.addEventListener('ended', function() {
		this.currentTime = 0;
		this.pause();
		snd.play();
	}, false);
	
	//there should be class interactive or sth which button and fruit (item) inherits from
	//+ states?
	fruits.push(new Fruit("button", 400, 400, "button.png", 50, fruits.length, {
		"unpressed" : new ItemState(IMG_DIR + "button.png", function() {
			$("#video").attr("src", "img/small/niancat.png");
			snd.pause();
		}),
		"pressed" : new ItemState(IMG_DIR + "button_pressed.png", function() {
			$("#video").attr("src", "img/small/niancat.gif");
			snd.play();
		})
	}));
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//tiles

function initTiles2() {
	var tileWH = TILE_W / 2;
	var tileHH = TILE_H / 2;
	
	var tilesx = width / TILE_W;
	var tilesy = height / tileHH;
	
	for (var yi = 0; yi < tilesy; yi++) {
//	for (var y = -tileHH; y < height; y += tileHH) {
		var y = yi * tileHH - tileHH;
		tiles2[yi] = [];
		for (var x = -tileWH * (yi % 2); x < width; x += TILE_W) {
			console.log("###pushing x:" +x + "y");
			tiles2[yi].push({x:x, y:y, color:'#'+ Math.floor(Math.random()*16777215).toString(16)});
//			drawTile(TILE_W, TILE_H, x, y);
		}
	}
}