package com.podverse;

import android.content.ContentResolver;
import android.content.Context;
import android.database.Cursor;
import android.net.Uri;
import android.os.Environment;
import android.provider.MediaStore;
import android.provider.OpenableColumns;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

import java.io.File;

public class PVRealPathModule extends ReactContextBaseJavaModule {

    public PVRealPathModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "PVRealPathModule";
    }

    @ReactMethod
    public String getRealPathFromURI(String uriString) {
        Context context = getReactApplicationContext();
        Uri uri = Uri.parse(uriString);
        String realPath = null;
        String scheme = uri.getScheme();
        if (scheme != null) {
            if (scheme.equals("content")) {
                ContentResolver contentResolver = context.getContentResolver();
                Cursor cursor = contentResolver.query(uri, null, null, null, null);
                if (cursor != null) {
                    try {
                        if (cursor.moveToFirst()) {
                            int columnIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME);
                            String fileName = cursor.getString(columnIndex);
                            File file = new File(context.getFilesDir(), fileName);
                            realPath = file.getAbsolutePath();
                        }
                    } finally {
                        cursor.close();
                    }
                }
            } else if (scheme.equals("file")) {
                realPath = uri.getPath();
            }
        }
        return realPath;
    }
}
