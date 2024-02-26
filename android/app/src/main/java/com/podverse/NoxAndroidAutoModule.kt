package com.podverse

import android.content.ContentUris
import android.net.Uri
import android.provider.MediaStore
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableNativeArray


class NoxAndroidAutoModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {
    override fun getName() = "NoxAndroidAutoModule"

    private fun _listMediaDir(relativeDir: String, subdir: Boolean, selection: String? = null): WritableArray {
        val results: WritableArray = WritableNativeArray()
        try {
            val query = reactApplicationContext.contentResolver.query(
                MediaStore.Audio.Media.EXTERNAL_CONTENT_URI,
                arrayOf(
                    MediaStore.Audio.Media._ID,
                    MediaStore.Audio.Media.RELATIVE_PATH,
                    MediaStore.Audio.Media.DISPLAY_NAME,
                    MediaStore.Audio.Media.DATA
                ), selection,null, null)
            query?.use { cursor ->
                val idColumn = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media._ID)
                val pathColumn = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.RELATIVE_PATH)
                val nameColumn = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.DISPLAY_NAME)
                val dataColumn = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.DATA)
                while (cursor.moveToNext()) {
                    val mediaPath = cursor.getString(pathColumn)
                    if (mediaPath == relativeDir || (subdir && mediaPath.startsWith(relativeDir))) {
                        val mediaItem = Arguments.createMap()
                        mediaItem.putString("URI",
                            "content:/" + ContentUris.appendId(
                                Uri.Builder().path(MediaStore.Audio.Media.EXTERNAL_CONTENT_URI.path),
                                cursor.getLong(idColumn)).build().toString())
                        mediaItem.putString("relativePath",mediaPath)
                        mediaItem.putString("fileName", cursor.getString(nameColumn))
                        mediaItem.putString("realPath", cursor.getString(dataColumn))
                        results.pushMap(mediaItem)
                    }
                }
            }
        } catch (e: Exception) {
            Log.e("NoxFileUtil", e.toString())
        }
        return results
    }

    @ReactMethod fun listMediaDir(relativeDir: String, subdir: Boolean, callback: Promise) {
        callback.resolve(_listMediaDir(relativeDir, subdir))
    }

    @ReactMethod fun listMediaFileByFName(filename: String, callback: Promise) {
        callback.resolve(_listMediaDir("", true,
            "${MediaStore.Audio.Media.DISPLAY_NAME} IN ('$filename')"))
    }

    @ReactMethod fun listMediaFileByID(id: String, callback: Promise) {
        callback.resolve(_listMediaDir("", true,
            "${MediaStore.Audio.Media._ID} = $id"))
    }
}
