package com.podverse;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.modules.storage.ReactDatabaseSupplier;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import java.util.Map;
import java.io.File;
import java.util.HashMap;

public class PVAsyncStorageModule extends ReactContextBaseJavaModule {
    private ReactDatabaseSupplier mReactDatabaseSupplier;

    PVAsyncStorageModule(ReactApplicationContext context) {
       super(context);
       mReactDatabaseSupplier = ReactDatabaseSupplier.getInstance(context);
   }

   @Override
    public String getName() {
        return "PVAsyncStorage";
    }

    @ReactMethod
    public void getUsedStorageSize(Promise promise) {
        File f = new File(mReactDatabaseSupplier.get().getPath());
        long dbSize = f.length();
        WritableMap resultData = new WritableNativeMap();
        resultData.putInt("size", (int)dbSize);
        promise.resolve(resultData);
    }
}