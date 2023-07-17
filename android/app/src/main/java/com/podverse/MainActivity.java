package com.podverse;

import static com.podverse.PVUnifiedPushModule.emitEvent;
import static com.podverse.PVUnifiedPushModule.popNotificationMap;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;

import android.os.Bundle;

import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.content.res.Configuration;

import org.json.JSONException;

import io.invertase.firebase.common.ReactNativeFirebaseEventEmitter;
import io.invertase.firebase.messaging.ReactNativeFirebaseMessagingReceiver;
import io.invertase.firebase.messaging.ReactNativeFirebaseMessagingSerializer;

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
        if (intent == null || intent.getExtras() == null) {
            super.onNewIntent(intent);
            return;
        }

        Bundle extras = intent.getExtras();

        int messageId = extras.getInt("pv_message_id", -1);
        if (messageId == -1) {
            super.onNewIntent(intent);
            return;
        }

        String instance = extras.getString("up_instance", null);
        if (instance == null) {
            super.onNewIntent(intent);
            return;
        }

        WritableMap notificationMap = null;

        try {
            notificationMap = popNotificationMap(messageId);
        } catch (JSONException e) {
            e.printStackTrace();
        }

        if (notificationMap != null) {
            WritableMap eventMap = new WritableNativeMap();
            eventMap.putMap("data", notificationMap);

            WritableNativeMap newInitialNotification = new WritableNativeMap();
            newInitialNotification.merge(eventMap);
            PVUnifiedPushModule.setInitialNotification(newInitialNotification);

            var UPMessage = new PVUnifiedPushMessage(
                    "UnifiedPushMessage",
                    instance,
                    eventMap
            );

            emitEvent(UPMessage);
        }
    }
}
