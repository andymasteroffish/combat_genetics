function Bullet(){

	this.size = 5;
	this.speed = 4;

	this.pos;
	this.vel;

	this.angle;

	this.setup = function(x, y, _angle){
		this.angle = _angle;
		this.pos = createVector(x, y, 0);
		
		this.vel = createVector( cos(this.angle) * this.speed, sin(this.angle) * this.speed, 0 );
	}

	this.update = function(){
		this.pos.x += this.vel.x;
	    this.pos.y += this.vel.y;
	}

	this.draw = function(){
	    noFill();
	    stroke(255);
	    ellipse(this.pos.x, this.pos.y, this.size, this.size);
	}

}