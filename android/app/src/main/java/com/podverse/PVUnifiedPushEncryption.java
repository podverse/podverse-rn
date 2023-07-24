package com.podverse;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Base64;
import android.util.Log;

import com.facebook.react.bridge.ReactContext;
import com.google.crypto.tink.HybridDecrypt;
import com.google.crypto.tink.apps.webpush.WebPushHybridDecrypt;

import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.InvalidAlgorithmParameterException;
import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.NoSuchAlgorithmException;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.SecureRandom;
import java.security.interfaces.ECPrivateKey;
import java.security.interfaces.ECPublicKey;
import java.security.spec.ECGenParameterSpec;
import java.security.spec.ECPoint;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Arrays;

public class PVUnifiedPushEncryption {
    private static final String NOTIFICATION_ENCRYPTION_SHARED_PREF_NAME = "PVNotificationKeys";

    private final KeyPairGenerator kpg;
    private final PublicKey publicKey;
    private final byte[] authKey;
    private final String encodedPublicKey;
    private final String pushPublicKey;
    private final String encodedAuthKey;
    private final String pushPrivateKey;
    PrivateKey privateKey;


    public PVUnifiedPushEncryption(ReactContext context) {
        try {
            kpg = KeyPairGenerator.getInstance("EC");
            ECGenParameterSpec spec = new ECGenParameterSpec("secp256r1");
            kpg.initialize(spec);
            KeyPair keyPair = kpg.generateKeyPair();
            publicKey = keyPair.getPublic();
            privateKey = keyPair.getPrivate();
            encodedPublicKey = Base64.encodeToString(serializeRawPublicKey(publicKey), Base64.URL_SAFE | Base64.NO_WRAP | Base64.NO_PADDING);

            authKey = new byte[16];

            SecureRandom secureRandom = new SecureRandom();
            secureRandom.nextBytes(authKey);

            pushPrivateKey = Base64.encodeToString(privateKey.getEncoded(), Base64.URL_SAFE | Base64.NO_WRAP | Base64.NO_PADDING);
            pushPublicKey = Base64.encodeToString(publicKey.getEncoded(), Base64.URL_SAFE | Base64.NO_WRAP | Base64.NO_PADDING);
            encodedAuthKey = Base64.encodeToString(authKey, Base64.URL_SAFE | Base64.NO_WRAP | Base64.NO_PADDING);

            SharedPreferences preferences = context.getSharedPreferences(NOTIFICATION_ENCRYPTION_SHARED_PREF_NAME, Context.MODE_PRIVATE);
            SharedPreferences.Editor editor = preferences.edit();

            editor.putString("push_private_key", pushPrivateKey);
            editor.putString("push_public_key", pushPublicKey);
            editor.putString("encoded_auth_key", encodedAuthKey);

            editor.apply();
        } catch (NoSuchAlgorithmException | InvalidAlgorithmParameterException e) {
            e.printStackTrace();
            throw new RuntimeException(e);
        }
    }

    public String getPublicKey() {
        return this.encodedPublicKey;
    }

    public String getAuthKey() {
        return this.encodedAuthKey;
    }

    private static byte[] serializeRawPublicKey(PublicKey key) {
        ECPoint point = ((ECPublicKey) key).getW();
        byte[] x = point.getAffineX().toByteArray();
        byte[] y = point.getAffineY().toByteArray();
        if (x.length > 32)
            x = Arrays.copyOfRange(x, x.length - 32, x.length);
        if (y.length > 32)
            y = Arrays.copyOfRange(y, y.length - 32, y.length);
        byte[] result = new byte[65];
        result[0] = 4;
        System.arraycopy(x, 0, result, 1 + (32 - x.length), x.length);
        System.arraycopy(y, 0, result, result.length - y.length, y.length);
        return result;
    }

    public static String decryptNotification(Context context, byte[] messageEncrypted) {
        SharedPreferences preferences = context.getSharedPreferences(NOTIFICATION_ENCRYPTION_SHARED_PREF_NAME, Context.MODE_PRIVATE);
        String pushPrivateKey = preferences.getString("push_private_key", null);
        String pushPublicKey = preferences.getString("push_public_key", null);
        Log.d("com.podverse.PVUnifiedPushEncryption", "pushPublicKey: " + pushPublicKey);
        String encodedAuthKey = preferences.getString("encoded_auth_key", null);
        Log.d("com.podverse.PVUnifiedPushEncryption", "encodedAuthKey: " + encodedAuthKey);

        PrivateKey privateKey;
        PublicKey publicKey;
        byte[] authKey;

        try {
            KeyFactory kf = KeyFactory.getInstance("EC");
            privateKey = kf.generatePrivate(new PKCS8EncodedKeySpec(Base64.decode(pushPrivateKey, Base64.URL_SAFE)));
            publicKey = kf.generatePublic(new X509EncodedKeySpec(Base64.decode(pushPublicKey, Base64.URL_SAFE)));
            authKey = Base64.decode(encodedAuthKey, Base64.URL_SAFE);
        } catch (NoSuchAlgorithmException | InvalidKeySpecException e) {
            e.printStackTrace();
            return null;
        }

        if (privateKey == null) {
            Log.d("com.podverse.PVUnifiedPushEncryption", "privateKey is null");
            return null;
        }

        if (publicKey == null) {
            Log.d("com.podverse.PVUnifiedPushEncryption", "publicKey is null");
            return null;
        }

        if (authKey == null) {
            Log.d("com.podverse.PVUnifiedPushEncryption", "authKey is null");
            return null;
        }


        try {
            HybridDecrypt hybridDecrypt = new WebPushHybridDecrypt.Builder()
                    .withAuthSecret(authKey)
                    .withRecipientPublicKey((ECPublicKey) publicKey)
                    .withRecipientPrivateKey((ECPrivateKey) privateKey)
                    .build();

            return new String(hybridDecrypt.decrypt(messageEncrypted, null), StandardCharsets.UTF_8);
        } catch (GeneralSecurityException e) {
            e.printStackTrace();
            throw new RuntimeException(e);
        }
    }


}
