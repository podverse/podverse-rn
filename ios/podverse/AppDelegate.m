/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import "AppDelegate.h"
#import <AppCenterReactNative.h>
#import <AppCenterReactNativeAnalytics.h>
#import <AppCenterReactNativeCrashes.h>

#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>

#import "React/RCTLinkingManager.h"
#import <RNBackgroundDownloader.h>

#import "Orientation.h"
#import <Firebase.h>
//#import "CarScene.h"
#import "PhoneScene.h"

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [AppCenterReactNative register];  // Initialize AppCenter
  [AppCenterReactNativeAnalytics registerWithInitiallyEnabled:true];  // Initialize AppCenter analytics
  [AppCenterReactNativeCrashes registerWithAutomaticProcessing];  // Initialize AppCenter crashes
 
  [FIRApp configure];
  return YES;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

- (BOOL)application:(UIApplication *)app openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
  return [RCTLinkingManager application:app openURL:url options:options];
}

- (BOOL)application:(UIApplication *)application continueUserActivity:(nonnull NSUserActivity *)userActivity
 restorationHandler:(nonnull void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler
{
  return [RCTLinkingManager application:application
                   continueUserActivity:userActivity
                     restorationHandler:restorationHandler];
}

- (void)application:(UIApplication *)application handleEventsForBackgroundURLSession:(NSString *)identifier completionHandler:(void (^)())completionHandler
{
  [RNBackgroundDownloader setCompletionHandlerWithIdentifier:identifier completionHandler:completionHandler];
}

- (UIInterfaceOrientationMask)application:(UIApplication *)application supportedInterfaceOrientationsForWindow:(UIWindow *)window {
  return [Orientation getOrientation];
}

- (UISceneConfiguration *)application:(UIApplication *)application configurationForConnectingSceneSession:(UISceneSession *)connectingSceneSession options:(UISceneConnectionOptions *)options {
//   if([[connectingSceneSession role] isEqualToString:@"CPTemplateApplicationSceneSessionRoleApplication"]) {
//     UISceneConfiguration *scene = [[UISceneConfiguration alloc] initWithName:@"CarPlay" sessionRole:connectingSceneSession.role];
//     [scene setDelegateClass:CarSceneDelegate.class]; //TODO
//     return scene;
//   } else {
    UISceneConfiguration *scene = [[UISceneConfiguration alloc] initWithName:@"Phone" sessionRole:connectingSceneSession.role];
    [scene setDelegateClass:PhoneSceneDelegate.class]; //TODO
    return scene;
//   }
}

- (void)application:(UIApplication *)application didDiscardSceneSessions:(NSSet<UISceneSession *> *)sceneSessions {
  
}

@end
