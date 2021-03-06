"use strict";

var arenaW = 600;
var arenaH = 600;

var screenPadding = 5;

var numShips;// = 144;
var numShipsPerGame;// = 6;

var numTicksPerFrame;// = 10;
var maxTicksPerGame;// = 7000;
//high values will push the rand number closer to 0. Lower prc values mean more mutaitons!
var mutationCurve = 1; 

var Command = Object.freeze( { 
	COM_THRUST : 1, 
	COM_REVERSE : 2,
	COM_LEFT : 3,
	COM_RIGHT : 4,
	COM_FIRE : 5,
	COM_WAIT : 6 
});

var RuleType = Object.freeze( { 
	RULE_SHIP : 1, 
	RULE_BULLET : 2
});




var paused = false;
var displayGame = true;

var shipsWaiting = new Array();
var shipsDone = new Array();
var shipsSorted = new Array();

var game;

var generationCount = 0;
var gameCount = 0;

//interfacing with the page
var ticksSlider;
var ticksPerFrameText;

var mutationSlider;
var mutationText;

var ticksPerGameSlider;
var ticksPerGameText;

var disableDrawCheckbox;

var generationSizeField;
var shipsPerGameField;

//displaying that shit
var infoBoxes = new Array();

//test
var fpsTesto = new Array();

//dealing with losing focus
var timeOfLastUpdate = 0;

//this interval will run ever second, even when the tab is not active. If it finds that the tab was innactive, it does a full seconds worth of updates
setInterval(function() {
    if (millis() - timeOfLastUpdate > 500){
        for (var i=0; i<60; i++){
            updateGame();
        }
    }
}, 1000);

function setup() {
	createCanvas(arenaW+screenPadding*2, arenaH+screenPadding*2);

	angleMode(RADIANS);



	ticksSlider = document.getElementById("ticks_slider");
	ticksPerFrameText = document.getElementById("ticks_per_frame_text");

	mutationSlider = document.getElementById("mutation_slider");
	mutationText = document.getElementById("mutation_text");

    ticksPerGameSlider = document.getElementById("ticks_per_game_slider");
    ticksPerGameText = document.getElementById("ticks_per_game_text");

    disableDrawCheckbox = document.getElementById("disable_draw_box");

    generationSizeField = document.getElementById("generation_size");
    shipsPerGameField = document.getElementById("ships_per_game");

	//start with random ships
    numShips = generationSizeField.value;
    //numShips = 2;//testing
    for (var i=0; i<numShips; i++){
        shipsWaiting.push ( new Ship(null, mutationCurve) );
        shipsSorted.push ( shipsWaiting[i] );
    }
    //shipsWaiting[0].usePlayerControl = true;   //testing

    resetInfoBoxes();
    
    //start it up!
    game = null;
    startNextGame();
}


function startNextGame(){
    
    gameCount ++;

    if (shipsPerGameField.value < 2){
        shipsPerGameField.value = 2;
    }
    numShipsPerGame = shipsPerGameField.value;

    //numShipsPerGame = 2;    //testing
    

    //grab the next set of ships
    var thisHeat = new Array();

    while(thisHeat.length < numShipsPerGame && shipsWaiting.length > 0){
        thisHeat.push( shipsWaiting.shift() );
    }
    
    game = new Game(thisHeat);
    
    
}

function endGame(){
    
    //console.log("end game");
    //give everybody their score and move them to the done list
    for (var i=0; i<game.ships.length; i++){
        game.ships[i].score = game.ships[i].numKills * game.ships[i].winnerBonus;
        //console.log("ship "+i+" kills: "+game.ships[i].numKills+"  bonus: "+game.ships[i].winnerBonus+" score: "+game.ships[i].score);
        
        //age them
        game.ships[i].currentlyPlaying = false;
        game.ships[i].infoBox.setFromShip( game.ships[i] );  
        //add them to the done list
        shipsDone.push(game.ships[i]);
    }
    
    //if we still have ships waiting, start the next game, otherwise create a new generation
    if (shipsWaiting.length > 0){
        startNextGame();
    }else{
        startNextGeneration();
    }
    
    
}

