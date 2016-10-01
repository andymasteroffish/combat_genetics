//
//  Ship.cpp
//  combat_genetics
//
//  Created by Andrew Wallace on 9/30/16.
//
//

#include "Ship.hpp"

Ship::Ship(){
    speed = 2;
    reverseSpeed = speed * 0.6;
    turnSpeed = PI/40;
    size = 20;
    
    generations = 0;
    age = 0;
    totalKills = 0;
    totalDeaths = 0;
    
    shootCoolDownTicks = 150;
    
    rules.clear();
    makeRules();
    
    usePlayerControl = false;
    holdingThurst = holdingReverse = holdingLeft = holdingRight = holdingFire = false;
    
    
    makeRules();
}

Ship::Ship(Ship * parent, float mutationCurve){
    usePlayerControl = false;
    
    speed = parent->speed;
    reverseSpeed = parent->reverseSpeed;
    turnSpeed = parent->turnSpeed;
    size = parent->size;
    
    shootCoolDownTicks = parent->shootCoolDownTicks;
    
    generations = parent->generations + 1;
    age = 0;
    totalKills = 0;
    totalDeaths = 0;
    
    numKills = -1;  //this will be reset to 0 when a round start
    score = -1;
    
    rules.clear();
    
    for (int i=0; i<parent->rules.size(); i++){
        if (parent->rules[i]->type == RULE_SHIP){
            ShipRule * rule = new ShipRule( (ShipRule *) parent->rules[i], mutationCurve );
            rules.push_back(rule);
        }
    }
    
    //display the rules
//    cout<<"RULES"<<endl;
//    for (int i=0; i<rules.size(); i++){
//        cout<<endl;
//        cout<<i<<" parent"<<endl;
//        parent->rules[i]->print();
//        cout<<i<<" me"<<endl;
//        rules[i]->print();
//    }
    
    //chance of removing a rule
    if (powf(ofRandomuf(), mutationCurve) < 0.2 && rules.size() > 0){
        int randID = ofRandom(rules.size());
        //cout<<"kill rule "<<randID<<endl;
        //rules[randID]->print();
        delete rules[randID];
        rules.erase(rules.begin()+randID);
    }
    
    //chance of adding a rule
    if (powf(ofRandomuf(), mutationCurve) < 0.2){
        ShipRule * thisRule = new ShipRule();
        rules.push_back(thisRule);
        //cout<<"added rule"<<endl;
        //thisRule->print();
    }
    
    
    
   
    
}

void Ship::makeRules(){

    
    int numRules = ofRandom(5,15);
    
    for (int i=0; i<numRules; i++){
        ShipRule * thisRule = new ShipRule();
        rules.push_back(thisRule);
    }
    
    //select a random rule and have the command be fire
    rules[ (int)ofRandom(rules.size())]->command = COM_FIRE;
    

}

void Ship::makeTestRules(){
    
    
    
    
    ShipRule * turnRight = new ShipRule();
    turnRight->usingMinDist = false;
    turnRight->usingMaxDist = false;
    turnRight->usingAngle = true;
    turnRight->minAngle = -PI;
    turnRight->maxAngle = 0;
    turnRight->command = COM_RIGHT;
    
    ShipRule * turnLeft = new ShipRule();
    turnLeft->usingMinDist = false;
    turnLeft->usingMaxDist = false;
    turnLeft->usingAngle = true;
    turnLeft->minAngle = 0;
    turnLeft->maxAngle = PI;
    turnLeft->command = COM_LEFT;
    
    ShipRule * goForward = new ShipRule();
    goForward->usingMinDist = true;
    goForward->usingMaxDist = false;
    goForward->minDist = 50;
    goForward->usingAngle = true;
    goForward->minAngle = -PI/8;
    goForward->maxAngle = PI/8;
    goForward->command = COM_THRUST;
    
    ShipRule * shoot = new ShipRule();
    shoot->usingMinDist = false;
    shoot->usingMaxDist = false;
    shoot->usingAngle = true;
    shoot->minAngle = -PI/10;
    shoot->maxAngle = PI/10;
    shoot->command = COM_FIRE;
    
    rules.push_back(shoot);
    rules.push_back(goForward);
    rules.push_back(turnRight);
    rules.push_back(turnLeft);
    
}

void Ship::resetGame(float startX, float startY, float startAngle){
    pos.set(startX, startY);
    angle = startAngle;
    
    shootCoolDownTimer = 0;
    
    isDead = false;
    
    numKills = 0;
    winnerBonus = 1;
    score = 0;
    
    for (int i=0; i<rules.size(); i++){
        rules[i]->reset();
    }
    
    bullets.clear();
}

