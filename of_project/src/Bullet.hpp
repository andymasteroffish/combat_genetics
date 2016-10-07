//
//  Bullet.hpp
//  combat_genetics
//
//  Created by Andrew Wallace on 9/30/16.
//
//

#ifndef Bullet_hpp
#define Bullet_hpp

#include "ofMain.h"

class Bullet{
public:
    
    ofVec2f pos;
    ofVec2f vel;
    float size;
    
    
    
    void setup(float x, float y, float angle);
    void update();
    void draw();
    
};

#endif /* Bullet_hpp */
