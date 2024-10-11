#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { APIStack } from "../lib/stacks/api-stack";
import { AuthStack } from "../lib/stacks/auth-stack";
import { DnsStack } from "../lib/stacks/dns-stack";
import { StorageStack } from "../lib/stacks/storage-stack";
import * as dotenv from "dotenv";
import { Tags } from "aws-cdk-lib";
dotenv.config();

const APP_NAME = process.env.APP_NAME!;
const ROOT_DOMAIN = process.env.ROOT_DOMAIN!;

const app = new cdk.App();

const authStack = new AuthStack(app, `${APP_NAME}-AuthStack`, {
  appName: APP_NAME,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

const dnsStack = new DnsStack(app, `${APP_NAME}-DnsStack`, {
  appName: APP_NAME,
  rootDomain: ROOT_DOMAIN,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  tags: {
    AppName: APP_NAME,
  },
});

const storageStack = new StorageStack(app, `${APP_NAME}-StorageStack`, {
  appName: APP_NAME,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  tags: {
    AppName: APP_NAME,
  },
});

const apiStack = new APIStack(app, `${APP_NAME}-ApiStack`, {
  appName: APP_NAME,
  userPool: authStack.userPool,
  appClient: authStack.appClient,
  gatewayDomain: dnsStack.domainName,
  assetStorage: storageStack.assetBucket,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  tags: {
    AppName: APP_NAME,
  },
});

Tags.of(authStack).add("AppName", APP_NAME);
Tags.of(dnsStack).add("AppName", APP_NAME);
Tags.of(storageStack).add("AppName", APP_NAME);
Tags.of(apiStack).add("AppName", APP_NAME);

app.synth();
