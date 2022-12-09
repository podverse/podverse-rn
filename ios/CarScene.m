//
//  CarScene.m
//  podverse
//
//  Created by Creon Creonopoulos on 11/16/22.
//  Copyright © 2022 Facebook. All rights reserved.
//

#import "CarScene.h"
#import "AppDelegate.h"
#import <RNCarPlay.h>

@implementation CarSceneDelegate
 - (void)templateApplicationScene:(CPTemplateApplicationScene *)templateApplicationScene didConnectInterfaceController:(CPInterfaceController *)interfaceController {
   AppDelegate *applicationDelegate = (AppDelegate *)[[UIApplication sharedApplication] delegate];
   if(applicationDelegate.bridge == nil) {
     applicationDelegate.bridge = [[RCTBridge alloc] initWithDelegate:applicationDelegate launchOptions:@{}];
     applicationDelegate.rootView = [[RCTRootView alloc] initWithBridge:applicationDelegate.bridge
                                                             moduleName:@"podverse"
                                                      initialProperties:nil];
   }
  
   [RNCarPlay connectWithInterfaceController:interfaceController window:templateApplicationScene.carWindow];
 }

- (void)templateApplicationScene:(CPTemplateApplicationScene *)templateApplicationScene didDisconnectInterfaceController:(CPInterfaceController *)interfaceController {
  [RNCarPlay disconnect];
}

@end
