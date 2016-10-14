function Ship(parent, mutationCurve){
    
    
    //basic shit
    this.pos = createVector(0,0);
    this.angle = 0;
    
    this.speed = 3;
    this.reverseSpeed = this.speed * 0.6;
    this.turnSpeed = PI/40;
    this.size = 20;
    
    //shooting
    this.shootCoolDownTimer = 0;
    this.shootCoolDownTicks = 150;
    this.bullets = new Array();

    //info about the field
    this.otherShipsInfo = new Array();
    this.otherBulletInfo = new Array();
    
    //rules
    this.rules = new Array();
    
    //round data
    this.numKills = -1;
    this.winnerBonus = 1;
    this.score = -1;
    this.currentlyPlaying = false;
    this.isDead = false;
    
    //persistent data
    this.age = 0;
    this.generations = 0;
    this.totalKills = 0;
    this.totalDeaths = 0;
    
    this.name = new Array( "", "", "");

    //sending data to the page
    this.InfoBox;
    
    //player control for debug
    this.usePlayerControl = false;
    this.holdingThurst = false;
    this.holdingReverse = false;
    this.holdingLeft = false;
    this.holdingRight = false;
    this.holdingFire = false;

    this.setup = function(parent, mutationCurve){
        //figure out if we're starting fresh or inheritting from a parent
        if (parent != null){
            this.setFromParent(parent, mutationCurve);
        }else{
            this.name[0] = this.createName();
            this.name[1] = this.createName();
            this.name[2] = this.createName();
            //this.makeTestRules();
            this.makeRules();
        }
    }

    this.testo = function(){
        console.log("hello");
    }


    this.setFromParent = function(parent, mutationCurve){
        //console.log("make me from my dad");
        this.name[0] = this.createName();
        this.name[1] = parent.name[0];
        this.name[2] = parent.name[2];

        this.generations = parent.generations + 1;
        
        for (var i=0; i<parent.rules.length; i++){
            if (parent.rules[i].type == RuleType.RULE_SHIP){
                this.rules.push( new ShipRule(parent.rules[i], mutationCurve));
            }
            if (parent.rules[i].type == RuleType.RULE_BULLET){
                this.rules.push(new BulletRule( parent.rules[i], mutationCurve ));
            }
        }

        //print the differences
        // console.log("RULES FROM PARENT");
        // for (var i=0; i<this.rules.length; i++){
        //     console.log("---rule "+i+" ---");
        //     console.log("dad");
        //     parent.rules[i].print();
        //     console.log("me");
        //     this.rules[i].print();  
        // }

        //chance of removing a rule
        if ( Math.pow(random(), mutationCurve) < 0.3 && this.rules.length > 0){
            var randID = random(this.rules.length);
            this.rules.splice(randID, 1);
        }
        
        //chance of adding a rule
        if (Math.pow(random(), mutationCurve) < 0.3){
            //console.log("ADD A NEW RULE");
            var arrayPos = Math.floor(random(0,this.rules.length));
            if (random() < 0.5){
                this.rules.splice(arrayPos, 0, new ShipRule() );
            }else{
                this.rules.splice(arrayPos, 0,new BulletRule() );
            }
        }
        
        //high chance of swapping the order of a rule
        if (Math.pow(random(), mutationCurve) < 0.7){
            var randA = Math.floor(random(this.rules.length));
            var randB = Math.floor(random(this.rules.length));
            var temp = this.rules[randA];
            this.rules[randA] = this.rules[randB];
            this.rules[randB] = temp;
        }
    }



    this.makeRules = function(){
        var numRules = random(8,20);
        
        for (var i=0; i<numRules; i++){
            if (random() < 0.5){
                this.rules.push( new ShipRule(null, 1) );
            }else{
                this.rules.push( new BulletRule(null, 1) );
            }
        }

        
        //select a random rule and have the command be fire
        random(this.rules).command = Command.COM_FIRE;
        
        //list what we got
        // console.log("rules: "+this.rules.length); 
        // for (var i=0; i<this.rules.length; i++){
        //     console.log("-- rule "+i+" --");
        //     this.rules[i].print();
        // }

    }

    this.makeTestRules = function(){
        var testo = new BulletRule();
        testo.command = Command.COM_LEFT;
        testo.usingMinDist = false;
        testo.usingMaxDist = false;
        testo.usingAngle = false;
        testo.usingGettingCloser = false;
        testo.usingTrajectoryAngle = true;
        testo.maxTrajectoryAngle = 0.5;
        this.rules.push(testo);

    }

    this.resetGame = function(startX, startY, startAngle){
        this.pos.set(startX, startY);
        this.angle = startAngle;
        
        this.shootCoolDownTimer = 0;
        
        this.isDead = false;
        this.currentlyPlaying = true;
        
        this.numKills = 0;
        this.winnerBonus = 1;
        this.score = 0;
        
        for (var i=0; i<this.rules.length; i++){
            this.rules[i].reset();
        }
        
        this.bullets.splice(0,this.bullets.length);

        this.infoBox.setFromShip(this); //PUT THIS BACK
    }

    this.update = function(){
        if (this.isDead){
            return;
        }
        
        this.shootCoolDownTimer--;
        
        //get our move for the turn
        if (!this.usePlayerControl){
            this.excuteCommand( this.getCommandFromRules() );
        }else{
            this.excuteCommand( this.getCommandPlayerControl() );
        }
        
        //keep angle in range
        if (this.angle > PI){
            this.angle -= TWO_PI;
        }
        if (this.angle < -PI){
            this.angle += TWO_PI;
        }
        
        //testing
        if (!this.usePlayerControl){
            //cout<<"my angle "<<angle/PI<<endl;
            //cout<<"distsq "<<otherShipsInfo[0].distSq<<endl;
            //cout<<"angle  "<<otherShipsInfo[0].angleFromMe<<endl;
        }
        
    }

    this.draw = function(){
        
        noStroke();

        push();
        translate(this.pos.x, this.pos.y);
        rotate( this.angle );

        fill(255);
        if (this.isDead) fill(55,0,0);

        triangle(this.size, 0, -this.size/2, this.size*0.75, -this.size/2, -this.size*0.75);
        
        fill(0);
        ellipse(this.size-2, 0, 6, 6);
        
        pop();
        
        fill(255);
        noStroke();
        if (this.isDead) fill(150,60,60);
        text(this.fullName(), this.pos.x - this.fullName().length*3, this.pos.y - this.size);
        
    //    ofNoFill();
    //    ofSetColor(255,0,0);
    //    ofDrawCircle(pos.x, pos.y, size);
    }

    this.fire = function(){
        var bul = new Bullet();
        bul.setup(this.pos.x, this.pos.y, this.angle);
        this.bullets.push(bul);
        this.shootCoolDownTimer = this.shootCoolDownTicks;
        
    }

    this.excuteCommand = function(com){
        if (com == Command.COM_THRUST){
            this.pos.x += cos(this.angle) * this.speed;
            this.pos.y += sin(this.angle) * this.speed;
        }
        if (com == Command.COM_REVERSE){
            this.pos.x += cos(this.angle) * -this.reverseSpeed;
            this.pos.y += sin(this.angle) * -this.reverseSpeed;
        }
        if (com == Command.COM_LEFT){
            this.angle -= this.turnSpeed;
        }
        if (com == Command.COM_RIGHT){
            this.angle += this.turnSpeed;
        }
        if (com == Command.COM_FIRE){
            this.fire();
        }
    }

    this.getCommandFromRules = function(){
        //cout<<"
        //tick down all timers
        for (var i=0; i<this.rules.length; i++){
            this.rules[i].tick();
        }
        
        //go through rules in order
        for (var i=0; i<this.rules.length; i++){
            if (this.rules[i].check(this.otherShipsInfo, this.otherBulletInfo, this.shootCoolDownTimer)){
                return this.rules[i].command;
            }
        }

        //if none worked, just wait
        return Command.COM_WAIT;
    }

    this.getCommandPlayerControl = function(){
        if (this.holdingFire && this.shootCoolDownTimer <= 0){
            return Command.COM_FIRE;
        }
        if (this.holdingThurst){
            return Command.COM_THRUST;
        }
        if (this.holdingReverse){
            return Command.COM_REVERSE;
        }
        if (this.holdingLeft){
            return Command.COM_LEFT;
        }
        if (this.holdingRight){
            return Command.COM_RIGHT;
        }
        return Command.COM_WAIT;
    }

    this.keyPressed = function(key){
        if (!this.usePlayerControl)
            return;
        
        if (key == 37)      this.holdingLeft = true;
        if (key == 39)      this.holdingRight = true;
        if (key == 38)      this.holdingThurst = true;
        if (key == 40)      this.holdingReverse = true;
        if (key == 90)      this.holdingFire = true;
        
    }
    this.keyReleased = function(key){
        if (!this.usePlayerControl)
            return;
        
        if (key == 37)      this.holdingLeft = false;
        if (key == 39)      this.holdingRight = false;
        if (key == 38)      this.holdingThurst = false;
        if (key == 40)      this.holdingReverse = false;
        if (key == 90)      this.holdingFire = false;
    }

    this.setGameInfo = function( ships ){
        this.otherShipsInfo.splice(0, this.otherShipsInfo.length);
        this.otherBulletInfo.splice(0, this.otherBulletInfo.length);
        
        for (var i=0; i<ships.length; i++){
            if (ships[i] != this && !ships[i].isDead){
                //get the ship info
                var info = new ShipInfo();
                var otherPos = ships[i].pos;
                info.distSq = distSquared(this.pos.x, this.pos.y, otherPos.x, otherPos.y);
                info.angleFromMe = this.angle - atan2(this.pos.y-otherPos.y, this.pos.x-otherPos.x) + PI;
                if (info.angleFromMe > PI)  info.angleFromMe -= TWO_PI;
                if (info.angleFromMe < -PI) info.angleFromMe += TWO_PI;
                this.otherShipsInfo.push(info);
                
                //get the info for each bullet that ship has active
                for (var b=0; b<ships[i].bullets.length; b++){
                    var bulPos = ships[i].bullets[b].pos;
                    var bulVel = ships[i].bullets[b].vel;
                    
                    var bInfo = new BulletInfo();
                    //distance
                    bInfo.distSq = distSquared(this.pos.x, this.pos.y, bulPos.x, bulPos.y);
                    //angle to me
                    bInfo.angleFromMe = this.angle - atan2(this.pos.y-bulPos.y, this.pos.x-bulPos.x) + PI;
                    if (bInfo.angleFromMe > PI)  bInfo.angleFromMe -= TWO_PI;
                    if (bInfo.angleFromMe < -PI) bInfo.angleFromMe += TWO_PI;

                    //see where the bullet will be next frame
                    var nextBulPos = bulPos + bulVel;
                    bInfo.gettingCloser = distSquared(this.pos.x, this.pos.y, nextBulPos.x, nextBulPos.y) < bInfo.distSq;

                    //or just get the angle from the bullet to the ship
                    var angleToShip = atan2(bulPos.y-this.pos.y, bulPos.x-this.pos.x);
                    bInfo.trajectoryOffset = PI - Math.abs(angleToShip-ships[i].bullets[b].angle);

                    //console.log("angle "+angleToShip);
                    //console.log("offset "+bInfo.trajectoryOffset);
                    
                    this.otherBulletInfo.push(bInfo);
                }
            }
        }
    }

    this.fullName = function(){
        return this.name[0]+" "+this.name[1]+" "+this.name[2];
    }

    this.createName = function(){
        //console.log("make a name");
        //21
        var cons = ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z'];
        //5
        var vowels = [ 'a', 'e', 'i', 'o', 'u' ];
        
        var charsSinceVowel = 0;
        
        var word = "";
        while(true){
            var chanceOfVowel = map(charsSinceVowel, 0, 3, 0.2, 1);
            var chanceOfDone = map(word.length, 2, 7, 0, 0.9, true);
            if (random() < chanceOfDone){
                word = word.charAt(0).toUpperCase() + word.slice(1);
                //console.log("the word is" +word);
                return  word;
            }
            
            if (random() < chanceOfVowel){
                word += random(vowels);
                charsSinceVowel = 0;
            }
            else{
                charsSinceVowel++;
                word += random(cons);
            }
        }
    }

    this.getData = function(){
        var text = "";
        text += this.name[0]+","+this.name[1]+","+this.name[2]+"#";
        for (var i=0; i<this.rules.length; i++){
            text += this.rules[i].getData() + "#";
        }
        return text;
    }

    this.setFromText = function(text){
        this.rules.splice(0, this.rules.length);    //clear existing rules

        var lines = text.split("#");
        //first line is the name
        var newNames = lines[0].split(",");
        console.log("new name: "+newNames);

        for (var i=0; i<3; i++){
            this.name[i] = newNames[i];
        }

        //the remaining lines describe rules
        for (var i=1; i<lines.length; i++){
            var line = lines[i].split(",");
            if (line.length > 5){
                console.log("parsing "+line);
                var thisRule;
                if (line[0] == "S"){
                    thisRule = new ShipRule(null, mutationCurve);
                }else{
                    thisRule = new BulletRule(null, mutationCurve);
                }
                thisRule.setFromText(line);
                this.rules.push(thisRule);
            }
        }


    }

    this.kill = function(){
        this.rules.splice(0, this.rules.length);
    }
    

    this.setup(parent, mutationCurve);    //this is called as part of the constructor
       
}