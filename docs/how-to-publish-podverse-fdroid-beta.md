# How to publish Podverse for F-Droid Beta

## File import

Get file in the right spot with the correct owernship and permissions.

Repo Dir: `/home/pv-f-droid/fdroid/repo`

Owner: `pv-f-droid`

filename: `com.podverse.fdroid_${versionCode}.apk`

### As root

1) Get the APK from the master-beta pipeline.
2) Change the name of the APK to be `com.podverse.fdroid_${versionCode}.apk`
3) Connect to `jammy-pv00` via ssh.
4) Upload the APK to `jammy-pv00` in the `/home/pv-f-droid/fdroid/repo`.
5) Check the hash is correct for the file on the server: `md5sum ${filename}`
6) Move the file to the beta fdroid repo:

```
mv com.podverse.fdroid_${versionCode}.apk /home/pv-f-droid/fdroid/repo/
```

7) Change the `pv-f-droid` user ownership of the APK: 

```
chown pv-f-droid /home/pv-f-droid/fdroid/repo/com.podverse.fdroid_${versionCode}.apk
```

## F-Droid Server

### Update the metadata

Update the `description.txt` file to contain the latest release notes at: `/home/pv-f-droid/fdroid/metadata/com.podverse.fdroid/en-US/description.txt`

### pv-f-droid user

Change user to `pv-f-droid`: `su -l pv-f-droid`.

#### F-Droid server update

From the `/home/pv-f-droid/fdroid` directory, run `fdroid update`

```
cd /home/pv-f-droid/fdroid
fdroid update
```

#### F-Droid server deploy

From the `/home/pv-f-droid/fdroid` directory, run `fdroid deploy`

```
cd /home/pv-f-droid/fdroid
fdroid deploy
```