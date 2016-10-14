function Game(startingShips){

    this.ships = new Array();
    
    this.gameIsDone = false;
    this.numTicks = 0;
    this.maxNumTicks = 7000;
    
    for (var i=0; i<startingShips.length; i++){
        this.ships.push( startingShips[i] );
    }
    
    var startDist = arenaW/3;
    var angleStep = TWO_PI / this.ships.length;
    for (var i=0; i<this.ships.length; i++){
        var startX = arenaW/2 + cos(angleStep * i) * startDist;
        var startY = arenaH/2 + sin(angleStep * i) * startDist;
        this.ships[i].resetGame(startX, startY, angleStep * i + PI*0.9);
    }

    this.update = function(){
        this.numTicks++;
        
        //give everybody new info
        for (var i=0; i<this.ships.length; i++){
            this.ships[i].setGameInfo(this.ships);
        }
        
        //update
        for (var i=0; i<this.ships.length; i++){
            this.ships[i].update();
            
            //level wrap
            if (this.ships[i].pos.x < 0)        this.ships[i].pos.x = arenaW;
            if (this.ships[i].pos.x > arenaW)   this.ships[i].pos.x = 0;
            if (this.ships[i].pos.y < 0)        this.ships[i].pos.y = arenaH;
            if (this.ships[i].pos.y > arenaH)   this.ships[i].pos.y = 0;
            
            //update bullets
            for (var b=0; b<this.ships[i].bullets.length; b++){
                this.ships[i].bullets[b].update();
            }
        }
        
        
        //check for hits
        for (var i=0; i<this.ships.length; i++){
            if (!this.ships[i].isDead){
                if (this.checkShipAgainstBullets(this.ships[i])){
                    this.ships[i].isDead = true;
                    this.ships[i].infoBox.setFromShip(this.ships[i]);  
                    this.ships[i].totalDeaths++;
                    this.ships[i].bullets.splice(0, this.ships[i].bullets.length);
                }
            }
        }
        
        //kill off screen bullets
        for (var i=0; i<this.ships.length; i++){
            for (var b=this.ships[i].bullets.length-1; b>=0; b--){
                var pos = this.ships[i].bullets[b].pos;
                if (pos.x < 0 || pos.x > arenaW || pos.y < 0 || pos.y > arenaH || this.ships[i].isDead){
                    this.ships[i].bullets.splice( b, 1);
                }
            }
        }
        
        //is it game over?
        if (this.numTicks > this.maxNumTicks){
            this.gameIsDone = true;
        }
        
        var numAlive = 0;
        for (var i=0; i<this.ships.length; i++){
            if (!this.ships[i].isDead){
                numAlive++;
            }
        }
        if (numAlive <= 1){
            this.gameIsDone = true;
        }
        
        //if only one is left, give them the bonus
        if (numAlive == 1){
            for (var i=0; i<this.ships.length; i++){
                if (!this.ships[i].isDead){
                    this.ships[i].winnerBonus = 1.5;
                }
            }
        }
        
        
    }

    this.checkShipAgainstBullets = function(target){
        for (var i=0; i<this.ships.length; i++){
            if (this.ships[i] != target){
                for (var b=0; b<this.ships[i].bullets.length; b++){
                    var bPos = this.ships[i].bullets[b].pos;
                    var bSize = this.ships[i].bullets[b].size;
                    if (distSquared(target.pos.x, target.pos.y, bPos.x, bPos.y) < Math.pow(target.size+bSize, 2)){
                        //move the bullet off screen
                        this.ships[i].bullets[b].pos.x = -10000;
                        //give a povar to the killer
                        this.ships[i].numKills++;
                        this.ships[i].totalKills++;
                        //and mark that there was a hit!
                        return true;
                    }
                }
            }
        }
        
        return false;
    }

    this.draw = function(){
        stroke(255);
        noFill();
        rect(0,0,arenaW, arenaH);
        
        
        //draw dead ships
        for (var i=0; i<this.ships.length; i++){
            if (this.ships[i].isDead){
                this.ships[i].draw();
            }
        }
        
        //draw living ships and their bullets
        for (var i=0; i<this.ships.length; i++){
            if (!this.ships[i].isDead){
                this.ships[i].draw();
            }
            for (var b=0; b<this.ships[i].bullets.length; b++){
                this.ships[i].bullets[b].draw();
            }
        }
        
    }

    this.keyPressed = function(key){
        //console.log("pressed "+key);
        for (var i=0; i<this.ships.length; i++){
            this.ships[i].keyPressed(key);
        }
        
        if (key == 82){ //r
            this.gameIsDone = true;
        }
    }
    this.keyReleased = function(key){
        for (var i=0; i<this.ships.length; i++){
            this.ships[i].keyReleased(key);
        }
    }
    
    
}