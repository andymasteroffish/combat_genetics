#include "ofMain.h"
#include "ofApp.h"

#include "BasicInfo.h"

//========================================================================
int main( ){
	ofSetupOpenGL(ARENA_W+600,ARENA_H+200,OF_WINDOW);			// <-------- setup the GL context

	// this kicks off the running of my app
	// can be OF_WINDOW or OF_FULLSCREEN
	// pass in width and height too:
	ofRunApp(new ofApp());

}