function startNextGeneration(){
    generationCount++;
    gameCount = 0;

    if (generationSizeField.value < 24){
        generationSizeField.value = 24;
    }

    numShips = generationSizeField.value;

    //age everybody
    for (var i=0; i<shipsDone.length; i++){
        shipsDone[i].age++;
    }
    
    //first sort this generation
    shipsDone.sort(shipSort);
    
    shipsWaiting.splice(0, shipsWaiting.length);
    
    //the top 1/8th gets to stay and have 3 babies
    //the second 1/8 gets to stay and have 1 baby
    var shipLengthToUse = Math.min(numShips, shipsDone.length);
    var numSectionSlice = shipLengthToUse * 0.125;
    //console.log("grab "+numSectionSlice+" ships per section");
    //grab the winners
    for (var i=0; i<numSectionSlice; i++){
        shipsWaiting.push(shipsDone[0]);
        shipsWaiting.push( new Ship(shipsDone[0], mutationCurve) );
        shipsWaiting.push( new Ship(shipsDone[0], mutationCurve) );
        shipsWaiting.push( new Ship(shipsDone[0], mutationCurve) );
        //the ship in 1st place gets an extra baby
        if (i==0){
            shipsWaiting.push( new Ship(shipsDone[0], mutationCurve) );
        }

        shipsDone.shift();
    }
    //grab the runner ups
    for (var i=0; i<numSectionSlice; i++){
        shipsWaiting.push(shipsDone[0]);
        shipsWaiting.push( new Ship(shipsDone[0], mutationCurve) );
        shipsDone.shift();
    }
    
    //fill in the rest with new combatants
    while (shipsWaiting.length < numShips){
        shipsWaiting.push( new Ship() );
    }
    
    //clear the unused ships
    for (var i=0; i<shipsDone.length; i++){
        shipsDone[i].kill();
    }
    shipsDone.splice(0, shipsDone.length);

    while (shipsSorted.length > numShips){
        shipsSorted.pop();

    }
    
    //run through and make the sorted vector match
    for (var i=0; i<numShips; i++){
        if (shipsSorted.length > i){
            shipsSorted[i] = shipsWaiting[i];
        }else{
            shipsSorted.push( shipsWaiting[i] );
        }
    }
    //but sorted
    shipsSorted.sort(shipSort);

    //update the info boxs
	resetInfoBoxes();

    // console.log("PRE SORT");
    // for (var i=0; i<shipsWaiting.length; i++){
    //     console.log(i+"  "+shipsWaiting[i].fullName());
    // }
    
    //shuffle that shit
    for (var i=0; i<shipsWaiting.length * 50; i++){
        var randA = Math.floor(random(shipsWaiting.length));
        var randB = Math.floor(random(shipsWaiting.length));
        var temp = shipsWaiting[randA];
        shipsWaiting[randA] = shipsWaiting[randB];
        shipsWaiting[randB] = temp;
    }

    // console.log("POST SORT");
    // for (var i=0; i<shipsWaiting.length; i++){
    //     console.log(i+"  "+shipsWaiting[i].fullName());
    // }
    
    //start the game
    startNextGame();
    
}



function draw() {
    background(0);

    //this lets us know if the window lost focus and stopped updating
    timeOfLastUpdate = millis();

	updateGame();
	drawGame();
}

function updateGame(){
	
    //console.log("gen: "+generationCount+"  game: "+gameCount+"/"+ Math.ceil(numShips/numShipsPerGame));
	
	var curvedTickVal = Math.pow(ticksSlider.value, 2);
	numTicksPerFrame = Math.floor(1 + curvedTickVal * 999);
	
    mutationCurve = mutationSlider.value;

    maxTicksPerGame = ticksPerGameSlider.value;

    displayGame = !disableDrawCheckbox.checked;

    var numTicks = numTicksPerFrame;
    if (paused) numTicks = 0;
    
    game.maxNumTicks = maxTicksPerGame;
    
    for (var ticks = 0; ticks < numTicks; ticks++){
        game.update();
            
        if (game.gameIsDone){
            //console.log("it over");
            endGame();
        }
    }
}

