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
  rootViewController.view = applicationDelegate.rootView;
  self.window = [[UIWindow alloc] initWithWindowScene:(UIWindowScene *)scene];
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
}

@end
