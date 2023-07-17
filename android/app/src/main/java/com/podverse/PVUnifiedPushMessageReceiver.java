package com.podverse;

import android.content.Context;
import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.WritableNativeMap;

import org.unifiedpush.android.connector.MessagingReceiver;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.zip.CRC32;

public class PVUnifiedPushMessageReceiver extends MessagingReceiver {
    public PVUnifiedPushMessageReceiver() {
        super();
    }
    @Override
    public void onNewEndpoint(@NonNull Context context, @NonNull String endpoint, @NonNull String instance) {
        // Called when a new endpoint be used for sending push messages

        Log.d("com.podverse.PVUnifiedPushMessageReceiver",
                "received endpoint '" + endpoint + "' for instance '" + instance + "'");

        WritableNativeMap map = new WritableNativeMap();
        map.putString("endpoint", endpoint);

        var UPMessage = new PVUnifiedPushMessage(
                "UnifiedPushNewEndpoint",
                instance,
                map
        );

        PVUnifiedPushModule.emitEvent(UPMessage);
    }

    @Override
    public void onRegistrationFailed(@NonNull Context context, @NonNull String instance) {
        // called when the registration is not possible, eg. no network

        var UPMessage = new PVUnifiedPushMessage(
                "UnifiedPushRegistrationFailed",
                instance,
                null
        );

        PVUnifiedPushModule.emitEvent(UPMessage);
    }

    @Override
    public void onUnregistered(@NonNull Context context, @NonNull String instance) {
        // called when this application is unregistered from receiving push messages

        var UPMessage = new PVUnifiedPushMessage(
                "UnifiedPushUnregistered",
                instance,
                null
        );

        PVUnifiedPushModule.emitEvent(UPMessage);
    }

    @Override
    public void onMessage(@NonNull Context context, @NonNull byte[] message, @NonNull String instance) {
        // TODO: Handle foreground/background case
        // https://github.com/invertase/react-native-firebase/blob/main/packages/messaging/android/src/main/java/io/invertase/firebase/messaging/ReactNativeFirebaseMessagingReceiver.java#L39-L43

        /*
            1. handle receive message
                a. generate message id (timestamp + sha hash?/crc32?)
                b. insert message id into property, comma separated
                c. insert message into another property, comma separated (indices match first property)
                d. in both properties, trim the # of elements to a reasonable number (10, 100)
                e. store message in-memory in hashmap by message id, for efficiency if app is open
            2. generate notification
                a. generate intent with message id added to extras
                b. trigger notification with intent
            3. handle intent while app is open
                a. use react native ActivityEventListener?
                    * https://github.com/invertase/react-native-firebase/blob/main/packages/messaging/android/src/main/java/io/invertase/firebase/messaging/ReactNativeFirebaseMessagingModule.java#L259
                b. get message id from intent extras
                c. attempt to get message from hashmap in memory
                d. fall back to getting message from property by message id and removing it
                e. send message via event emitter
            4. handle loading intent from current activity on application start
                a. see 3.b-3.d
                b. return message directly via promise
            5. in all cases, decrypt message payload with EDCH p256
         */

        // Called when a new message is received. The message contains the full POST body of the push message

        Log.i("com.podverse.PVUnifiedPushMessageReceiver", "Received UP message");

        String messageString = new String(message, StandardCharsets.UTF_8);
        var notificationCRC = new CRC32();
        notificationCRC.update(message);

        // This isn't a reliable timestamp, just the lowest 32 bits to get something "unique"
        int messageId = (int) new Date().getTime();

        PVUnifiedPushModule.storeNotificationString(context, messageString, messageId);
        PVUnifiedPushModule.sendNotification(context, messageString, messageId, instance);

        /*Log.d("com.podverse.PVUnifiedPushMessageReceiver",
                "received message from instance '" + instance + "': " + messageString);

        var UPMessage = new PVUnifiedPushMessage(
                "UnifiedPushMessage",
                instance,
                messageString
        );

        PVUnifiedPushModule.emitEvent(UPMessage);*/
    }
}