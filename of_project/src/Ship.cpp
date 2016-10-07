//
//  Ship.cpp
//  combat_genetics
//
//  Created by Andrew Wallace on 9/30/16.
//
//

#include "Ship.hpp"

Ship::Ship(){
    speed = 3;
    reverseSpeed = speed * 0.6;
    turnSpeed = PI/40;
    size = 20;
    
    generations = 0;
    age = 0;
    totalKills = 0;
    totalDeaths = 0;
    
    numKills = -1;
    score = -1;
    currentlyPlaying = false;
    
    shootCoolDownTicks = 150;
    
    rules.clear();
    makeRules();
    
    usePlayerControl = false;
    holdingThurst = holdingReverse = holdingLeft = holdingRight = holdingFire = false;
    
    name[0] = createName();
    name[1] = createName();
    name[2] = createName();
    
    //display the rules
//    cout<<"RULES"<<endl;
//    for (int i=0; i<rules.size(); i++){
//        cout<<i<<endl;
//        rules[i]->print();
//    }
}

Ship::Ship(Ship * parent, float mutationCurve){
    usePlayerControl = false;
    
    speed = parent->speed;
    reverseSpeed = parent->reverseSpeed;
    turnSpeed = parent->turnSpeed;
    size = parent->size;
    
    name[0] = createName();
    name[1] = parent->name[0];
    name[2] = parent->name[2];
    
    shootCoolDownTicks = parent->shootCoolDownTicks;
    
    generations = parent->generations + 1;
    age = 0;
    totalKills = 0;
    totalDeaths = 0;
    currentlyPlaying = false;
    
    numKills = -1;  //this will be reset to 0 when a round start
    score = -1;
    
    rules.clear();
    
    for (int i=0; i<parent->rules.size(); i++){
        if (parent->rules[i]->type == RULE_SHIP){
            ShipRule * rule = new ShipRule( (ShipRule *) parent->rules[i], mutationCurve );
            rules.push_back(rule);
        }
        if (parent->rules[i]->type == RULE_BULLET){
            BulletRule * rule = new BulletRule( (BulletRule *) parent->rules[i], mutationCurve );
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
    if (powf(ofRandomuf(), mutationCurve) < 0.3 && rules.size() > 0){
        int randID = ofRandom(rules.size());
        //cout<<"kill rule "<<randID<<endl;
        //rules[randID]->print();
        delete rules[randID];
        rules.erase(rules.begin()+randID);
    }
    
    //chance of adding a rule
    if (powf(ofRandomuf(), mutationCurve) < 0.3){
        if (ofRandomuf() < 0.5){
            rules.push_back( new ShipRule() );
        }else{
            rules.push_back( new BulletRule() );
        }
        //rules.push_back(thisRule);
        //cout<<"added rule"<<endl;
        //thisRule->print();
    }
    
    //high chance of swapping the order of a rule
    if (powf(ofRandomuf(), mutationCurve) < 0.8){
        int randA = ofRandom(rules.size());
        int randB = ofRandom(rules.size());
        Rule * temp = rules[randA];
        rules[randA] = rules[randB];
        rules[randB] = temp;
        
    }
    
    
    
   
    
}

void Ship::makeRules(){
    int numRules = ofRandom(8,20);
    
    for (int i=0; i<numRules; i++){
        
        if (ofRandomuf() < 0.5){
            rules.push_back( new ShipRule() );
        }else{
            rules.push_back( new BulletRule() );
        }
    }
    
    //select a random rule and have the command be fire
    rules[ (int)ofRandom(rules.size())]->command = COM_FIRE;
    

}

void Ship::makeTestRules(){
    
//    BulletRule * backup = new BulletRule();
//    backup->usingMinDist = false;
//    backup->usingMaxDist = false;
//    backup->usingAngle = true;
//    backup->minAngle = -PI/4;
//    backup->maxAngle = PI/4;
//    backup->usingGettingCloser = true;
//    backup->command = COM_REVERSE;
//    
//    rules.push_back(backup);
    
//    BulletRule * go = new BulletRule();
//    go->usingMinDist = false;
//    go->usingMaxDist = false;
//    go->usingAngle = true;
//    go->usingGettingCloser = false;
//    go->command = COM_LEFT;
//    go->coolDownTicks = 2;
    
//    BulletRule * go1 = new BulletRule();
//    go1->usingMinDist = true;
//    go1->minDist = 300;
//    go1->usingMaxDist = false;
//    go1->usingAngle = false;
//    go1->usingGettingCloser = true;
//    go1->command = COM_LEFT;
//    go1->coolDownTicks = 2;
//    
//    BulletRule * go2 = new BulletRule();
//    go2->usingMinDist = false;
//    go2->usingMaxDist = true;
//    go2->maxDist = 100;
//    go2->usingAngle = true;
//    go2->minAngle = PI/2;
//    go2->maxAngle = PI;
//    go2->usingGettingCloser = false;
//    go2->command = COM_THRUST;
//    go2->coolDownTicks = 0;
//    
//    //rules.push_back(go1);
//    rules.push_back(go2);
//    
//    ShipRule * turnRight = new ShipRule();
//    turnRight->usingMinDist = false;
//    turnRight->usingMaxDist = false;
//    turnRight->usingAngle = true;
//    turnRight->minAngle = -PI;
//    turnRight->maxAngle = 0;
//    turnRight->command = COM_RIGHT;
//
//    ShipRule * turnLeft = new ShipRule();
//    turnLeft->usingMinDist = false;
//    turnLeft->usingMaxDist = false;
//    turnLeft->usingAngle = true;
//    turnLeft->minAngle = 0;
//    turnLeft->maxAngle = PI;
//    turnLeft->command = COM_LEFT;
//    
//    ShipRule * goForward = new ShipRule();
//    goForward->usingMinDist = true;
//    goForward->usingMaxDist = false;
//    goForward->minDist = 50;
//    goForward->usingAngle = true;
//    goForward->minAngle = -PI/8;
//    goForward->maxAngle = PI/8;
//    goForward->command = COM_THRUST;
//    
//    ShipRule * shoot = new ShipRule();
//    shoot->usingMinDist = false;
//    shoot->usingMaxDist = false;
//    shoot->usingAngle = true;
//    shoot->minAngle = -PI/10;
//    shoot->maxAngle = PI/10;
//    shoot->command = COM_FIRE;
    
    //rules.push_back(shoot);
    //rules.push_back(goForward);
    //rules.push_back(turnRight);
    //rules.push_back(turnLeft);
    
}

void Ship::resetGame(float startX, float startY, float startAngle){
    pos.set(startX, startY);
    angle = startAngle;
    
    shootCoolDownTimer = 0;
    
    isDead = false;
    currentlyPlaying = true;
    
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
    
    ofSetColor(255);
    if (isDead) ofSetColor(150,60,60);
    ofDrawBitmapString(fullName(), pos.x - fullName().size()*4, pos.y - size);
    
//    ofNoFill();
//    ofSetColor(255,0,0);
//    ofDrawCircle(pos.x, pos.y, size);
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
        if (rules[i]->check(&otherShipsInfo, &otherBulletInfo, shootCoolDownTimer)){
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
    otherBulletInfo.clear();
    
    for (int i=0; i<ships->size(); i++){
        if (ships->at(i) != this && !ships->at(i)->isDead){
            //get the ship info
            ShipInfo info;
            ofVec2f otherPos = ships->at(i)->pos;
            info.distSq = ofDistSquared(pos.x, pos.y, otherPos.x, otherPos.y);
            info.angleFromMe = angle - atan2(pos.y-otherPos.y, pos.x-otherPos.x) + PI;
            if (info.angleFromMe > PI)  info.angleFromMe -= TWO_PI;
            if (info.angleFromMe < -PI) info.angleFromMe += TWO_PI;
            otherShipsInfo.push_back(info);
            
            //get the info for each bullet that ship has active
            for (int b=0; b<ships->at(i)->bullets.size(); b++){
                ofVec2f bulPos = ships->at(i)->bullets[b].pos;
                ofVec2f bulVel = ships->at(i)->bullets[b].vel;
                
                BulletInfo bInfo;
                //distance
                bInfo.distSq = ofDistSquared(pos.x, pos.y, bulPos.x, bulPos.y);
                //angle to me
                bInfo.angleFromMe = angle - atan2(pos.y-bulPos.y, pos.x-bulPos.x) + PI;
                if (bInfo.angleFromMe > PI)  bInfo.angleFromMe -= TWO_PI;
                if (bInfo.angleFromMe < -PI) bInfo.angleFromMe += TWO_PI;
                //see where the bullet will be next frame
                ofVec2f nextBulPos = bulPos + bulVel;
                bInfo.gettingCloser = ofDistSquared(pos.x, pos.y, nextBulPos.x, nextBulPos.y) < bInfo.distSq;
                
                otherBulletInfo.push_back(bInfo);
                
//                if (!usePlayerControl){
//                    cout<<"bullet distSq: "<<bInfo.distSq<<endl;
//                    cout<<"bullet angle: "<<bInfo.angleFromMe<<endl;
//                    cout<<"getting closer: "<<bInfo.gettingCloser<<endl;
//                }
            }
        }
    }
}

string Ship::fullName(){
    return name[0]+" "+name[1]+" "+name[2];
}

string Ship::createName(){
    //21
    char cons[] = {'b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z'};
    //5
    char vowels[] = { 'a', 'e', 'i', 'o', 'u' };
    
    int charsSinceVowel = 0;
    
    string word = "";
    while(true){
        //cout<<"word: "<<word<<endl;
        
        float chanceOfVowel = ofMap(charsSinceVowel, 0, 3, 0.2, 1);
        float chanceOfDone = ofMap(word.size(), 2, 7, 0, 0.9, true);
        //cout<<"space chance "<<chanceOfSpace<<endl;
        if (ofRandomuf() < chanceOfDone){
            word[0] = (char) ((int)word[0] - 32);
            return  word;
        }
        
        if (ofRandomuf() < chanceOfVowel){
            word += vowels[ (int)ofRandom(5)];
            charsSinceVowel = 0;
        }
        else{
            charsSinceVowel++;
            word += cons[ (int)ofRandom(21)];
        }
        
    }
}

void Ship::kill(){
    for (int i=0; i<rules.size(); i++){
        delete rules[i];
    }
    rules.clear();
}


