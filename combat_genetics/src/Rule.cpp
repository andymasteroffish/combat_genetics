//
//  Rule.cpp
//  combat_genetics
//
//  Created by Andrew Wallace on 9/30/16.
//
//

#include "Rule.hpp"



void Rule::setupFresh(){
    coolDownTicks = MAX(0, ofRandom(-20, 20));
    
    
    command = (Command) (int) ofRandom(COM_WAIT+1);
}

void Rule::setupFromParent(Rule * parent){
    type = parent->type;
    command = parent->command;
}

void Rule::reset(){
    coolDownTimer = 0;
}

bool Rule::check(vector<ShipInfo> * shipInfo, vector<BulletInfo> * bInfo, int shootCoolDownTimer){
    if (coolDownTimer < 0){
        if (command != COM_FIRE || shootCoolDownTimer < 0){
            if( checkCustom(shipInfo, bInfo) ){
                coolDownTimer = coolDownTicks;
                return true;
            }
        }
    }
    return false;
}

void Rule::tick(){
    coolDownTimer--;
}

void Rule::mutate(){
    //some of the time, do nothing
    if (powf(ofRandomuf(), mutationCurve) > 0.5f){
        return;
    }
    
    //chance of changing cool down
    coolDownTicks += ofRandom(-3,3);
    coolDownTicks = CLAMP(coolDownTicks, -15, 20);
    
    //chance of changing funciton
    if (powf(ofRandomuf(), mutationCurve) < 0.15f){
        command = (Command) (int) ofRandom(COM_WAIT+1);
    }
    
    //other atributes handled by the rules
    mutateCustom();
}

string Rule::getCommandName(int id){
    if (id == COM_THRUST){
        return "thrust";
    }
    if (id == COM_REVERSE){
        return "reverse";
    }
    if (id == COM_LEFT){
        return "left";
    }
    if (id == COM_RIGHT){
        return "right";
    }
    if (id == COM_FIRE){
        return "fire";
    }
    if (id == COM_WAIT){
        return "wait";
    }
    
    return "unknown";
    
}