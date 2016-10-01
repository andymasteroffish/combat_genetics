//
//  ShipRule.hpp
//  combat_genetics
//
//  Created by Andrew Wallace on 9/30/16.
//
//

#ifndef ShipRule_hpp
#define ShipRule_hpp

#include "ofMain.h"
#include "Rule.hpp"

#include "BasicInfo.h"

class ShipRule : public Rule{
public:
    
    ShipRule();
    ShipRule( ShipRule * parent, float _mutationCurve);
    
    bool checkCustom(vector<ShipInfo> * shipInfo,  vector<BulletInfo> * bInfo);
    void mutateCustom();
    
    void keepRangesReasonable();
    
    void print();
    
    bool usingMinDist;
    float minDist;
    
    bool usingMaxDist;
    float maxDist;
    
    bool usingAngle;
    float minAngle, maxAngle;
    
    
};

#endif /* ShipRule_hpp */
