function InfoBox(_rank){

	this.rank = _rank;

	this.div = document.createElement('div');
	this.div.id = "info_box_"+this.rank;
	this.div.className = 'info_box';
	document.getElementById("ship_info").appendChild(this.div);

	this.shipInfoShortDiv = document.createElement('div');
	this.div.appendChild(this.shipInfoShortDiv);
	
	// this.div = createDiv('');
 //    this.div.addClass('info_box');
 //    this.div.id("info_box_"+this.rank);
 //    this.div.parent("ship_info");

    this.expandedInfo = null;
    this.expandedInfoOpen = false;

    this.ship = null;

    this.setFromShip = function(_ship){
    	//return 	//KILL ME

    	this.ship = _ship;
    	this.div.className = 'info_box';
    	//this.div.removeClass('info_box_dead');
    	//this.div.removeClass('info_box_fighting');
    	
    	var extraText = "";
    	if (this.ship.currentlyPlaying){
    		if (this.ship.isDead){
    			extraText = " - dead";
    			this.div.className = 'info_box info_box_dead';
    			//this.div.addClass('info_box_dead');

    		}else{
    			extraText = " - fighting";
    			this.div.className = 'info_box info_box_fighting';
    			//this.div.addClass('info_box_fighting');	PUT ALL THIS CLASS SHIT BACK
    		}
    	}

    	var text = (this.rank+1)+': '+this.ship.fullName() + extraText +'<br>';
		text += "age: "+(this.ship.age)+" ";
        text += "gen: "+(this.ship.generations)+" ";
        text += "kills: "+(this.ship.totalKills)+" ";
        text += "deaths: "+(this.ship.totalDeaths)+" ";
		this.shipInfoShortDiv.innerHTML = text;
	}

	this.toggleOpen = function(){
		//return 	//KILL ME

		//if it was open, close it
		if (this.expandedInfoOpen){
			this.div.removeChild(this.expandedInfo);
			//this.expandedInfo.remove();
			//this.expandedInfo = null;
			this.expandedInfoOpen = false;
			return;
		}

		//we can't open if there is no ship
		if (this.ship == null){
			return;
		}

		//testing
		console.log(this.ship.getData());

		//otherwise we create a new element with all of the rules listed
		//this.expandedInfo = createDiv('');
		//this.expandedInfo.addClass('expanded_info');
		//this.div.child(this.expandedInfo);

		this.expandedInfo = document.createElement('div');
		this.expandedInfo.className = 'expanded_info';
		this.div.appendChild(this.expandedInfo);

		//set everything
		var text = "";
		for (var i=0; i<this.ship.rules.length; i++){
			text += this.ship.rules[i].getHTML(i);
		}

		//this.expandedInfo.html(text);
		this.expandedInfo.innerHTML = text;
		this.expandedInfoOpen = true;
	}

    var idNum = this.rank;
    document.getElementById("info_box_"+idNum).onmousedown = function () {
	    console.log("User moused down "+idNum);
	    infoBoxes[idNum].toggleOpen();
	    return true; // Not needed, as long as you don't return false
	};
    // this.gotClicked = function(){
    // 	//console.log("clicked " + idNum);
    // 	//holy shit this is ugly. Accessing the array of info boxes in sketch.js
    // 	infoBoxes[idNum].toggleOpen();
    // }
	//this.div.mouseClicked(this.gotClicked);

	this.kill = function(){
		this.div.remove();
	}
}