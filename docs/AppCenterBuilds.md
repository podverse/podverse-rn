<!-- markdownlint-disable MD024 MD037 -->

# App Center Build Configurations

Environment variables and other build information for setting up CI with App Center.

## Android

### Branches

#### develop

##### Build app

**Project:** package.json
**Build Variant:** release
**Node.js version:** 10.x
**Build scripts:** Pre-build, Post-build
**Build frequency:** Build this branch on every push
**Build Android App Bundle:** Off
**Automatically increase version code:**: On
**Build number format:** Build ID
**Run unit tests:** Off
**Lint source code:** Off

##### Environment variables

| Key           | Value                                  |
| ------------- | -------------------------------------- |
| BS_KEY        | _secret_                               |
| BS_USERNAME   | _secret_                               |
| FB_API_KEY    | _secret_                               |
| PLATFORM      | android                                |
| RN_API_DOMAIN | <https://api.stage.podverse.fm/api/v1> |
| RN_WEB_DOMAIN | stage.podverse.fm                      |

##### Sign builds

**My Gradle settings signed automatically:** Off
**Keystore:** use dev keystore
**Keystore password:** _secret_
**Key alias:** _secret_
**Key password:** _secret_

#### master

##### Build app

**Project:** package.json
**Build Variant:** release
**Node.js version:** 10.x
**Build scripts:** Pre-build, Post-build
**Build frequency:** Build this branch on every push
**Build Android App Bundle:** Off
**Automatically increase version code:**: On
**Build number format:** Build ID
**Run unit tests:** Off
**Lint source code:** Off

##### Environment variables

| Key           | Value                                  |
| ------------- | -------------------------------------- |
| PLATFORM      | android                                |
| RN_API_DOMAIN | <https://api.stage.podverse.fm/api/v1> |
| RN_WEB_DOMAIN | stage.podverse.fm                      |

##### Sign builds

**My Gradle settings signed automatically:** Off
**Keystore:** use prod keystore
**Keystore password:** _secret_
**Key alias:** _secret_
**Key password:** _secret_

##### Distribute builds

Store > Beta

## iOS

### Branches

#### develop

##### Build app

**Project:** package.json
**Shared Scheme:** podverse
**Xcode version:** 11.4
**Node.js version:** 12.x
**Build scripts:** Pre-build, Post-build
**Build frequency:** Build this branch on every push
**Use legacy build system:** On
**Automatically increase version code:**: On
**Build number format:** Build ID
**Run unit tests:** Off

##### Environment variables

| Key           | Value                                  |
| ------------- | -------------------------------------- |
| BS_KEY        | _secret_                               |
| BS_USERNAME   | _secret_                               |
| FB_API_KEY    | _secret_                               |
| PLATFORM      | ios                                    |
| RN_API_DOMAIN | <https://api.stage.podverse.fm/api/v1> |
| RN_WEB_DOMAIN | stage.podverse.fm                      |

##### Sign builds

**Provisioning Profile:** distribution mobileprovision
**Certificate:** Certificates.p12

##### Distribute builds

Groups > Collaborators

#### master

##### Build app

**Project:** package.json
**Shared Scheme:** podverse
**Xcode version:** 11.1
**Node.js version:** 10.x
**Build scripts:** Pre-build, Post-build
**Build frequency:** Build this branch on every push
**Use legacy build system:** On
**Automatically increase version code:**: On
**Build number format:** Build ID
**Run unit tests:** Off

##### Environment variables

| Key           | Value                                  |
| ------------- | -------------------------------------- |
| PLATFORM      | ios                                    |
| RN_API_DOMAIN | <https://api.stage.podverse.fm/api/v1> |
| RN_WEB_DOMAIN | stage.podverse.fm                      |

##### Sign builds

**Provisioning Profile:** distribution mobileprovision
**Certificate:** Certificates.p12

##### Distribute builds

Store > App Store Connect Users
