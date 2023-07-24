package com.podverse;

import static org.unifiedpush.android.connector.UnifiedPush.getDistributor;
import static org.unifiedpush.android.connector.UnifiedPush.getDistributors;
import static org.unifiedpush.android.connector.UnifiedPush.registerApp;
import static org.unifiedpush.android.connector.UnifiedPush.saveDistributor;
import static org.unifiedpush.android.connector.UnifiedPush.unregisterApp;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;


import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.unifiedpush.android.connector.UnifiedPush;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Objects;

public class PVUnifiedPushModule extends ReactContextBaseJavaModule {

    private static final String NOTIFICATIONS_SHARED_PREF_NAME = "PVNotifications";
    private static final String PREF_KEY_NOTIFICATION_IDS = "notification_ids";
    private static final String PREF_KEY_NOTIFICATION_PREFIX = "pvn-";
    private static final int MAX_STORED_NOTIFICATIONS = 100;
    private static final String DELIMITER = ",";

    static ReadableMap initialNotification = null;
    private final HashMap<Integer, Boolean> initialNotificationMap = new HashMap<>();

    private static ReactApplicationContext applicationContext;

    PVUnifiedPushModule(ReactApplicationContext context) {
        super(context);
        applicationContext = context;
    }

    @Override
    public void initialize() {
        super.initialize();
    }

    @NonNull
    @Override
    public String getName() {
        return "PVUnifiedPushModule";
    }

    public static void setInitialNotification(ReadableMap readableMap) {
        initialNotification = readableMap;
    }

    public void markInitialNotificationAsRead(int messageId) {
        this.initialNotificationMap.put(messageId, true);
    }

    @ReactMethod
    public void registerExistingDistributor() {
        var context = this.getReactApplicationContext();

        // Check if a distributor is already registered
        var distributor = getDistributor(context);
        if (!distributor.isEmpty()) {
            Log.i("com.podverse.PVUnifiedPushModule", "current UP distributor: " + distributor);
            // Re-register in case something broke
            registerApp(
                    context,
                    "default",
                    // new ArrayList<String>() for unencrypted UTF-8, if you want to disable encryption
                    new ArrayList<String>(Collections.singleton(UnifiedPush.FEATURE_BYTES_MESSAGE)),
                    context.getPackageName()
            );

            Log.i("com.podverse.PVUnifiedPushModule", "UnifiedPush registered");
        }

        Log.i("com.podverse.PVUnifiedPushModule", "no UP distributor set");
    }

    @ReactMethod
    public void getCurrentDistributor(Promise promise) {
        var context = this.getReactApplicationContext();

        // Check if a distributor is already registered
        String distributor = getDistributor(context);
        if (!distributor.isEmpty()) {
            Log.i("com.podverse.PVUnifiedPushModule", "current UP distributor: " + distributor);
            promise.resolve(distributor);

            return;
        }

        Log.i("com.podverse.PVUnifiedPushModule", "no UP distributor set");

        promise.resolve(null);
    }

    @ReactMethod
    public void getUPDistributors(Promise promise) {
        var context = this.getReactApplicationContext();

        var distributors = getDistributors(context, new ArrayList<String>());
        Log.d("com.podverse.PVUnifiedPushModule", "num distributors: " + distributors.size());

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            distributors.forEach(distributor -> {
                Log.d("com.podverse.PVUnifiedPushModule", "available distributor: " + distributor);
            });
        }

        var writableArray = Arguments.makeNativeArray(distributors);

