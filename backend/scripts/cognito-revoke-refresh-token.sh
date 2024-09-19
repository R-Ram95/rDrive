#!/bin/bash

function errecho() {
  printf "%s\n" "$*" 1>&2
}

###############################################################################
# function cognito_revoke_refresh_token
#
# This function uses the aws cognito-idp cli command to revoke a refresh token
# based on the provided client id and a tokens file.
# Format of file:
# RefreshToken: <YOUR_REFRESH_TOKEN>
#
# Usage: 
#       ./cognito_revoke_refresh_token.sh <client-id> <tokens-file>
#
# Parameters:
#       client-id - The Cognito User Pool client ID.
#       tokens-file - The file that contains the tokens (AccessToken, RefreshToken, IdToken).
#
# Returns:
#       0 - If successful.
#       1 - If it fails.
###############################################################################
function cognito_revoke_refresh_token () {
    local client_id tokens_file access_token

    function usage() {
        echo "Usage: $0 <client-id> <tokens-file>"
        echo "Revokes the access token from the tokens file for the specified client id."
    }

    # Check if client-id and tokens file are provided
    if [[ -z "$1" || -z "$2" ]]; then
        errecho "ERROR: Missing arguments."
        usage
        return 1
    fi

    client_id=$1
    tokens_file=$2

    # Check if tokens file exists
    if [[ ! -f "$tokens_file" ]]; then
        errecho "ERROR: Tokens file '$tokens_file' does not exist."
        return 1
    fi

    # Extract the AccessToken from the file
    refresh_token=$(grep "RefreshToken:" "$tokens_file" | awk '{print $2}')
    echo "access token: $access_token"
    
    if [[ -z "$refresh_token" ]]; then
        errecho "ERROR: Access token not found in the file."
        return 1
    fi

    # Revoke the access token
    echo "Revoking access token..."
    response=$(aws cognito-idp revoke-token \
        --token "$refresh_token" \
        --client-id "$client_id")

    if [[ $? -ne 0 ]]; then
        errecho "ERROR: Failed to revoke the access token."
        return 1
    fi

    echo "Access token revoked successfully."
    return 0
}

cognito_revoke_refresh_token "$1" "$2"
