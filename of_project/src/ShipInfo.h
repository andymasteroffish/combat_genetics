//
//  ShipInfo.h
//  combat_genetics
//
//  Created by Andrew Wallace on 9/30/16.
//
//

#ifndef ShipInfo_h
#define ShipInfo_h

enum Command { COM_THRUST, COM_REVERSE, COM_LEFT, COM_RIGHT, COM_FIRE, COM_WAIT };


class ShipInfo{
public:
    
    float angleFromMe;
    float distSq;
    
};

#endif /* ShipInfo_h */
