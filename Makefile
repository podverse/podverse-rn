

ifeq ($(UNAME),Darwin)
	SHELL := /opt/local/bin/bash
	OS_X  := true
else ifneq (,$(wildcard /etc/redhat-release))
	RHEL := true
else
	OS_DEB  := true
	SHELL := /bin/bash
endif

say_hello:
	@echo "Hello Podverse"

install_brew_check:
	@echo "Check for brew in PATH"
	which brew

install_brew_packages:
	@echo "Install brew packages"
	brew update
	brew install cocoapods node npm ruby watchman yarn

install_gem_cocoapods:
	@echo "Install user cocoapods"
	/opt/homebrew/opt/ruby/bin/gem install cocoapods --user-install

.env:
	@echo "Copy .env.all to .env"
	cp .env.all .env

.PHONY: install_prereq install_brew install_brew_packages install_gem_cocoapods
install_prereq: .env install_brew_check install_brew_packages install_gem_cocoapods

install_node_dep:
	yarn install
	npx pod-install
	yarn postinstall

.PHONY: install_pod
install_pod:
	pod install --repo-update

start_ios:
	npx react-native run-ios
	yarn dev

clean_kill_electron:
	@echo "Kill Electron"
	kill -9 $(pgrep Electron)

clean_kill_packager:
	@echo "Killing packager..."
	lsof -i :8081 | awk 'NR>1 {print $2}' | xargs kill -9

clean_kill_listeners:
	@echo "Killing listeners..."
	watchman watch-del-all

clean_android:
	echo "Cleaning android..."
	-./gradlew clean

clean_ios:
	@echo "Cleaning ios..."
	rm -rf ~/Library/Developer/Xcode/DerivedData
	rm -rf ./ios/build
	rm -rf ./ios/Pods
	rm -rf ./ios/Podfile.lock

clean_node_modules:
	@echo "Clearing node modules..."
	rm -rf node_modules/

clean_yarn_cache:
	@echo "Clearing yarn cache..."
	yarn cache clean

start_vscode:
	code .
	clear

.PHONY: refresh clean_kill_packager clean_kill_listeners clean_android clean_ios clean_node_modules install_node_dep
refresh: clean_kill_packager clean_kill_listeners clean_android clean_ios clean_node_modules install_node_dep

.PHONY: clean clean_kill_packager clean_kill_listeners clean_android clean_ios clean_node_modules clean_yarn_cache install_node_dep
clean: clean_kill_packager clean_kill_listeners clean_android clean_ios clean_node_modules install_node_dep

.PHONY: clean.sh clean_kill_electron clean_kill_packager clean_kill_listeners clean_android clean_ios clean_node_modules install_node_dep start_vscode
clean.sh: clean_kill_electron clean_kill_packager clean_kill_listeners clean_android clean_ios clean_node_modules install_node_dep start_code