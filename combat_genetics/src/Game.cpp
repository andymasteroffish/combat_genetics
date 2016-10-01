//
//  Game.cpp
//  combat_genetics
//
//  Created by Andrew Wallace on 9/30/16.
//
//

#include "Game.hpp"

Game::Game(){
    arenaW = ARENA_W;
    arenaH = ARENA_H;
    maxNumTicks = 10000;
}

void Game::setup(vector<Ship *> startingShips){
    gameIsDone = false;
    
    ships.clear();
    
    for (int i=0; i<startingShips.size(); i++){
        ships.push_back( startingShips[i] );
    }
    
    float startDist = arenaW/3;
    float angleStep = TWO_PI / ships.size();
    for (int i=0; i<ships.size(); i++){
        float startX = arenaW/2 + cos(angleStep * i) * startDist;
        float startY = arenaH/2 + sin(angleStep * i) * startDist;
        ships[i]->resetGame(startX, startY, angleStep * i + PI*0.9);
    }
    
    numTicks = 0;
}

void Game::update(){
    numTicks++;
    
    //give everybody new info
    for (int i=0; i<ships.size(); i++){
        ships[i]->setGameInfo(&ships);
    }
    
    //update
    for (int i=0; i<ships.size(); i++){
        ships[i]->update();
        
        //level wrap
        if (ships[i]->pos.x < 0)        ships[i]->pos.x = arenaW;
        if (ships[i]->pos.x > arenaW)   ships[i]->pos.x = 0;
        if (ships[i]->pos.y < 0)        ships[i]->pos.y = arenaH;
        if (ships[i]->pos.y > arenaH)   ships[i]->pos.y = 0;
        
        //update bullets
        for (int b=0; b<ships[i]->bullets.size(); b++){
            ships[i]->bullets[b].update();
        }
    }
    
    
    //check for hits
    for (int i=0; i<ships.size(); i++){
        if (!ships[i]->isDead){
            if (checkShipAgainstBullets(ships[i])){
                ships[i]->isDead = true;
                ships[i]->totalDeaths++;
                ships[i]->bullets.clear();
            }
        }
    }
    
    //kill off screen bullets
    for (int i=0; i<ships.size(); i++){
        for (int b=ships[i]->bullets.size()-1; b>=0; b--){
            ofVec2f pos = ships[i]->bullets[b].pos;
            if (pos.x < 0 || pos.x > arenaW || pos.y < 0 || pos.y > arenaH || ships[i]->isDead){
                ships[i]->bullets.erase( ships[i]->bullets.begin() + b);
            }
        }
    }
    
    //is it game over?
    if (numTicks > maxNumTicks){
        gameIsDone = true;
    }
    
    int numAlive = 0;
    for (int i=0; i<ships.size(); i++){
        if (!ships[i]->isDead){
            numAlive++;
        }
    }
    if (numAlive <= 1){
        gameIsDone = true;
    }
    
    //if only one is left, give them the bonus
    if (numAlive == 1){
        for (int i=0; i<ships.size(); i++){
            if (!ships[i]->isDead){
                ships[i]->winnerBonus = 1.5;
            }
        }
    }
    
    
}

bool Game::checkShipAgainstBullets(Ship * target){
    for (int i=0; i<ships.size(); i++){
        if (ships[i] != target){
            for (int b=0; b<ships[i]->bullets.size(); b++){
                ofVec2f bPos = ships[i]->bullets[b].pos;
                float bSize = ships[i]->bullets[b].size;
                if (ofDistSquared(target->pos.x, target->pos.y, bPos.x, bPos.y) < powf(target->size+bSize, 2)){
                    //move the bullet off screen
                    ships[i]->bullets[b].pos.x = -10000;
                    //give a point to the killer
                    ships[i]->numKills++;
                    ships[i]->totalKills++;
                    //and mark that there was a hit!
                    return true;
                }
            }
        }
    }
    
    return false;
}

void Game::draw(){
    ofSetColor(255);
    ofNoFill();
    ofDrawRectangle(0,0,arenaW, arenaH);
    
    
    //draw dead ships
    for (int i=0; i<ships.size(); i++){
        if (ships[i]->isDead){
            ships[i]->draw();
        }
    }
    
    //draw living ships and their bullets
    for (int i=0; i<ships.size(); i++){
        if (!ships[i]->isDead){
            ships[i]->draw();
        }
        for (int b=0; b<ships[i]->bullets.size(); b++){
            ships[i]->bullets[b].draw();
        }
    }
    
    
    ofSetColor(255);
    ofDrawBitmapString("ticks: "+ofToString(numTicks), 5, 15);
}

void Game::keyPressed(int key){
    for (int i=0; i<ships.size(); i++){
        ships[i]->keyPressed(key);
    }
    
    if (key == 'r'){
        gameIsDone = true;
    }
}
void Game::keyReleased(int key){
    for (int i=0; i<ships.size(); i++){
        ships[i]->keyReleased(key);
    }
}