void Ship::update(){
    if (isDead){
        return;
    }
    
    shootCoolDownTimer--;
    
    //get our move for the turn
    if (!usePlayerControl){
        excuteCommand( getCommandFromRules() );
    }else{
        excuteCommand( getCommandPlayerControl() );
    }
    
    //keep angle in range
    if (angle > PI){
        angle -= TWO_PI;
    }
    if (angle < -PI){
        angle += TWO_PI;
    }
    
    //tetsing
    if (!usePlayerControl){
        //cout<<"my angle "<<angle/PI<<endl;
        //cout<<"distsq "<<otherShipsInfo[0].distSq<<endl;
        //cout<<"angle  "<<otherShipsInfo[0].angleFromMe<<endl;
    }
    
}

void Ship::draw(){
    
    ofPushMatrix();
    ofTranslate(pos.x, pos.y);
    ofRotate(ofRadToDeg(angle));
    ofSetColor(255);
    if (isDead) ofSetColor(55,0,0);
    ofFill();
    ofDrawTriangle(size, 0, -size/2, size*0.75, -size/2, -size*0.75);
    
    ofSetColor(0);
    ofDrawCircle(size, 0, 5);
    
    ofPopMatrix();
    
    ofNoFill();
    ofSetColor(255,0,0);
    ofDrawCircle(pos.x, pos.y, size);
}

void Ship::fire(){
    Bullet bul;
    bul.setup(pos.x, pos.y, angle);
    bullets.push_back(bul);
    shootCoolDownTimer = shootCoolDownTicks;
    
}

void Ship::excuteCommand(Command com){
    if (com == COM_THRUST){
        pos.x += cos(angle) * speed;
        pos.y += sin(angle) * speed;
    }
    if (com == COM_REVERSE){
        pos.x += cos(angle) * -reverseSpeed;
        pos.y += sin(angle) * -reverseSpeed;
    }
    if (com == COM_LEFT){
        angle -= turnSpeed;
    }
    if (com == COM_RIGHT){
        angle += turnSpeed;
    }
    if (com == COM_FIRE){
        fire();
    }
}

Command Ship::getCommandFromRules(){
    //cout<<"
    //tick down all timers
    for (int i=0; i<rules.size(); i++){
        rules[i]->tick();
    }
    
    //go through rules in order
    for (int i=0; i<rules.size(); i++){
        if (rules[i]->check(&otherShipsInfo, shootCoolDownTimer)){
            return rules[i]->command;
        }
    }

    //if none worked, just wait
    return COM_WAIT;
}

Command Ship::getCommandPlayerControl(){
    if (holdingFire && shootCoolDownTimer <= 0){
        return COM_FIRE;
    }
    if (holdingThurst){
        return COM_THRUST;
    }
    if (holdingReverse){
        return COM_REVERSE;
    }
    if (holdingLeft){
        return COM_LEFT;
    }
    if (holdingRight){
        return COM_RIGHT;
    }
    return COM_WAIT;
}

void Ship::keyPressed(int key){
    if (!usePlayerControl)
        return;
    
    if (key == OF_KEY_LEFT)     holdingLeft = true;
    if (key == OF_KEY_RIGHT)    holdingRight = true;
    if (key == OF_KEY_UP)       holdingThurst = true;
    if (key == OF_KEY_DOWN)     holdingReverse = true;
    if (key == 'z')             holdingFire = true;
    
}
void Ship::keyReleased(int key){
    if (!usePlayerControl)
        return;
    
    if (key == OF_KEY_LEFT)     holdingLeft = false;
    if (key == OF_KEY_RIGHT)    holdingRight = false;
    if (key == OF_KEY_UP)       holdingThurst = false;
    if (key == OF_KEY_DOWN)     holdingReverse = false;
    if (key == 'z')             holdingFire = false;
}

void Ship::setGameInfo( vector<Ship*> * ships ){
    otherShipsInfo.clear();
    
    for (int i=0; i<ships->size(); i++){
        if (ships->at(i) != this && !ships->at(i)->isDead){
            ShipInfo info;
            ofVec2f otherPos = ships->at(i)->pos;
            info.distSq = ofDistSquared(pos.x, pos.y, otherPos.x, otherPos.y);
            info.angleFromMe = angle - atan2(pos.y-otherPos.y, pos.x-otherPos.x) + PI;
            if (info.angleFromMe > PI)  info.angleFromMe -= TWO_PI;
            if (info.angleFromMe < -PI) info.angleFromMe += TWO_PI;
            otherShipsInfo.push_back(info);
        }
    }
}

void Ship::kill(){
    for (int i=0; i<rules.size(); i++){
        delete rules[i];
    }
    rules.clear();
}