function drawGame(){
	

    if (displayGame){
    	push();
        translate(screenPadding, screenPadding);
        game.draw();
        pop();
    }

    fill(255);
    noStroke();

    var numGames = Math.ceil(numShips/numShipsPerGame);

    text("gen: "+generationCount+"  game: "+gameCount+"/"+numGames, 5+screenPadding, 15+screenPadding);
    text("ticks: "+game.numTicks, 200+screenPadding, 15+screenPadding);
    text("P to pause\nR to skip game", 400+screenPadding, 15+screenPadding);
    
    ticksPerFrameText.textContent = "ticks per frame: "+numTicksPerFrame;
    mutationText.textContent = "mutation curve: "+mutationCurve;
    ticksPerGameText.textContent = "ticks per game: "+maxTicksPerGame;

    
    // for (var i=0; i<infoBoxes.length && i < 48; i++){
    //     infoBoxes[i].draw();
    // }
}

function keyPressed(){
	game.keyPressed(keyCode);
    if (keyCode == 80){	//p
        paused = !paused;
    }

    // if (keyCode == 83){  //s
    //     saveShips();
    // }
    // if (keyCode == 76){  //l
    //     loadShips();
    // }
    //console.log(keyCode);
}
function keyReleased(){
	game.keyReleased(keyCode);
}

function resetInfoBoxes(){

    while( infoBoxes.length < numShips){
        infoBoxes.push( new InfoBox(infoBoxes.length) );
    }
    while (infoBoxes.length > numShips){
        infoBoxes.pop().kill();
    }

    for (var i=0; i<shipsSorted.length; i++){
        //make sure the boxes are closes
        if (infoBoxes[i].expandedInfoOpen){
            infoBoxes[i].toggleOpen();
        }
        //give them their new info
        infoBoxes[i].setFromShip(shipsSorted[i]);
        shipsSorted[i].infoBox = infoBoxes[i];
	}
}

function saveShips(){
    //STILL TESTING
    var text = "";
    for (var i=0; i<shipsSorted.length; i++){
        text += shipsSorted[i].getData();
        text += "";
    }
    console.log(text);
}

function loadShips(){
    //STILL TESTING

    // println("")
    // //testing for now
    // var text = "Jfpawu,Gpug,Tsce#B,5,0,true,358.9357954433136,false,412.4050046053428,false,-2.4379840834744244,-1.414256398293397,false,false,1.6072245077536789#S,4,3.811344367201386,false,145.91597515461694,true,278.0113613156034,false,-2.7528401874872404,0.5549307309153901#B,5,11.780152130153638,true,67.12338008960575,true,151.62312129975035,false,-1.1323416179563437,2.5289266400672954,false,true,2.2032282693606233#S,2,5.744919486506408,false,46.08024026081989,true,478.1237773802423,false,-1.3989665211637023,0.922165451094993#B,2,0,true,404.64095052022327,false,416.4082845226567,true,1.2058911203536242,2.084708593269329,false,true,2.49401844896173#B,5,7.465900664129723,true,86.33036593185177,false,105.85050510658576,true,-2.774629574667042,-2.660541301867401,false,false,2.4962821296751216#S,2,0,true,255.52084258095297,true,545.3604907585354,false,-0.5662778632536525,1.3421577201909258#S,5,0,false,343.3091570753592,false,431.7205981016895,true,-1.1246655736364564,2.3646297769638593#B,5,5.932339052537063,false,550.4288848787495,false,553.1672743084939,false,-1.8721413949788939,-0.664128935036834,false,false,2.173516511699735#";
    // var thisShip = new Ship(null, mutationCurve);
    // thisShip.setFromText(text);
    // thisShip.score = 100;
    // shipsDone.push(thisShip);
}

function shipSort( a, b ) {
    return b.score - a.score;
}

function distSquared( x1,  y1,  x2,  y2) {
	return ( (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2) );
}




