//
//  Rule.hpp
//  combat_genetics
//
//  Created by Andrew Wallace on 9/30/16.
//
//

#ifndef Rule_hpp
#define Rule_hpp

#include "ofMain.h"
#include "ShipInfo.h"
#include "BulletInfo.h"

enum RuleType { RULE_SHIP, RULE_BULLET };

class Rule{
public:
    
    void setupFresh();
    void setupFromParent(Rule * parent);
    
    void reset();
    bool check(vector<ShipInfo> * shipInfo, vector<BulletInfo> * bInfo, int shootCoolDownTimer);
    void tick();
    
    virtual bool checkCustom(vector<ShipInfo> * shipInfo,  vector<BulletInfo> * bInfo){ return false; }
    
    void mutate();
    virtual void mutateCustom() {};
    
    virtual void print() {};
    string getCommandName(int id);
    
    
    Command command;
    
    int coolDownTicks;
    int coolDownTimer;
    
    RuleType type;
    
    float mutationCurve;
    
};

#endif /* Rule_hpp */
