function BulletRule(parent, _mutationCurve){
	Rule.apply(this, arguments);

	this.usingMinDist;
    this.minDist;
    
    this.usingMaxDist;
    this.maxDist;
    
    this.usingAngle;
    this.minAngle
    this.maxAngle;
    
    this.usingGettingCloser;


    this.setupFreshCustom = function(){
	    this.type = RuleType.RULE_BULLET;
	    
	    this.usingMaxDist = random() > 0.5;
	    this.usingMinDist = random() > 0.5;
	    this.usingAngle = random() > 0.5;
	    this.usingGettingCloser = random() > 0.5;

	    
	    this.minDist = random(0, arenaW);
	    this.maxDist = random(0, arenaH);
	    this.minAngle = random(-PI, PI);
	    this.maxAngle = random(-PI, PI);
	    
	    this.keepRangesReasonable();
	}

	this.setupFromParentCustom = function(parent){
		this.usingMaxDist = parent.usingMaxDist;
	    this.usingMinDist = parent.usingMinDist;
	    this.usingAngle = parent.usingAngle;
	    this.usingGettingCloser = parent.usingGettingCloser;
	    
	    this.minDist = parent.minDist;
	    this.maxDist = parent.maxDist;
	    this.minAngle = parent.minAngle;
	    this.maxAngle = parent.maxAngle;
	    
	    this.mutate();
	}


	this.checkCustom = function(shipInfo,  bInfo){
	    for (var i=0; i<bInfo.length; i++){
	        var info = bInfo[i];
	        
	        //random(console.log("ang from me: "+info.angleFromMe/PI);
	        
	        var minDistPass = !this.usingMinDist;
	        var maxDistPass = !this.usingMaxDist;
	        var anglePass = !this.usingAngle;
	        var closerPass = !this.usingGettingCloser;
	        
	        if (this.usingMinDist){
	            minDistPass = info.distSq > this.minDist*this.minDist;
	        }
	        if (this.usingMaxDist){
	            maxDistPass = info.distSq < this.maxDist*this.maxDist;
	        }
	        
	        if (this.usingAngle){
	            anglePass = info.angleFromMe > this.minAngle && info.angleFromMe < this.maxAngle;
	        }
	        
	        if (this.usingGettingCloser){
	            closerPass = info.gettingCloser;
	        }
	        
	        //random(console.log("what we got "+minDistPass+" "+maxDistPass+" "+anglePass+" "+closerPass);
	        
	        if (minDistPass && maxDistPass && anglePass && closerPass){
	            //random(console.log("angle from me: "+info.angleFromMe/PI);
	            return true;
	        }
	        
	    }
	    
	    return false;
	}

	this.mutateCustom = function(){
	    
	    var baseSwitchChance = 0.1;
	    
	    //random(console.log("my mut curve "+mutationCurve);
	    
	    if (Math.pow(random(), this.mutationCurve) < baseSwitchChance)    this.usingMinDist = !this.usingMinDist;
	    if (Math.pow(random(), this.mutationCurve) < baseSwitchChance)    this.usingMaxDist = !this.usingMaxDist;
	    if (Math.pow(random(), this.mutationCurve) < baseSwitchChance)    this.usingAngle = !this.usingAngle;
	    if (Math.pow(random(), this.mutationCurve) < baseSwitchChance)    this.usingGettingCloser = !this.usingGettingCloser;
	    
	    var distRange = 50 * this.mutationCurve;
	    this.minDist += random(-distRange, distRange);
	    this.maxDist += random(-distRange, distRange);
	    
	    var angleRange = PI/4 * this.mutationCurve;
	    this.minAngle += random(-angleRange, angleRange);
	    this.maxAngle += random(-angleRange, angleRange);
	    
	    this.keepRangesReasonable();
	    
	    
	}

	this.keepRangesReasonable = function(){
	    this.minAngle = this.clamp(this.minAngle, -PI, PI);
	    this.maxAngle = this.clamp(this.maxAngle, -PI, PI);
	    if (this.minAngle > this.maxAngle){
	        var temp = this.minAngle;
	        this.minAngle = this.maxAngle;
	        this.maxAngle = temp;
	    }
	    
	    this.minDist = this.clamp(this.minDist, 0, arenaW);
	    this.maxDist = this.clamp(this.maxDist, 0, arenaW);
	    if (this.minDist > this.maxDist){
	        var temp = this.minDist;
	        this.minDist = this.maxDist;
	        this.maxDist = temp;
	    }
	}

	this.print = function(){
	    console.log("bullet rule: "+this.command+" "+this.getCommandName(this.command)+"  cool down: "+this.coolDownTicks);
	    if (this.usingMinDist){
	        console.log("min dist: "+this.minDist);
	    }
	    if (this.usingMaxDist){
	        console.log("max dist: "+this.maxDist);
	    }
	    if (this.usingAngle){
	        console.log("angle between "+this.minAngle+" and "+this.maxAngle);
	    }
	    if (this.usingGettingCloser){
	        console.log("bullet must be getting closer");
	    }
	}

	this.getHTML = function(orderNum){
		var text = "";
		var haveStatedIt = false;
		text += "<p class='rule_name'>"+(orderNum+1)+". Command: "+this.getCommandName(this.command)+"</p>";
	    text += "<p class='rule_text'>Cool down: "+Math.floor(this.coolDownTicks)+"</p>";
	    if (this.usingMinDist){
	        text += "<p class='rule_text'>"+(haveStatedIt ? "That" : "A")+" bullet must be at least: "+Math.floor(this.minDist)+" px away</p>";
	    	haveStatedIt = true;
	    }
	    if (this.usingMaxDist){
	    	text += "<p class='rule_text'>"+(haveStatedIt ? "That" : "A")+" bullet must be at within: "+Math.floor(this.maxDist)+" px</p>";
	    	haveStatedIt = true;
	    }
	    if (this.usingAngle){
	    	text += "<p class='rule_text'>"+(haveStatedIt ? "That" : "A")+" bullet must be within: "+Math.floor(degrees(this.minAngle))+" and "+Math.floor(degrees(this.maxAngle))+" degrees to me</p>";
	    	haveStatedIt = true;
	    }
	    if (this.usingGettingCloser){
	    	text += "<p class='rule_text'>"+(haveStatedIt ? "That" : "A")+" bullet must be getting closer</p>";
	    	haveStatedIt = true;
	    }
	    return text;
	}


	if (parent == null){
    	this.setupFresh();
    }else{
    	this.setupFromParent(parent)
    }
}