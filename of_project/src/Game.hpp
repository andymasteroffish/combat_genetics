//
//  Game.hpp
//  combat_genetics
//
//  Created by Andrew Wallace on 9/30/16.
//
//

#ifndef Game_hpp
#define Game_hpp

#include "ofMain.h"
#include "Ship.hpp"

#include "BasicInfo.h"

class Game{
public:
    
    Game();
    void setup(vector<Ship *> startingShips);
    
    void update();
    bool checkShipAgainstBullets(Ship * target);
    
    void draw();
    
    void keyPressed(int key);
    void keyReleased(int key);
    
    vector<Ship *> ships;
    
    int arenaW, arenaH;
    
    bool gameIsDone;
    int numTicks;
    int maxNumTicks;
    
};

#endif /* Game_hpp */
