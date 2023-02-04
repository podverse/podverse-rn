//
//  PhoneSceneDelegate.m
//  podverse
//
//  Created by Creon Creonopoulos on 11/16/22.
//  Copyright © 2022 Facebook. All rights reserved.
//

#import "PhoneScene.h"
#import "AppDelegate.h"
#import "React/RCTLinkingManager.h"


@implementation PhoneSceneDelegate

- (void)scene:(UIScene *)scene willConnectToSession:(UISceneSession *)session options:(UISceneConnectionOptions *)connectionOptions {
  NSUserActivity *userActivity = [connectionOptions.userActivities allObjects].firstObject;
  NSMutableDictionary *launchOptions = [@{} mutableCopy];
  if(userActivity.webpageURL != nil) {
    launchOptions[UIApplicationLaunchOptionsURLKey] = userActivity.webpageURL;
  }
  
  AppDelegate *applicationDelegate = (AppDelegate *)[[UIApplication sharedApplication] delegate];
  UIViewController *rootViewController = [UIViewController new];
  if(applicationDelegate.bridge == nil) {
    applicationDelegate.bridge = [[RCTBridge alloc] initWithDelegate:applicationDelegate launchOptions:launchOptions];
    applicationDelegate.rootView = [[RCTRootView alloc] initWithBridge:applicationDelegate.bridge
                                                            moduleName:@"podverse"
                                                     initialProperties:nil];
  }
  
  applicationDelegate.rootView.backgroundColor = [[UIColor alloc] initWithRed:0/255.0f green:0/255.0f blue:0/255.0f alpha:1];
  applicationDelegate.rootView.loadingView = [[UIStoryboard storyboardWithName:@"LaunchScreen" bundle:nil] instantiateInitialViewController].view;
  rootViewController.view = applicationDelegate.rootView;
  applicationDelegate.window = [[UIWindow alloc] initWithWindowScene:(UIWindowScene *)scene];
  applicationDelegate.window.rootViewController = rootViewController;
  [applicationDelegate.window makeKeyAndVisible];
}

-(void)scene:(UIScene *)scene continueUserActivity:(nonnull NSUserActivity *)userActivity{
  if(userActivity.webpageURL != nil) {
    [RCTLinkingManager application:[UIApplication sharedApplication] openURL:userActivity.webpageURL options:userActivity.userInfo];
  }
}

@end
