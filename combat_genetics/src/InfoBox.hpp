//
//  InfoBox.hpp
//  combat_genetics
//
//  Created by Andrew Wallace on 10/1/16.
//
//

#ifndef InfoBox_hpp
#define InfoBox_hpp

#include "ofMain.h"
#include "Ship.hpp"

class InfoBox{
public:
    
    void setup(int _idNum, float x, float y, float w, float h);
    void setShip(Ship * _ship);
    
    void draw();
    void mouseMoved(int x, int y );
    
    int idNum;
    
    ofRectangle bounds;
    
    Ship * ship;
    
};

#endif /* InfoBox_hpp */
