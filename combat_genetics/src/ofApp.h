#pragma once

#include "ofMain.h"

#include "ofxControlPanel.h"

#include "Game.hpp"
#include "Ship.hpp"


class ofApp : public ofBaseApp{

public:
    
    static bool shipSort(  Ship * a, Ship * b );
    
    void setup();
    
    void startNextGame();
    void endGame();
    void startNextGeneration();
    
    void update();
    
    void draw();

    void keyPressed(int key);
    void keyReleased(int key);
    void mouseMoved(int x, int y );
    void mouseDragged(int x, int y, int button);
    void mousePressed(int x, int y, int button);
    void mouseReleased(int x, int y, int button);
    void mouseEntered(int x, int y);
    void mouseExited(int x, int y);
    void windowResized(int w, int h);
    void dragEvent(ofDragInfo dragInfo);
    void gotMessage(ofMessage msg);
    
    ofxControlPanel panel;
    bool paused;
    
    int numShips;
    vector<Ship *> shipsWaiting, shipsDone;
    
    float mutationCurve; //high values will push the rand number closer to 0. Lower prc values mean more mutaitons!
    
    Game * game;
    int numShipsPerGame;
    int generationCount, gameCount;
		
};