        promise.resolve(writableArray);
    }

    @ReactMethod
    public void setUPDistributor(String distributor, Promise promise) {
        var context = this.getReactApplicationContext();

        Log.i("com.podverse.PVUnifiedPushModule", "setting UP distributor " + distributor);
        saveDistributor(context, distributor);
        Log.i("com.podverse.PVUnifiedPushModule", "distributor saved");

        registerApp(
                context,
                "default",
                // new ArrayList<String>() for unencrypted UTF-8, if you want to disable encryption
                new ArrayList<String>(Collections.singleton(UnifiedPush.FEATURE_BYTES_MESSAGE)),
                context.getPackageName()
        );

        Log.i("com.podverse.PVUnifiedPushModule", "UnifiedPush registered");

        promise.resolve(true);
    }

    @ReactMethod
    public void unregister() {
        var context = this.getReactApplicationContext();

        Log.i("com.podverse.PVUnifiedPushModule", "unregistering UP distributor ");
        unregisterApp(context, "default");
    }

    @ReactMethod
    public void getUPPushKeys(Promise promise) {
        var context = this.getReactApplicationContext();

        var pvUnifiedPushEncryption = new PVUnifiedPushEncryption(context);

        var publicKey = pvUnifiedPushEncryption.getPublicKey();
        var authKey = pvUnifiedPushEncryption.getAuthKey();

        WritableMap writableMap = new WritableNativeMap();
        writableMap.putString("publicKey", publicKey);
        writableMap.putString("authKey", authKey);

        promise.resolve(writableMap);
    }

    @ReactMethod
    public void getInitialNotification(Promise promise) {

        // This is needed to avoid consuming the message_id from the intent twice
        // TODO: On startup, both initialNotification and the event "UnifiedPushMessage" are handled
        // Might consider rejecting here if not null
        if (initialNotification != null) {
            WritableMap writableMap = new WritableNativeMap();
            writableMap.putMap("data", initialNotification);

            promise.resolve(writableMap);

            initialNotification = null;

            return;
        }

        var context = this.getReactApplicationContext();

        var activity = this.getCurrentActivity();
        int messageId = 0;

        if (activity != null) {
            Intent intent = activity.getIntent();

            if (intent != null && intent.getExtras() != null) {
                messageId = intent.getExtras().getInt("pv_message_id", -1);
            }
        }

        if (messageId <= 0) {
            promise.reject("UP Notification Not available", "No UP notification ID is present on the current intent");
            return;
        }

        if (this.initialNotificationMap.get(messageId) != null) {
            promise.reject("UP Notification handled", "The UP notification with id " + messageId + " has already been handled");
            return;
        }

        try {
            WritableMap notificationMap = popNotificationMap(context, messageId);

            WritableMap writableMap = new WritableNativeMap();
            writableMap.putMap("data", notificationMap);

            promise.resolve(writableMap);
            markInitialNotificationAsRead(messageId);
        } catch (JSONException e) {
            Log.e("com.podverse.PVUnifiedPushModule", e.toString());
            promise.reject(e);
        }
    }

    private static WritableMap jsonToReact(JSONObject jsonObject) throws JSONException {
        WritableMap writableMap = Arguments.createMap();
        Iterator<String> iterator = jsonObject.keys();
        while (iterator.hasNext()) {
            String key = (String) iterator.next();
            Object value = jsonObject.get(key);
            if (value instanceof Float || value instanceof Double) {
                writableMap.putDouble(key, jsonObject.getDouble(key));
            } else if (value instanceof Number) {
                writableMap.putInt(key, jsonObject.getInt(key));
            } else if (value instanceof String) {
                writableMap.putString(key, jsonObject.getString(key));
            } else if (value instanceof JSONObject) {
                writableMap.putMap(key, jsonToReact(jsonObject.getJSONObject(key)));
            } else if (value instanceof JSONArray) {
                writableMap.putArray(key, jsonToReact(jsonObject.getJSONArray(key)));
            } else if (value == JSONObject.NULL) {
                writableMap.putNull(key);
            }
        }

        return writableMap;
    }

    private static WritableArray jsonToReact(JSONArray jsonArray) throws JSONException {
        WritableArray writableArray = Arguments.createArray();
        for (int i = 0; i < jsonArray.length(); i++) {
            Object value = jsonArray.get(i);
            if (value instanceof Float || value instanceof Double) {
                writableArray.pushDouble(jsonArray.getDouble(i));
            } else if (value instanceof Number) {
                writableArray.pushInt(jsonArray.getInt(i));
            } else if (value instanceof String) {
                writableArray.pushString(jsonArray.getString(i));
            } else if (value instanceof JSONObject) {
                writableArray.pushMap(jsonToReact(jsonArray.getJSONObject(i)));
            } else if (value instanceof JSONArray) {
                writableArray.pushArray(jsonToReact(jsonArray.getJSONArray(i)));
            } else if (value == JSONObject.NULL) {
                writableArray.pushNull();
            }
        }
        return writableArray;
    }

    public static void storeNotificationString(@NonNull Context context, @NonNull String payload, int messageId) {
        // Modified from react-native-firebase (Apache-2.0 License)
        // https://github.com/invertase/react-native-firebase/blob/8d7c28c49f7837e028c902f66276051287956a5a/packages/messaging/android/src/main/java/io/invertase/firebase/messaging/ReactNativeFirebaseMessagingStoreImpl.java#L25-L47

        // Message IDs are stored in one preference key, PREF_KEY_NOTIFICATION_IDS, oldest first separated by DELIMITER
        // Message payloads are saved to their own preference keys, PREF_KEY_NOTIFICATION_PREFIX + messageId
        // The number of stored notifications is limited and trimmed to MAX_STORED_NOTIFICATIONS total

        SharedPreferences preferences = context.getSharedPreferences(NOTIFICATIONS_SHARED_PREF_NAME, Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = preferences.edit();

        String messageIdKey = PREF_KEY_NOTIFICATION_PREFIX + messageId;
        Log.d("com.podverse.PVUnifiedPushModule", "Saving notification id " + messageIdKey);

        // Store current notification
        editor.putString(messageIdKey, payload);
        String notificationIds = preferences.getString(PREF_KEY_NOTIFICATION_IDS, "");
        notificationIds += messageId + DELIMITER;

        // Remove old notifications
        List<String> allNotificationList = new ArrayList<>(Arrays.asList(notificationIds.split(DELIMITER)));
        if (allNotificationList.size() > MAX_STORED_NOTIFICATIONS) {
            Log.d("com.podverse.PVUnifiedPushModule", "Trimming old notifications");
            String firstMessageId = allNotificationList.get(0);
            String firstMessageIdKey = PREF_KEY_NOTIFICATION_PREFIX + firstMessageId;
            editor.remove(firstMessageIdKey);
            Log.d("com.podverse.PVUnifiedPushModule", "Removed notification id " + firstMessageIdKey);
            notificationIds = notificationIds.replace(firstMessageId + DELIMITER, "");
        }
        editor.putString(PREF_KEY_NOTIFICATION_IDS, notificationIds);

        editor.apply();

        Log.d("com.podverse.PVUnifiedPushModule", "Saved notification id " + messageIdKey);
    }

    public static String popNotification(@NonNull Context context, int messageId) {
        SharedPreferences preferences = context.getSharedPreferences(NOTIFICATIONS_SHARED_PREF_NAME, Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = preferences.edit();

        String messageIdKey = PREF_KEY_NOTIFICATION_PREFIX + messageId;
        Log.d("com.podverse.PVUnifiedPushModule", "Consuming notification id " + messageIdKey);

        // Get and remove requested notification
        String notificationPayload = preferences.getString(messageIdKey, null);
        editor.remove(messageIdKey);

        String notificationIds = preferences.getString(PREF_KEY_NOTIFICATION_IDS, "");

        // Remove requested notificationId from list
        notificationIds = notificationIds.replace(messageIdKey + DELIMITER, "");
        editor.putString(PREF_KEY_NOTIFICATION_IDS, notificationIds);

        editor.apply();

        Log.d("com.podverse.PVUnifiedPushModule", "Consumed notification id " + messageIdKey);

        return notificationPayload;
    }

    public static JSONObject popNotificationJson(@NonNull Context context, int messageId) throws JSONException {
        return new JSONObject(popNotification(context, messageId));
    }

    public static WritableMap popNotificationMap(@NonNull Context context, int messageId) throws JSONException {
        return jsonToReact(popNotificationJson(context, messageId));
    }

    public static WritableMap popNotificationMap(int messageId) throws JSONException {
        return popNotificationMap(applicationContext, messageId);
    }

    public static void sendNotification(@NonNull Context context, @NonNull String payload, int messageId, @NonNull String instance) {
        JSONObject notification;

        try {
            notification = new JSONObject(payload);
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }

        String imageUrl;
        String messageTitle;
        String messageBody;
        String notificationType;

        try {
            imageUrl = notification.getString("image");
            messageTitle = notification.getString("title");
            messageBody = notification.getString("body");
            notificationType = notification.getString("notificationType");
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }

        Bitmap image = getBitmapfromUrl(imageUrl);

        Intent intent = new Intent(context, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
        intent.putExtra("pv_message_id", messageId);
        intent.putExtra("up_instance", instance);
        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0 /* Request code */, intent,
                PendingIntent.FLAG_ONE_SHOT | PendingIntent.FLAG_IMMUTABLE);
        Uri defaultSoundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);

        NotificationCompat.Builder notificationBuilder = new NotificationCompat.Builder(context, notificationType)
                .setLargeIcon(image) /* Notification icon image */
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentTitle(messageTitle)
                .setContentText(messageBody)
                .setStyle(new NotificationCompat.BigPictureStyle()
                        .bigPicture(image)) /* Notification with Image */
                .setAutoCancel(true)
                .setSound(defaultSoundUri)
                .setContentIntent(pendingIntent);

        NotificationManager notificationManager =
                (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);

        // Android 8 or higher requires a notification channel
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
        {
            NotificationChannel channel = new NotificationChannel(
                    notificationType,
                    notificationType.equals("live") ?
                            "Live Streams" :
                            "New Episodes",
                    notificationType.equals("live") ?
                            NotificationManager.IMPORTANCE_HIGH :
                            NotificationManager.IMPORTANCE_DEFAULT);
            notificationManager.createNotificationChannel(channel);
        }

        Log.d("com.podverse.PVUnifiedPushModule", "Sending notification of type " + notificationType + " with id " + messageId);

        notificationManager.notify(messageId, notificationBuilder.build());
    }

    private static Bitmap getBitmapfromUrl(String imageUrl) {
        try {
            Log.d("com.podverse.PVUnifiedPushModule", "Getting image url: " + imageUrl);
            URL url = new URL(imageUrl);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setDoInput(true);
            connection.connect();
            InputStream input = connection.getInputStream();
            return BitmapFactory.decodeStream(input);
        } catch (java.net.MalformedURLException e) {
            var message = e.getMessage();
            Log.e("com.podverse.PVUnifiedPushModule", Objects.requireNonNullElse(message, "Bad image URL"));

            return null;
        } catch (java.io.IOException e) {
            var message = e.getMessage();
            Log.e("com.podverse.PVUnifiedPushModule", Objects.requireNonNullElse(message, "Unknown IOException"));

            throw new RuntimeException(e);
        }
    }

    public static void emitEvent(@NonNull PVUnifiedPushMessage message) {
        var map = Arguments.makeNativeMap(Map.of(
                "instance", message.instance
        ));

        if (message.payload != null) {
            map.putMap("payload", message.payload);
        }

        applicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(message.eventName, map);
    }
}