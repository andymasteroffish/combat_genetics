#include "ofApp.h"


bool ofApp::shipSort(  Ship * a, Ship * b ) {
    return a->score > b->score;
}

//--------------------------------------------------------------
void ofApp::setup(){
    ofBackground(0);
    
    //basic info
    numShips = 64;
    numShipsPerGame = 8;
    
    //prepare panel
    panel.setup("settings", ofGetWidth()-280, 0, 270, 400);
    panel.addPanel("settings");
    panel.setWhichPanel(0);
    panel.addSliderInt("ticks_per_frame", 20, 1, 100);
    panel.addSliderInt("max_ticks_per_game", 10000, 500, 100000);
    
    panel.addSlider("mutation_rate", 1, 0.2, 5);
                
    
    //set our default values
    shipsWaiting.clear();
    shipsDone.clear();
    
    generationCount = 1;
    gameCount = 0;
    
    paused = false;
    
    //start with random ships
    shipsWaiting.resize(numShips);
    for (int i=0; i<shipsWaiting.size(); i++){
        shipsWaiting[i] = new Ship();
    }
    
    //start it up!
    game = NULL;
    startNextGame();
}

//--------------------------------------------------------------
void ofApp::startNextGame(){
    
    gameCount ++;
    cout<<"start game "<<gameCount<<endl;
    
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
    
    cout<<"end game"<<endl;
    //give everybody their score and move them to the done list
    for (int i=0; i<game->ships.size(); i++){
        game->ships[i]->score = game->ships[i]->numKills * game->ships[i]->winnerBonus;
        cout<<"ship "<<i<<" kills: "<<game->ships[i]->numKills<<"  bonus: "<<game->ships[i]->winnerBonus<<" score: "<<game->ships[i]->score<<endl;
        
        
        //age them
        game->ships[i]->age++;
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
    
//    for (int i=0; i<shipsDone.size(); i++){
//        cout<<i<<(i<10 ? " ":"")<<" - kills: "<<shipsDone[i]->numKills<<"  bonus: "<<shipsDone[i]->winnerBonus<<" score: "<<shipsDone[i]->score<<endl;
//    }
    
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
    
    //show what we've got
    cout<<endl<<"new ship list:"<<endl;
    for (int i=0; i<shipsWaiting.size(); i++){
        cout<<i<<(i<10?" ":"")<<" - age: "<<shipsWaiting[i]->age<< "  gen: "<<shipsWaiting[i]->generations<<"  score prev round: "<<shipsWaiting[i]->score<<"  total kills: "<<shipsWaiting[i]->totalKills<<"  total deaths: "<<shipsWaiting[i]->totalDeaths<<endl;
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
    ofTranslate(5, 5);
    game->draw();
    ofPopMatrix();
    
    ofSetColor(255);
    ofDrawBitmapString("gen: "+ofToString(generationCount)+"  game: "+ofToString(gameCount), 10, 35);
    
    panel.draw();
}

//--------------------------------------------------------------
void ofApp::keyPressed(int key){
    game->keyPressed(key);
    if (key == ' '){
        paused = !paused;
    }
}

//--------------------------------------------------------------
void ofApp::keyReleased(int key){
    game->keyReleased(key);
}

//--------------------------------------------------------------
void ofApp::mouseMoved(int x, int y ){
    panel.mouseMoved(x, y);
}

//--------------------------------------------------------------
void ofApp::mouseDragged(int x, int y, int button){
    panel.mouseDragged(x, y, button);
}

//--------------------------------------------------------------
void ofApp::mousePressed(int x, int y, int button){
    panel.mousePressed(x, y, button);
}

//--------------------------------------------------------------
void ofApp::mouseReleased(int x, int y, int button){
    panel.mouseReleased(x, y, button);
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
