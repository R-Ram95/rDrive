import * as cdk from "aws-cdk-lib";
import { aws_apigatewayv2 as apigwv2 } from "aws-cdk-lib";
import { HttpMethod } from "aws-cdk-lib/aws-apigatewayv2";
import {
  HttpLambdaAuthorizer,
  HttpLambdaResponseType,
} from "aws-cdk-lib/aws-apigatewayv2-authorizers";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

export class APIStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const authorizationLambda = new NodejsFunction(this, "AuthLambda", {
      runtime: Runtime.NODEJS_20_X,
      handler: "handler",
      functionName: "auth-lambda",
      entry: path.join(__dirname, "../lambdas/authorizer", "index.ts"),
      environment: {
        CLERK_PUBLIC_KEY: process.env.CLERK_PUBLIC_KEY!,
      },
    });

    const lambdaAuthorizer = new HttpLambdaAuthorizer(
      "DefaultAuthorizer",
      authorizationLambda,
      {
        responseTypes: [HttpLambdaResponseType.SIMPLE],
      }
    );

    const testLambda = new NodejsFunction(this, "TestFunction", {
      runtime: Runtime.NODEJS_20_X,
      handler: "handler",
      functionName: "test-function",
      entry: path.join(__dirname, "../lambdas/endpoints/test", "index.ts"),
    });

    const httpApi = new apigwv2.HttpApi(this, "CloudStorageAPI", {
      defaultAuthorizer: lambdaAuthorizer,
    });

    const testLambdaIntegration = new HttpLambdaIntegration(
      "LambdaIntegration",
      testLambda
    );

    httpApi.addRoutes({
      path: "/test",
      methods: [HttpMethod.GET],
      integration: testLambdaIntegration,
    });
  }
}
