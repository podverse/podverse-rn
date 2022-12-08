//
//  PhoneSceneDelegate.m
//  podverse
//
//  Created by Creon Creonopoulos on 11/16/22.
//  Copyright © 2022 Facebook. All rights reserved.
//

#import "PhoneScene.h"
#import "AppDelegate.h"


@implementation PhoneSceneDelegate

- (void)scene:(UIScene *)scene willConnectToSession:(UISceneSession *)session options:(UISceneConnectionOptions *)connectionOptions {
  AppDelegate *applicationDelegate = (AppDelegate *)[[UIApplication sharedApplication] delegate];
  UIViewController *rootViewController = [UIViewController new];
  if(applicationDelegate.bridge == nil) {
    applicationDelegate.bridge = [[RCTBridge alloc] initWithDelegate:applicationDelegate launchOptions:@{}];
    applicationDelegate.rootView = [[RCTRootView alloc] initWithBridge:applicationDelegate.bridge
                                                            moduleName:@"podverse"
                                                     initialProperties:nil];
  }
  
  applicationDelegate.rootView.backgroundColor = [[UIColor alloc] initWithRed:0/255.0f green:0/255.0f blue:0/255.0f alpha:1];
  
  rootViewController.view = applicationDelegate.rootView;
  applicationDelegate.window = [[UIWindow alloc] initWithWindowScene:(UIWindowScene *)scene];
  applicationDelegate.window.rootViewController = rootViewController;
  [applicationDelegate.window makeKeyAndVisible];
}

@end
