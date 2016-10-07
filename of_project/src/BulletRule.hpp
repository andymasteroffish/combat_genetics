//
//  BulletRule.hpp
//  combat_genetics
//
//  Created by Andrew Wallace on 10/1/16.
//
//

#ifndef BulletRule_hpp
#define BulletRule_hpp

#include "ofMain.h"
#include "Rule.hpp"

#include "BasicInfo.h"

class BulletRule : public Rule{
public:
    
    BulletRule();
    BulletRule( BulletRule * parent, float _mutationCurve);
    
    bool checkCustom(vector<ShipInfo> * shipInfo, vector<BulletInfo> * bInfo);
    void mutateCustom();
    
    void keepRangesReasonable();
    
    void print();
    
    bool usingMinDist;
    float minDist;
    
    bool usingMaxDist;
    float maxDist;
    
    bool usingAngle;
    float minAngle, maxAngle;
    
    bool usingGettingCloser;
    
    
};


#endif /* BulletRule_hpp */
