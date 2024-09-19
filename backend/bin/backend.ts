#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { APIStack } from "../lib/stacks/api-stack";
import { CognitoStack } from "../lib/stacks/cognito-stack";

const APP_NAME = "rDrive";

const app = new cdk.App();
// new APIStack(app, "BackendStack", {});
new CognitoStack(app, "CognitoStack", { appName: APP_NAME });
