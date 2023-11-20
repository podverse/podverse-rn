# How to publish Podverse for F-Droid Beta

1) Get file in the right spot with the correct permissions.
    1) Get the APK from the master-beta pipeline.
    2) Change the name of the APK to be `com.podverse.fdroid_${versionCode}.apk`
    3) Connect to `jammy-pv00` via ssh.
    4) Upload the APK to `jammy-pv00` in the `/home/pv-f-droid/fdroid/repo`.
    5) Check the hash is correct for the file on the server: `md5sum ${filename}`
    6) Move the file to the beta fdroid repo: `mv com.podverse.fdroid_1700281421.apk /home/pv-f-droid/fdroid/repo/`
    7) Give the `pv-f-droid` user ownership of the APK: `chown pv-f-droid /home/pv-f-droid/fdroid/repo/com.podverse.fdroid_1700281421.apk`
2) Update the metadata
    1) Update the `description.txt` file to contain the latest release notes at: `/home/pv-f-droid/fdroid/metadata/com.podverse.fdroid/en-US/description.txt`
3) Change user to `pv-f-droid`: `su -l pv-f-droid`.
4) From the `/home/pv-f-droid/fdroid` directory, run `fdroid update`
5) From the `/home/pv-f-droid/fdroid` directory, run `fdroid deploy`
