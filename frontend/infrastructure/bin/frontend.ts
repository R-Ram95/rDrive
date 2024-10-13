#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import * as dotenv from "dotenv";
import { WebAppStack } from "../lib/web-app-stack";
dotenv.config();

const APP_NAME = process.env.APP_NAME!;
const ROOT_DOMAIN = process.env.ROOT_DOMAIN!;

const app = new cdk.App();

new WebAppStack(app, `${APP_NAME}-WebStack`, {
  appName: APP_NAME,
  rootDomain: ROOT_DOMAIN,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

app.synth();
