//
//  BulletRule.cpp
//  combat_genetics
//
//  Created by Andrew Wallace on 10/1/16.
//
//

#include "BulletRule.hpp"


BulletRule::BulletRule(){
    setupFresh();
    
    type = RULE_BULLET;
    
    usingMaxDist = ofRandomuf() > 0.5;
    usingMinDist = ofRandomuf() > 0.5;
    usingAngle = ofRandomuf() > 0.5;
    usingGettingCloser = ofRandomuf() > 0.5;
    
    
    minDist = ofRandom(0, ARENA_W);
    maxDist = ofRandom(0, ARENA_W);
    minAngle = ofRandom(-PI, PI);
    maxAngle = ofRandom(-PI, PI);
    
    keepRangesReasonable();
    
    mutationCurve = 1;
}

BulletRule::BulletRule( BulletRule * parent, float _mutaionCurve){
    mutationCurve = _mutaionCurve;
    
    setupFromParent(parent);
    
    usingMaxDist = parent->usingMaxDist;
    usingMinDist = parent->usingMinDist;
    usingAngle = parent->usingAngle;
    usingGettingCloser = parent->usingGettingCloser;
    
    minDist = parent->minDist;
    maxDist = parent->maxDist;
    minAngle = parent->minAngle;
    maxAngle = parent->maxAngle;
    
    mutate();
}

bool BulletRule::checkCustom(vector<ShipInfo> *shipInfo,  vector<BulletInfo> * bInfo){
    //cout<<"checking "<<shipInfo->size()<<endl;
    for (int i=0; i<bInfo->size(); i++){
        BulletInfo info = bInfo->at(i);
        
        //cout<<"ang from me: "<<info.angleFromMe/PI<<endl;
        
        bool minDistPass = !usingMinDist;
        bool maxDistPass = !usingMaxDist;
        bool anglePass = !usingAngle;
        bool closerPass = !usingGettingCloser;
        
        if (usingMinDist){
            minDistPass = info.distSq > minDist*minDist;
        }
        if (usingMaxDist){
            maxDistPass = info.distSq < maxDist*maxDist;
        }
        
        if (usingAngle){
            anglePass = info.angleFromMe > minAngle && info.angleFromMe < maxAngle;
        }
        
        if (usingGettingCloser){
            closerPass = info.gettingCloser;
        }
        
        //cout<<"what we got "<<minDistPass<<" "<<maxDistPass<<" "<<anglePass<<" "<<closerPass<<endl;
        
        if (minDistPass && maxDistPass && anglePass && closerPass){
            //cout<<"angle from me: "<<info.angleFromMe/PI<<endl;
            return true;
        }
        
    }
    
    return false;
}

void BulletRule::mutateCustom(){
    
    float baseSwitchChance = 0.2;
    
    //cout<<"my mut curve "<<mutationCurve<<endl;
    
    if (powf(ofRandomuf(), mutationCurve) < baseSwitchChance)    usingMinDist = !usingMinDist;
    if (powf(ofRandomuf(), mutationCurve) < baseSwitchChance)    usingMaxDist = !usingMaxDist;
    if (powf(ofRandomuf(), mutationCurve) < baseSwitchChance)    usingAngle = !usingAngle;
    if (powf(ofRandomuf(), mutationCurve) < baseSwitchChance)    usingGettingCloser = !usingGettingCloser;
    
    float distRange = 50 * mutationCurve;
    minDist += ofRandom(-distRange, distRange);
    maxDist += ofRandom(-distRange, distRange);
    
    float angleRange = PI/4 * mutationCurve;
    minAngle += ofRandom(-angleRange, angleRange);
    maxAngle += ofRandom(-angleRange, angleRange);
    
    keepRangesReasonable();
    
    
}

void BulletRule::keepRangesReasonable(){
    minAngle = CLAMP(minAngle, -PI, PI);
    maxAngle = CLAMP(maxAngle, -PI, PI);
    if (minAngle > maxAngle){
        float temp = minAngle;
        minAngle = maxAngle;
        maxAngle = temp;
    }
    
    minDist = CLAMP(minDist, 0, ARENA_W);
    maxDist = CLAMP(maxDist, 0, ARENA_W);
    if (minDist > maxDist){
        float temp = minDist;
        minDist = maxDist;
        maxDist = temp;
    }
}

void BulletRule::print(){
    
    
    
    cout<<"bullet rule: "<<getCommandName(command)<<"  cool down: "<<coolDownTicks<<endl;
    if (usingMinDist){
        cout<<"min dist: "<<minDist<<endl;
    }
    if (usingMaxDist){
        cout<<"max dist: "<<maxDist<<endl;
    }
    if (usingAngle){
        cout<<"angle between "<<minAngle<<" and "<<maxAngle<<endl;
    }
    if (usingGettingCloser){
        cout<<"bullet must be getting closer"<<endl;
    }
}