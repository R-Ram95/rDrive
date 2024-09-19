#!/bin/bash
function errecho() {
  printf "%s\n" "$*" 1>&2
}

###############################################################################
# function cognito_create_user_tokens
#
# This function uses the aws cognito-idp cli commands to get id, access, and refresh tokens
# for a user based on their username, password, and the user pool client's id. This function is prompt
# based so you must enter a valid: username, password, and client id. 
#
# Returns:
#       [id_token, access_token, refresh_token]
#     And:
#       0 - If successful.
#       1 - If it fails.
###############################################################################
function cognito_create_user_tokens () {
    local user_name password client_id file_name response 

    function usage() {
        echo "function cognito_create_user_tokens"
        echo "Creates an id token, access token, and refresh token for the specified user"
    }

    echo -n "Enter your Cognito username: "
    read -e user_name

    if [[ -z "$user_name" ]]; then
        errecho "ERROR: You must provide a username."
        return 1
    fi

    echo -n "Enter your Cognito password: "
    read -e -s password
    echo 

    if [[ -z "$password" ]]; then
        errecho "ERROR: You must provide a password."
        return 1
    fi

    echo -n "Enter the Cognito client_id: "
    read -e client_id

    if [[ -z "$client_id" ]]; then
        errecho "ERROR: You must provide a cognito client_id."
        return 1
    fi
    
    echo -n "Enter the file name to save the tokens to: "
    read -e file_name

    if [[ -z "$file_name" ]]; then
        errecho "ERROR: No file_name specified."
        return 1
    fi

    response=$(aws cognito-idp initiate-auth \
        --client-id "$client_id" \
        --auth-flow "USER_PASSWORD_AUTH" \
        --auth-parameters USERNAME="$user_name",PASSWORD="$password" )

    if [[ $? -ne 0 ]]; then
        errecho "ERROR: Failed to authenticate user."
        return 1
    fi

    # If we must respond to challenge for creating a new password
    if [[ "$response" == *"NEW_PASSWORD_REQUIRED"* ]]; then

        local name
        echo "Password change required. Please enter a new password."

        echo -n "Enter your new password: "
        read -s new_password
        echo

        echo -n "Enter your name: "
        read -e name


        if [[ -z "$name" ]]; then
            jerrecho "ERROR: You must provide a name."
            jreturn 1
        fi
        
        response=$(aws cognito-idp respond-to-auth-challenge\
            --client-id "$client_id" \
            --challenge-name "NEW_PASSWORD_REQUIRED" \
            --session "$(echo $response | jq -r .Session)" \
            --challenge-responses "USERNAME=$user_name,NEW_PASSWORD=$new_password,name=$name")

        if [[ $? -ne 0 ]]; then
            errecho "ERROR: Failed to respond to password change challenge."
            return 1
        fi
    fi

    access_token=$(echo "$response" | jq -r '.AuthenticationResult.AccessToken')
    refresh_token=$(echo "$response" | jq -r '.AuthenticationResult.RefreshToken')
    id_token=$(echo "$response" | jq -r '.AuthenticationResult.IdToken')

    echo "Authentication successful."
    {
        echo "AccessToken: $access_token"
        echo
        echo "RefreshToken: $refresh_token"
        echo
        echo "IdToken: $id_token"
    } > "$file_name"
    echo "AccessToken: $access_token"
    echo
    echo "RefreshToken: $refresh_token"
    echo
    echo "IdToken: $id_token"

    return 0
}

cognito_create_user_tokens