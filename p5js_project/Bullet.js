function Bullet(){

	this.size = 5;
	this.speed = 4;

	this.pos;
	this.vel;

	this.setup = function(x, y, angle){
		this.pos = createVector(x, y, 0);
		
		this.vel = createVector( cos(angle) * this.speed, sin(angle) * this.speed, 0 );
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