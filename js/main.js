var width = 1280;  
var height = 800; 
var ctx;
var bg;
var tw = 10;
var th = 10;

var player = new (function() {
	this.image = new Image();
	this.image.src = 'img/mainchar.png';
//	this.width = 65;
//	this.height = 95;
//	
	this.x = 0;
	this.y = 0;
	this.vel = 1;
	
	this.setPosition = function(x, y){
		this.x = x;
		this.y = y;
	};
	
	this.draw = function(){
		try {
//            ctx.save();
            ctx.drawImage(this.image, this.x, this.y);
//            ctx.restore();
//			console.log('the context:' + ctx + 'drawing on:' + this.x);
//			ctx.drawImage(that.image, 0, 0, that.width, that.height, that.X, that.Y, that.width, that.height);
			//cutting source image and pasting it into destination one, drawImage(Image Object, source X, source Y, source Width, source Height, destination X (X position), destination Y (Y position), Destination width, Destination height)
		} catch (e) {
			alert('exc:' + e);
		}
	}
})();

function init(){
	var canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d');
	
	bg = new Image();
	bg.src = 'img/bg.png';
	player.setPosition(100, 100);

	setInterval(render, 1000 / 50);
}

function render() {
	ctx.drawImage(bg, 0, 0);   
    
	player.draw();

	//our character is ready, let's move it 
	//to the center of the screen,
	//'~~' returns nearest lower integer from
	//given float, equivalent of Math.floor()
}

function clear() {  
	ctx.fillStyle = '#d0e7f9';  
	ctx.beginPath();  
	ctx.rect(0, 0, width, height);  
	ctx.closePath();  
	ctx.fill();  
};

document.addEventListener('click', onClick, false);

function onClick(e) {
	var x = e.pageX;
	var y = e.pageY;
	
	
	
	//direction
	var px = player.x;
	var py = player.y;
	
	
	
}

//document.onmousemove = function(e){
//	if (player.X + c.offsetLeft > e.pageX) {
//	//if mouse is on the left side of the player.
//	player.moveLeft();
//	} else if (player.X + c.offsetLeft < e.pageX) {
//	//or on right?
//	player.moveRight();
//	}
//}