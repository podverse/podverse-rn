# Contributing

We welcome any and all contributors to this project! Here you will find some instructions on how to helpus improve the Podverse mobile app either by resolving existing issues, or by submitting Pull Requests that you think would be valuable to the users.

---

## Process

We use a simple git flow process to submit code changes.

1. Clone the project directly on your machine

    ```
    git clone https://github.com/podverse/podverse-rn.git
    ```
2. Fetch the latest develop branch locally 

    ```
    git checkout develop
    ```

3. Branch off of `develop` 

    ```
    git checkout -b my_branch
    ```

4. Work on on your code changes

5. Commit your changes and push your branch

    ```
    git commit -am "Code changes"
    git push origin my_branch
    ```

6. Create a pull request on github from your branch into `develop`
    - Add a title and a small description of your changes and include the issue number (if applicable) i.e. 

        >Worked on fixing a broken link **Issue #800**
    - Assign one of 2 people as a reviewer
        - [@kreonjr](https://github.com/kreonjr)
        - [@mitchdowney](https://github.com/mitchdowney)

<br>

---
## Requirements

Podverse Mobile App uses the cross platform technology, [react-native](https://reactnative.dev/docs/0.65/getting-started) for development so there are a few pre-requisites required to be installed on your machine in order to be able to work on feature development. We suggest develpoment being done on a `mac` but if you are on a `windows` machine, you can still contribute by testing your code on an Android Emulator.

Here are the tools you will need installed on you machine to get your environment up an runnning for react-native development:

- [Node](https://nodejs.org/en/download/) v12 or higher **required**
- [Yarn](https://classic.yarnpkg.com/lang/en/docs/install/#mac-stable) v1.22.4 or higher **recommended**
- [Android Studio](https://developer.android.com/studio) to test the app on Android
- [Xcode](https://apps.apple.com/us/app/xcode/id497799835?mt=12) to test the app on iOS
- [Java Development Kit 8](https://openjdk.java.net/projects/jdk8/)

### **Mac**

We suggest using Homebrew to install these tools.<br>
You can find homebrew installation instructions [here](http://brew.sh/)

```
brew install node
brew install watchman
brew install --cask adoptopenjdk/openjdk/adoptopenjdk8
npm install --global yarn
sudo gem install cocoapods -v 1.10.2
```

### **Windows**

As long as you have Node and Android Studio installed properly, you won't need anything else on windows 

<br>

Here is a more detailed link on the environment setup process that might help explain things in a little more detail: <br> 
[React Native Environment Setup](https://reactnative.dev/docs/environment-setup)

---

## Running the app

Before running the app, you will need to create a file called `.env` at the top level of your project and copy all the contents of the file `.env.example` into it.
>There are more environment variables available that can be found in the `.env.all` file but are not necessary for initial development. 

<br>

Once you have that file created, install the node dependencies:

```
yarn install
```

And then run the app on a simulator:
#### ***iOS***

```
npx pod-install
npx react-native run-ios
```

#### ***android***

```
npx react-native run-android
```

<br>

### If you need help at any point or experiencing any issues, don't hesitate to join our [Podverse Discord](https://discord.gg/3JFEZd6CQx)! 
### Thanks for contributing to Podverse. Happy Coding!
