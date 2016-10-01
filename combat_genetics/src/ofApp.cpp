#include "ofApp.h"


bool ofApp::shipSort(  Ship * a, Ship * b ) {
    return a->score > b->score;
}

//--------------------------------------------------------------
void ofApp::setup(){
    ofBackground(0);
    
    //basic info
    numShips = 48;
    numShipsPerGame = 6;
    
    //prepare panel
    hidePanel = false;
    panel.setup("settings", 0, 0, ARENA_W-100, 130);
    panel.addPanel("settings");
    panel.setWhichPanel(0);
    panel.addSliderInt("ticks_per_frame", 50, 1, 200);
    panel.addSliderInt("max_ticks_per_game", 10000, 500, 50000);
    
    panel.addSlider("mutation_rate", 1, 0.2, 5);
                
    
    //set our default values
    shipsWaiting.clear();
    shipsDone.clear();
    
    generationCount = 1;
    gameCount = 0;
    
    paused = false;
    
    //setup info boxes
    infoBoxes.resize(numShips);
    float boxW = ARENA_W/2 - 15;
    float boxH = 31;
    for (int i=0; i<numShips; i++){
        
        float startX = ARENA_W + 15;
        float startY = 5;
        
        int yPos = i;
        
        if (i >= numShips/2){
            startX += boxW + 10;
            yPos = i-numShips/2;
        }
        
        infoBoxes[i].setup(i+1, startX, startY+(boxH+2)*yPos, boxW, boxH);
        
        
//        if (i < 11){
//            float startX = 5;
//            float startY = ARENA_H + 15;
//            infoBoxes[i].setup(i+1, startX, startY+(boxH+2)*i, boxW, boxH);
//        }else if (i<22){
//            float startX = 25+boxW;
//            float startY = ARENA_H + 15;
//            infoBoxes[i].setup(i+1, startX, startY+(boxH+2)*(i-11), boxW, boxH);
//        }else if (i<51){
//            float startX = 45+boxW*2;
//            float startY = 21;
//            infoBoxes[i].setup(i+1, startX, startY+(boxH+2)*(i-22), boxW, boxH);
//        }else{
//            float startX = 65+boxW*3;
//            float startY = 21;
//            infoBoxes[i].setup(i+1, startX, startY+(boxH+2)*(i-51), boxW, boxH);
//        }
    }
    
    //start with random ships
    shipsWaiting.resize(numShips);
    shipsSorted.resize(numShips);
    for (int i=0; i<shipsWaiting.size(); i++){
        shipsWaiting[i] = new Ship();
        shipsSorted[i] = shipsWaiting[i];
        infoBoxes[i].setShip(shipsWaiting[i]);
    }
    //shipsWaiting[0]->usePlayerControl = true;   //testing
    
    //start it up!
    game = NULL;
    startNextGame();
}

//--------------------------------------------------------------
void ofApp::startNextGame(){
    
    gameCount ++;
    //cout<<"start game "<<gameCount<<endl;
    
    if (game != NULL){
        delete game;
    }
    
    //grab the next set of ships
    vector<Ship *> thisHeat;
    
    while(thisHeat.size() < numShipsPerGame && shipsWaiting.size() > 0){
        thisHeat.push_back( shipsWaiting[0] );
        shipsWaiting.erase(shipsWaiting.begin());
    }
    
    game = new Game();
    game->setup(thisHeat);
    
    
}

//--------------------------------------------------------------
void ofApp::endGame(){
    
    //cout<<"end game"<<endl;
    //give everybody their score and move them to the done list
    for (int i=0; i<game->ships.size(); i++){
        game->ships[i]->score = game->ships[i]->numKills * game->ships[i]->winnerBonus;
        //cout<<"ship "<<i<<" kills: "<<game->ships[i]->numKills<<"  bonus: "<<game->ships[i]->winnerBonus<<" score: "<<game->ships[i]->score<<endl;
        
        
        //age them
        game->ships[i]->age++;
        game->ships[i]->currentlyPlaying = false;
        //add them to the done list
        shipsDone.push_back(game->ships[i]);
    }
    
    //if we still have ships waiting, start the next game, otherwise create a new generation
    if (shipsWaiting.size() > 0){
        startNextGame();
    }else{
        startNextGeneration();
    }
    
    
}

