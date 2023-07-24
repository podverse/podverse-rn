package com.podverse;

import android.content.Context;
import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.WritableNativeMap;

import org.unifiedpush.android.connector.MessagingReceiver;

import java.util.Date;

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
        /*
            UnifiedPush notification flow

            1. handle receive message
                a. generate message id (least significant bits of current millisecond timestamp)
                b. insert message id into property of available messages, comma separated
                c. insert message into another property, with they message id as key
                d. in message id list, trim the # of elements to a reasonable number
            2. generate notification
                a. generate intent with message id added to extras
                b. trigger notification with intent
            3. handle intent while app is open
                a. get message id from intent extras
                b. get message from property by message id and remove it
                c. send message via event emitter, event type "UnifiedPushMessage"
            4. handle loading intent from current activity on application start
                a. see 3.a-3.b
                b. return message directly via promise in getInitialNotification
            5. in all cases, decrypt message payload with ECDH p256

            Expected decrypted JSON payload:
            {
                "body": "notification text",
                "title": "notification title",
                "podcastId": "Podverse podcast id",
                "episodeId": "Podverse episode id",
                "podcastTitle": "podcast title",
                "episodeTitle": "episode title",
                "notificationType": "new-episode|live",
                "timeSent": "iso 8601 format timestamp",
                "image": "podcast episode image"
            }
         */

        // Called when a new message is received.
        // The message contains the full POST body of the push message
        // Encrypted with aes128gcm webpush ecdh

        // Handle decryption and image downloading in a separate thread to avoid blocking the main process
        new Thread(() -> {
            Log.i("com.podverse.PVUnifiedPushMessageReceiver", "Received UP message");

            // if you want to disable encryption
            // String messageString = new String(message, StandardCharsets.UTF_8);
            String messageString = PVUnifiedPushEncryption.decryptNotification(context, message);

            if (messageString == null) {
                Log.i("com.podverse.PVUnifiedPushMessageReceiver", "Unable to decrypt UP message");
                return;
            }

            // This isn't a reliable timestamp, just the lowest 32 bits to get something "unique"
            int messageId = Math.abs((int) new Date().getTime());

            PVUnifiedPushModule.storeNotificationString(context, messageString, messageId);

            PVUnifiedPushModule.sendNotification(context, messageString, messageId, instance);
        }).start();
    }
}