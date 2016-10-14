function ShipRule(parent, _mutationCurve){
	Rule.apply(this, arguments);

	this.usingMinDist;
    this.minDist;
    
    this.usingMaxDist;
    this.maxDist;
    
    this.usingAngle;
    this.minAngle;
    this.maxAngle;

    this.setupFreshCustom = function(){
	    this.type = RuleType.RULE_SHIP;
	    
	    this.usingMaxDist = random() > 0.5;
	    this.usingMinDist = random() > 0.5;
	    this.usingAngle = random() > 0.5;

	    
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
	    
	    this.minDist = parent.minDist;
	    this.maxDist = parent.maxDist;
	    this.minAngle = parent.minAngle;
	    this.maxAngle = parent.maxAngle;
	    
	    this.mutate();
	}

	this.checkCustom = function(shipInfo,  bInfo){
	    //cout<<"checking "<<shipInfo.size()<<endl;
	    for (var i=0; i<shipInfo.length; i++){
	        var info = shipInfo[i];
	        
	        //cout<<"ang from me: "<<info.angleFromMe/PI<<endl;
	        
	        var minDistPass = !this.usingMinDist;
	        var maxDistPass = !this.usingMaxDist;
	        var anglePass = !this.usingAngle;
	        
	        if (this.usingMinDist){
	            minDistPass = info.distSq > this.minDist*this.minDist;
	        }
	        if (this.usingMaxDist){
	            maxDistPass = info.distSq < this.maxDist*this.maxDist;
	        }
	        
	        if (this.usingAngle){
	            anglePass = info.angleFromMe > this.minAngle && info.angleFromMe < this.maxAngle;
	        }
	        
	        //cout<<"what we got "<<minDistPass<<" "<<maxDistPass<<" "<<anglePass<<endl;
	        
	        if (minDistPass && maxDistPass && anglePass){
	            //cout<<"angle from me: "<<info.angleFromMe/PI<<endl;
	            return true;
	        }
	        
	    }
	    
	    return false;
	}

	this.mutateCustom = function(){
	    
	    var baseSwitchChance = 0.1;
	    
	    //cout<<"my mut curve "<<mutationCurve<<endl;
	    
	    if (Math.pow(random(), this.mutationCurve) < baseSwitchChance)    this.usingMinDist = !this.usingMinDist;
	    if (Math.pow(random(), this.mutationCurve) < baseSwitchChance)    this.usingMaxDist = !this.usingMaxDist;
	    if (Math.pow(random(), this.mutationCurve) < baseSwitchChance)    this.usingAngle = !this.usingAngle;
	    
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
	    this.maxDist = this.clamp(this.maxDist, 0, arenaH);
	    if (this.minDist > this.maxDist){
	        var temp = this.minDist;
	        this.minDist = this.maxDist;
	        this.maxDist = temp;
	    }
	}

	this.print = function(){
	    console.log("ship rule: "+this.command+" "+this.getCommandName(this.command)+"  cool down: "+this.coolDownTicks);
	    if (this.usingMinDist){
	        console.log("min dist: "+this.minDist);
	    }
	    if (this.usingMaxDist){
	        console.log("max dist: "+this.maxDist);
	    }
	    if (this.usingAngle){
	        console.log("angle between "+this.minAngle+" and "+this.maxAngle);
	    }
	}

	this.getHTML = function(orderNum){
		var haveStatedIt = false;
		var text = "";
		text += "<p class='rule_name'>"+(orderNum+1)+". Action: "+this.getCommandName(this.command)+"</p>";
	    text += "<p class='rule_text'>Cool down: "+Math.floor( Math.max(0,this.coolDownTicks))+"</p>";
	    if (this.usingMinDist){
	        text += "<p class='rule_text'>"+(haveStatedIt ? "That" : "Another")+" ship must be at least: "+Math.floor(this.minDist)+" px away</p>";
	    	haveStatedIt = true;
	    }
	    if (this.usingMaxDist){
	    	text += "<p class='rule_text'>"+(haveStatedIt ? "That" : "Another")+" ship must be at within: "+Math.floor(this.maxDist)+" px</p>";
	    	haveStatedIt = true;
	    }
	    if (this.usingAngle){
	    	text += "<p class='rule_text'>"+(haveStatedIt ? "That" : "Another")+" ship must be within: "+Math.floor(degrees(this.minAngle))+" and "+Math.floor(degrees(this.maxAngle))+" degrees to me</p>";
	    	haveStatedIt = true;
	    }
	    return text;
	}

	this.getDataCustom = function(){
		var text = "";
		text += this.usingMinDist.toString()+",";
		text +=	this.minDist.toString()+",";
			    
		text +=	this.usingMaxDist.toString()+",";
		text +=	this.maxDist.toString()+",";
			    
		text +=	this.usingAngle.toString()+",";
		text +=	this.minAngle.toString()+",";
		text += this.maxAngle.toString();
		return text;
	}

	this.setFromTextCustom = function(text){
		var c = 3;
		this.usingMinDist = text[c++] == "true";
		this.minDist = parseFloat(text[c++]);

		this.usingMaxDist  = text[c++] == "true";;
		this.maxDist = parseFloat(text[c++]);

		this.usingAngle  = text[c++] == "true";;
		this.minAngle = parseFloat(text[c++]);
		this.maxAngle = parseFloat(text[c++]);

		console.log("using min dist: "+this.usingMinDist+"  min dist: "+this.minDist);
	}


    if (parent == null){
    	this.setupFresh();
    }else{
    	this.setupFromParent(parent)
    }
}