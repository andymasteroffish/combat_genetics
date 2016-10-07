function Ball(startX, startY){

	this.size = 50;

	this.posX = startX;
	this.posY = startY;

	this.velX = random(-20,20);
	this.velY = random(-8, -1);

	this.fric = 0.99;
	this.grav = 0.05;

	this.killMe = false;

	this.update = function(){
		this.velY += this.grav;

		this.velX *= this.fric;
		this.velY *= this.fric;

		this.posX += this.velX;
		this.posY += this.velY;

		if (this.posY > height-this.size/2){
			this.velY *= -1;
		}

		if (this.posX < this.size/2 || this.posX > width-this.size/2){
			this.velX *= -1;
		}

		var killSpeed = 0.01;
		if (abs(this.velX) < killSpeed && abs(this.velY) < killSpeed){
			this.killMe = true;
		}
		
	}

	this.draw = function(){
		fill(0);
		ellipse(this.posX, this.posY, this.size, this.size);
	}
}