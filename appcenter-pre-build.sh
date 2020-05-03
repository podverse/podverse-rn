#!/usr/bin/env bash

npx jetify

cd ./ios && rm -rf Pods && pod cache clean --all && pod install && cd ..

#!/usr/bin/env bash
# Creates an .env from ENV variables for use with react-native-config
ENV_WHITELIST=${ENV_WHITELIST:-"^RN_"}
printf "Creating an .env file with the following whitelist:\n"
printf "%s\n" $ENV_WHITELIST
set | egrep -e $ENV_WHITELIST | sed 's/^RN_//g' > .env
printf "\n.env created with contents:\n\n"
cat .env

TO_ADDRESS="creon@podverse.fm"
SUBJECT="Email test"
BODY="Testing the app center email system\n\n"

echo -e ${BODY} | mail -s "$SUBJECT - Success!" ${TO_ADDRESS}