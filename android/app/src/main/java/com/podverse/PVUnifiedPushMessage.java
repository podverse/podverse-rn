package com.podverse;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.WritableMap;

public class PVUnifiedPushMessage {
    public @NonNull String eventName;
    public @NonNull String instance;
    public @Nullable WritableMap payload;

    public PVUnifiedPushMessage(@NonNull String eventName, @NonNull String instance, @Nullable WritableMap payload) {
        this.eventName = eventName;
        this.instance = instance;
        this.payload = payload;
    }
}
