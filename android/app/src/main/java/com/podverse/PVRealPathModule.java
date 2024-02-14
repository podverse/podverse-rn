package com.podverse;

import android.content.ContentResolver;
import android.content.Context;
import android.database.Cursor;
import android.net.Uri;
import java.net.URLDecoder;
import android.os.Environment;
import android.provider.MediaStore;
import android.provider.OpenableColumns;
import android.util.Log;
import java.io.UnsupportedEncodingException;
import android.os.Environment;

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
        String decodedUrl = "";
        try {
            decodedUrl = URLDecoder.decode(uriString, "UTF-8");
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }
        Uri uri = Uri.parse(decodedUrl);
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

    @ReactMethod
    public String findPodcastWithIdInExternalStorage(String podcastIdWithExtension) {
        String path = Environment.getExternalStorageDirectory().getPath();
        Log.d("findPodcastWithIdInExternalStorage path", path);
        File directory = new File(path);
        String fileName = podcastIdWithExtension;
        String filePath = searchFile(directory, fileName);
        
        if (filePath != null) {
            Log.d("FileSearch", "File found: " + filePath);
            return filePath;
        } else {
            Log.d("FileSearch", "File not found");
            return null;
        }
    }

    public String searchFile(File dir, String fileName) {
        File[] list = dir.listFiles();
        if (list != null) {
            for (File file : list) {
                if (file.isDirectory()) {
                    String found = searchFile(file, fileName);
                    if (found != null) return found;
                } else {
                    if (fileName.equalsIgnoreCase(file.getName())) {
                        return file.getAbsolutePath();
                    }
                }
            }
        }
        return null; // File not found
    }
}
