package com.podverse;

import android.app.Activity;
import android.os.Build;
import android.util.Log;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import java.util.Map;
import java.util.HashMap;

public class PVAndroidAutoModule extends ReactContextBaseJavaModule{
    PVAndroidAutoModule(ReactApplicationContext context) {
        super(context);
    }

    public String getName() {
        return "PVAndroidAutoModule";
    }

    @ReactMethod
    public void turnOffShowWhenLocked() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            Activity activity = getReactApplicationContext().getCurrentActivity();
            activity.setShowWhenLocked(false);
            activity.setTurnScreenOn(false);
        }
    }
}
