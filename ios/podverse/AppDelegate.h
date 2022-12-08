/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import <React/RCTBridgeDelegate.h>
#import <React/RCTRootView.h>
#import <UIKit/UIKit.h>
#import <CarPlay/CarPlay.h>

@interface AppDelegate : UIResponder <UIApplicationDelegate, RCTBridgeDelegate, CPApplicationDelegate>

@property (nonatomic, strong) UIWindow *window;
@property (nonatomic, strong) RCTRootView* rootView;
@property (nonatomic, strong) RCTBridge *bridge;

@end
