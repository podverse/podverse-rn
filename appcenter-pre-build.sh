#!/usr/bin/env bash

if [ "$PLATFORM" == "ios" ] ; then
    cd ./ios && rm -rf Pods && pod cache clean --all && pod install && cd ..
else
    npx jetify
fi

# Creates an .env from ENV variables for use with react-native-config
ENV_WHITELIST=${ENV_WHITELIST:-"^RN_"}
printf "Creating an .env file with the following whitelist:\n"
printf "%s\n" $ENV_WHITELIST
set | egrep -e $ENV_WHITELIST | sed 's/^RN_//g' > .env
printf "\n.env created with contents:\n\n"
cat .env

echo "temporary test build code"
        echo $STAGE_SSH_PRIVATE_KEY > touch ./podverse_stage_rsa
        ssh -i ./podverse_stage_rsa $STAGE_SSH_USERNAME@$STAGE_SSH_HOST

            echo "START: on the stage server"
            docker stop podverse_db_stage;
            docker rm podverse_db_stage;
            docker-compose -f ./podverse-ops/docker-compose.stage.yml up -d podverse_db;
            sleep 10;
            PGPASSWORD='$STAGE_PGPASSWORD' psql -h localhost -U postgres -d postgres -f ./podverse-ops/sample\ database/qa-database.sql;
            exit
            echo "END: on the stage server"

        echo "END: SSH into stage server and restore stage database before running tests"
echo "end temporary test code"
