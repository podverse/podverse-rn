package com.podverse;

import android.app.PictureInPictureParams;
import android.os.Build;
import android.util.Rational;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class PipModule extends ReactContextBaseJavaModule {
    private Rational aspectRatio;
    PipModule(ReactApplicationContext context){
        super(context);
        aspectRatio = new Rational(3, 4);
    }

    @Override
    public String getName(){
        return "PipModule";
    }

    @ReactMethod
    public void EnterPipMode(){
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            PictureInPictureParams params = new PictureInPictureParams.Builder()
                .setAspectRatio(this.aspectRatio)
                .build();
            getCurrentActivity().enterPictureInPictureMode(params);
        }
    }
}
