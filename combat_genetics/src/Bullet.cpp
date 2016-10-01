//
//  Bullet.cpp
//  combat_genetics
//
//  Created by Andrew Wallace on 9/30/16.
//
//

#include "Bullet.hpp"

void Bullet::setup(float x, float y, float angle){
    
    float speed = 4;
    size = 5;
    
    pos.set(x,y);
    vel.x = cos(angle) * speed;
    vel.y = sin(angle) * speed;
    
}

void Bullet::update(){
    pos += vel;
}

void Bullet::draw(){
    ofNoFill();
    ofSetColor(255);
    ofDrawCircle(pos.x, pos.y, size);
}