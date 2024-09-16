#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { APIStack } from "../lib/stack/api-stack";

const app = new cdk.App();
new APIStack(app, "BackendStack", {});