//--------------------------------------------------------------
void ofApp::startNextGeneration(){
    generationCount++;
    gameCount = 0;
    cout<<"start generation "<<generationCount<<endl;
    
    mutationCurve = panel.getValueF("mutation_rate");
    
    
    //first sort this generation
    ofSort(shipsDone, ofApp::shipSort);
    
    shipsWaiting.clear();
    
    //the top 1/8th gets to stay and have two babies
    //the second 1/8 gets to stay and have one baby
    int numSectionSlice = numShips * 0.125;
    //cout<<"grab "<<numSectionSlice<<" ships per section"<<endl;
    //grab the winners
    for (int i=0; i<numSectionSlice; i++){
        shipsWaiting.push_back(shipsDone[0]);
        shipsWaiting.push_back( new Ship(shipsDone[0], mutationCurve) );
        shipsWaiting.push_back( new Ship(shipsDone[0], mutationCurve) );
        shipsDone.erase( shipsDone.begin() );
    }
    //grab the runner ups
    for (int i=0; i<numSectionSlice; i++){
        shipsWaiting.push_back(shipsDone[0]);
        shipsWaiting.push_back( new Ship(shipsDone[0], mutationCurve) );
        shipsDone.erase( shipsDone.begin() );
    }
    
    //fill in the rest with new combatants
    while (shipsWaiting.size() < numShips){
        shipsWaiting.push_back( new Ship() );
    }
    
    //clear the unused ships
    for (int i=0; i<shipsDone.size(); i++){
        shipsDone[i]->kill();
        delete shipsDone[i];
    }
    shipsDone.clear();
    
    //run through and make the sorted vector match
    for (int i=0; i<numShips; i++){
        shipsSorted[i] = shipsWaiting[i];
    }
    //but sorted
    ofSort(shipsSorted, ofApp::shipSort);
    
    //send this to the info boxes
    for (int i=0; i<numShips; i++){
        infoBoxes[i].setShip(shipsSorted[i]);
    }
    
    //show what we've got
    cout<<endl<<"new ship list:"<<endl;
    for (int i=0; i<shipsSorted.size(); i++){
        cout<<i<<" - "<<shipsSorted[i]->fullName()<<endl;;
        cout<<"age: "<<shipsSorted[i]->age<< "  gen: "<<shipsSorted[i]->generations<<"  score prev round: "<<shipsSorted[i]->score<<"  total kills: "<<shipsSorted[i]->totalKills<<"  total deaths: "<<shipsSorted[i]->totalDeaths<<endl;
    }
    
    //shuffle that shit
    for (int i=0; i<shipsWaiting.size() * 50; i++){
        int randA = (int)ofRandom(shipsWaiting.size());
        int randB = (int)ofRandom(shipsWaiting.size());
        Ship * temp = shipsWaiting[randA];
        shipsWaiting[randA] = shipsWaiting[randB];
        shipsWaiting[randB] = temp;
    }
    
    
    //start the game
    startNextGame();
    
}

//--------------------------------------------------------------
void ofApp::update(){
    
    panel.update();
    
    int numTicks = panel.getValueI("ticks_per_frame");
    if (paused) numTicks = 0;
    
    game->maxNumTicks = panel.getValueI("max_ticks_per_game");
    
    for (int ticks = 0; ticks < numTicks; ticks++){
        game->update();
            
        if (game->gameIsDone){
            //cout<<"it over"<<endl;
            endGame();
        }
    }
}




//--------------------------------------------------------------
void ofApp::draw(){
    ofPushMatrix();
    ofTranslate(5, 180);
    game->draw();
    ofSetColor(255);
    
    ofDrawBitmapString("gen: "+ofToString(generationCount)+"  game: "+ofToString(gameCount), 5, -5);
    ofDrawBitmapString("ticks: "+ofToString(game->numTicks), 200, -5);
    ofDrawBitmapString("Space to pause\nR to skip round", 400, -21);
    ofPopMatrix();
    
    
    
    if (!hidePanel){
        panel.draw();
    }
    
    for (int i=0; i<infoBoxes.size(); i++){
        infoBoxes[i].draw();
    }
    
    
}

//--------------------------------------------------------------
void ofApp::keyPressed(int key){
    game->keyPressed(key);
    if (key == ' '){
        paused = !paused;
    }
    if (key == 'p'){
        hidePanel = !hidePanel;
    }
}

//--------------------------------------------------------------
void ofApp::keyReleased(int key){
    game->keyReleased(key);
}

//--------------------------------------------------------------
void ofApp::mouseMoved(int x, int y ){
    if (!hidePanel){
        panel.mouseMoved(x, y);
    }
    
    for (int i=0; i<infoBoxes.size(); i++){
        infoBoxes[i].mouseMoved(x, y);
    }
}

//--------------------------------------------------------------
void ofApp::mouseDragged(int x, int y, int button){
    if (!hidePanel){
        panel.mouseDragged(x, y, button);
    }
}

//--------------------------------------------------------------
void ofApp::mousePressed(int x, int y, int button){
    if (!hidePanel){
        panel.mousePressed(x, y, button);
    }
}

//--------------------------------------------------------------
void ofApp::mouseReleased(int x, int y, int button){
    if (!hidePanel){
        panel.mouseReleased(x, y, button);
    }
}

//--------------------------------------------------------------
void ofApp::mouseEntered(int x, int y){

}

//--------------------------------------------------------------
void ofApp::mouseExited(int x, int y){

}

//--------------------------------------------------------------
void ofApp::windowResized(int w, int h){

}

//--------------------------------------------------------------
void ofApp::gotMessage(ofMessage msg){

}

//--------------------------------------------------------------
void ofApp::dragEvent(ofDragInfo dragInfo){ 

}
