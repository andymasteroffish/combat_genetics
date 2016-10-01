//
//  InfoBox.cpp
//  combat_genetics
//
//  Created by Andrew Wallace on 10/1/16.
//
//

#include "InfoBox.hpp"

void InfoBox::setup(int _idNum, float x, float y, float w, float h){
    idNum = _idNum;
    ship = NULL;
    bounds.set(x, y, w, h);
}

void InfoBox::setShip(Ship * _ship){
    ship = _ship;
}

void InfoBox::draw(){
    
    if (ship->currentlyPlaying){
        ofFill();
        ofSetColor(80);
        ofDrawRectangle(bounds);
    }
    
    ofNoFill();
    ofSetColor(255);
    ofDrawRectangle(bounds);
    
    if (ship != NULL){
        ofSetColor(255);
        string nameText = ofToString(idNum) +" : "+ ship->fullName();
        if (ship->currentlyPlaying){
            nameText += ship->isDead ? " - dead" : " - fighting";
            
            if (ship->isDead){
                ofSetColor(155,0,0);
            }
        }
        ofDrawBitmapString(nameText, bounds.x + 5, bounds.y + 12);
        
        ofSetColor(255);
        string line = "";
        line += "age: "+ofToString(ship->age)+" ";
        line += "gen: "+ofToString(ship->generations)+" ";
        line += "kills: "+ofToString(ship->totalKills)+" ";
        line += "deaths: "+ofToString(ship->totalDeaths)+" ";
        
        ofDrawBitmapString(line, bounds.x + 5, bounds.y + 26);
        
    }
}

void InfoBox::mouseMoved(int x, int y ){
    
}