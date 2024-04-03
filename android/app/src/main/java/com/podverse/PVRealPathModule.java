package com.podverse;

import android.content.Context;
import android.database.Cursor;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Log;


import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

import android.content.ContentUris;
import android.net.Uri;

import com.facebook.react.bridge.WritableNativeMap;

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
    public String getRealPathFromURI(String fileName) {
        WritableMap mediaItem = _listMediaDir("", true, MediaStore.Audio.Media.DISPLAY_NAME + " = '" + fileName + "'");
        return mediaItem.getString("realPath");
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

    private WritableMap _listMediaDir(String relativeDir, boolean subdir, String selection) {
        WritableMap results = new WritableNativeMap();
        Context reactContext = getReactApplicationContext();

        try {
            Cursor query = reactContext.getContentResolver().query(
                    MediaStore.Audio.Media.EXTERNAL_CONTENT_URI,
                    new String[]{
                            MediaStore.Audio.Media._ID,
                            MediaStore.Audio.Media.RELATIVE_PATH,
                            MediaStore.Audio.Media.DISPLAY_NAME,
                            MediaStore.Audio.Media.DATA
                    },
                    selection, null, null);
    
            if (query != null) {
                int idColumn = query.getColumnIndexOrThrow(MediaStore.Audio.Media._ID);
                int pathColumn = query.getColumnIndexOrThrow(MediaStore.Audio.Media.RELATIVE_PATH);
                int nameColumn = query.getColumnIndexOrThrow(MediaStore.Audio.Media.DISPLAY_NAME);
                int dataColumn = query.getColumnIndexOrThrow(MediaStore.Audio.Media.DATA);

                while (query.moveToNext()) {
                    String mediaPath = query.getString(pathColumn);
                    if (mediaPath.equals(relativeDir) || (subdir && mediaPath.startsWith(relativeDir))) {
                        WritableMap mediaItem = Arguments.createMap();
                        mediaItem.putString("URI", "content:/" + ContentUris.appendId(
                                new Uri.Builder().path(MediaStore.Audio.Media.EXTERNAL_CONTENT_URI.getPath()),
                                query.getLong(idColumn)).toString());
                        mediaItem.putString("relativePath", mediaPath);
                        mediaItem.putString("fileName", query.getString(nameColumn));
                        mediaItem.putString("realPath", query.getString(dataColumn));
                        results = mediaItem;
                    }
                }
                query.close();
            }
        } catch (Exception e) {
            Log.e("PVRealPathModule", e.toString());
        }

        return results;
    }
}
