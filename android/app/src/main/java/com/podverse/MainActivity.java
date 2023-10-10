package com.podverse;

import com.facebook.react.ReactActivity;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;

import android.os.Build;
import android.os.Bundle;

import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.content.res.Configuration;
import android.util.Log;

import org.json.JSONException;
import org.json.JSONObject;

public class MainActivity extends ReactActivity {
    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "podverse";
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(null);
        // This is to support Android Auto wake PV when the screen is locked.
        // and to prevent app showing up on the lock screen, use PVAndroidAutoModule to turn this off
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true);
            setTurnScreenOn(true);
        }
        if(getResources().getBoolean(R.bool.portrait_only)){
            setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
        }
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        Intent intent = new Intent("onConfigurationChanged");
        intent.putExtra("newConfig", newConfig);
        this.sendBroadcast(intent);
    }

    @Override
    public void onNewIntent(Intent intent) {
        Log.d("com.podverse.MainActivity", "Received new intent");
        if (intent == null || intent.getExtras() == null) {
            Log.d("com.podverse.MainActivity", "intent is null");
            super.onNewIntent(intent);
            return;
        }

        if (intent.getExtras() == null) {
            Log.d("com.podverse.MainActivity", "intent extras are null");
            super.onNewIntent(intent);
            return;
        }

        Bundle extras = intent.getExtras();

        int messageId = extras.getInt("pv_message_id", -1);
        if (messageId == -1) {
            Log.d("com.podverse.MainActivity", "pv_message_id does not exist");
            super.onNewIntent(intent);
            return;
        }

        Log.d("com.podverse.MainActivity", "pv_message_id: " + messageId);

        String instance = extras.getString("up_instance", null);
        if (instance == null) {
            Log.e("com.podverse.MainActivity", "up_instance does not exist");
            super.onNewIntent(intent);
            return;
        }

        String notificationString = PVUnifiedPushModule.popNotification(this, messageId);
        JSONObject notificationJson;
        try {
            notificationJson = new JSONObject(notificationString);
        } catch (JSONException e) {
            e.printStackTrace();
            return;
        }

        WritableMap eventMap = new WritableNativeMap();
        try {
            eventMap.putMap("data", PVUnifiedPushModule.jsonToReact(notificationJson));
        } catch (JSONException e) {
            e.printStackTrace();
            return;
        }

        PVUnifiedPushModule.setInitialNotification(eventMap);

        PVUnifiedPushModule.emitEvent(this, "UnifiedPushMessage", instance, notificationString);
    }
}
