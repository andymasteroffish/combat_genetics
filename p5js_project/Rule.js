function Rule(parent, _mutationCurve){

	this.command;
    
    this.coolDownTicks;
    this.coolDownTimer;
    
    this.type;
    
    this.mutationCurve = _mutationCurve;

    this.setupFresh = function(){
	    this.coolDownTicks = Math.max(0, random(-20, 20));
	    this.command = Math.floor(random(1, Command.COM_WAIT));
	    this.setupFreshCustom();
	}
	this.setupFreshCustom = function(){ }

	this.setupFromParent = function(parent){
	    this.type = parent.type;
	    this.command = parent.command;
	    this.coolDownTicks = parent.coolDownTicks;
	    this.setupFromParentCustom(parent);
	}
	this.setupFromParentCustom = function(parent) {}

	this.reset = function(){
	    this.coolDownTimer = 0;
	}

	this.check = function(shipInfo, bInfo, shootCoolDownTimer){
	    if (this.coolDownTimer < 0){
	    	if (this.command != Command.COM_FIRE || shootCoolDownTimer < 0){
	            if( this.checkCustom(shipInfo, bInfo) ){
	                this.coolDownTimer = this.coolDownTicks;
	                return true;
	            }
	        }
	    }
	    return false;
	}
	this.checkCustom = function(shipInfo, bInfo){
		return true;	//testing
	}

	this.tick = function(){
	    this.coolDownTimer--;
	}

	this.mutate = function(){
	    //some of the time, do nothing
	    if (Math.pow(random(), this.mutationCurve) > 0.5){
	        return;
	    }
	    
	    //chance of changing cool down
	    this.coolDownTicks += random(-3,3);
	    this.coolDownTicks = this.clamp(this.coolDownTicks, -15, 20);
	    
	    //chance of changing funciton
	    if (pow(random(), this.mutationCurve) < 0.1){
	        this.command = Math.floor(random(1, Command.COM_WAIT+1));
	    }
	    
	    //other atributes handled by the rules
	    this.mutateCustom();
	}
	this.mutateCustom = function(){}

	this.getCommandName = function (id){
	    if (id == Command.COM_THRUST){
	        return "THRUST";
	    }
	    if (id == Command.COM_REVERSE){
	        return "REVERSE";
	    }
	    if (id == Command.COM_LEFT){
	        return "LEFT";
	    }
	    if (id == Command.COM_RIGHT){
	        return "RIGHT";
	    }
	    if (id == Command.COM_FIRE){
	        return "FIRE";
	    }
	    if (id == Command.COM_WAIT){
	        return "WAIT";
	    }
	    
	    return "wait wut that bad";
	}

	this.clamp = function(val, min, max){
		return Math.max(min, Math.min(val, max));
	}

}