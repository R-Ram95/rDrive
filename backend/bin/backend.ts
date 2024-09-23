#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { APIStack } from "../lib/stacks/api-stack";
import { AuthStack } from "../lib/stacks/auth-stack";

const APP_NAME = "rDrive";
const ROOT_DOMAIN = "rohineshram.com";

const app = new cdk.App();
const authStack = new AuthStack(app, `${APP_NAME}-AuthStack`, {
  appName: APP_NAME,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

const apiStack = new APIStack(app, `${APP_NAME}-BackendStack`, {
  appName: APP_NAME,
  userPool: authStack.userPool,
  appClient: authStack.appClient,
  rootDomain: ROOT_DOMAIN,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

app.synth();
