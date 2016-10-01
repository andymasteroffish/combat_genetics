//
//  Ship.hpp
//  combat_genetics
//
//  Created by Andrew Wallace on 9/30/16.
//
//

#ifndef Ship_hpp
#define Ship_hpp

#include "ofMain.h"
#include "Bullet.hpp"

#include "Rule.hpp"
#include "ShipRule.hpp"

#include "ShipInfo.h"


class Ship{
public:
    
    Ship();
    Ship(Ship * parent, float mutationCurve);
    
    void makeRules();
    
    void makeTestRules();
    
    void resetGame(float startX, float startY, float startAngle);
    
    void update();
    void fire();
    
    void excuteCommand(Command com);
    Command getCommandFromRules();
    
    Command getCommandPlayerControl();
    
    void draw();
    
    void keyPressed(int key);
    void keyReleased(int key);
    
    void setGameInfo( vector<Ship*> * ships );
    
    void kill();
    
    //basic shit
    ofVec2f pos;
    float angle;
    
    float speed, reverseSpeed;
    float turnSpeed;
    float size;
    
    bool isDead;
    
    //shooting
    int shootCoolDownTimer, shootCoolDownTicks;
    vector<Bullet> bullets;
    
    //rules
    vector<Rule *> rules;
    
    //info about the field
    vector<ShipInfo> otherShipsInfo;
    
    //round data
    int numKills;
    float winnerBonus;
    float score;
    
    //persistent data
    int age;
    int generations;
    int totalKills;
    int totalDeaths;
    
    
    //player control for debug
    bool usePlayerControl;
    bool holdingThurst, holdingReverse, holdingLeft, holdingRight, holdingFire;
    
    
    
};

#endif /* Ship_hpp */