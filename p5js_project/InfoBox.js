function InfoBox(_rank){

	this.rank = _rank;
	
	this.div = createDiv('');
    this.div.addClass('info_box');
    this.div.id("info_box_"+this.rank);
    this.div.parent("ship_info");

    this.expandedInfo = null;

    this.ship = null;

    this.setFromShip = function(_ship){
    	this.ship = _ship;
    	this.div.removeClass('info_box_dead');
    	this.div.removeClass('info_box_fighting');
    	
    	var extraText = "";
    	if (this.ship.currentlyPlaying){
    		if (this.ship.isDead){
    			extraText = " - dead";
    			this.div.addClass('info_box_dead');

    		}else{
    			extraText = " - fighting";
    			this.div.addClass('info_box_fighting');
    		}
    	}

    	var text = (this.rank+1)+': '+this.ship.fullName() + extraText +'<br>';
		text += "age: "+(this.ship.age)+" ";
        text += "gen: "+(this.ship.generations)+" ";
        text += "kills: "+(this.ship.totalKills)+" ";
        text += "deaths: "+(this.ship.totalDeaths)+" ";
		this.div.html(text);

		if (this.expandedInfo != null){
			this.toggleOpen();
		}
	}

	this.toggleOpen = function(){

		//if it was open, close it
		if (this.expandedInfo != null){
			this.expandedInfo.remove();
			this.expandedInfo = null;
			return;
		}

		//we can't open if there is no ship
		if (this.ship == null){
			return;
		}

		//otherwise we create a new element with all of the rules listed
		this.expandedInfo = createDiv('');
		this.expandedInfo.addClass('expanded_info');
		this.div.child(this.expandedInfo);

		//set everything
		var text = "";
		for (var i=0; i<this.ship.rules.length; i++){
			text += this.ship.rules[i].getHTML(i);
		}

		this.expandedInfo.html(text);



	}

    var idNum = this.rank;
  //   document.getElementById("info_box_"+idNum).onmousedown = function () {
		//     console.log("User moused down "+idNum);
		//     return true; // Not needed, as long as you don't return false
		// };
    this.gotClicked = function(){
    	//console.log("clicked " + idNum);
    	//holy shit this is ugly. Accessing the array of info boxes in sketch.js
    	infoBoxes[idNum].toggleOpen();
    }
	this.div.mouseClicked(this.gotClicked);

	this.kill = function(){
		this.div.remove();
	}
}