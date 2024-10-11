#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { StorageStack } from "../lib/storage-stack";
import * as dotenv from "dotenv";
dotenv.config();

const APP_NAME = process.env.APP_NAME!;

const app = new cdk.App();

const assetStorage = new StorageStack(app, `${APP_NAME}-FEAssetStorageStack`, {
  appName: APP_NAME,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
