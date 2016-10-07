
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
    
    //send this to the info boxes
    // for (var i=0; i<numShips; i++){
    //     infoBoxes[i].setShip(shipsSorted[i]);
    // }
    
    //show what we've got
    // console.log("");
    // console.log("new ship list:");
    // for (var i=0; i<shipsSorted.length; i++){
    //     console.log(i+" - "+shipsSorted[i].fullName());
    //     console.log("age: "+shipsSorted[i].age+ "  gen: "+shipsSorted[i].generations+"  score prev round: "+shipsSorted[i].score+"  total kills: "+shipsSorted[i].totalKills+"  total deaths: "+shipsSorted[i].totalDeaths);
    // }

    //update the info boxs
	resetInfoBoxes();
    
    //shuffle that shit
    for (var i=0; i<shipsWaiting.length * 50; i++){
        var randA = random(shipsWaiting.length);
        var randB = random(shipsWaiting.length);
        var temp = shipsWaiting[randA];
        shipsWaiting[randA] = shipsWaiting[randB];
        shipsWaiting[randB] = temp;
    }
    
    
    //start the game
    startNextGame();
    
}



function draw() {
    background(0);

	updateGame();
	drawGame();

    // fpsTesto.push( frameRate() );
    // if (fpsTesto > 20){
    //     fpsTesto.splice( 0, 1);
    // }

    // var total = 0;
    // for (var i=0; i<fpsTesto.length; i++){
    //     total += fpsTesto[i];
    // }
    // total /= fpsTesto.length;

    // fill(255);
    // text( total, 100, 100);
}

function updateGame(){
	//panel.update();

	
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
        infoBoxes[i].setFromShip(shipsSorted[i]);
        shipsSorted[i].infoBox = infoBoxes[i];
	}
}


function shipSort( a, b ) {
    return b.score - a.score;
}

function distSquared( x1,  y1,  x2,  y2) {
	return ( (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2) );
}

