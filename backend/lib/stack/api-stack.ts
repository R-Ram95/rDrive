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

    // Define Lambda function
    const authorizationLambda = new NodejsFunction(this, "auth-lambda", {
      runtime: Runtime.NODEJS_20_X,
      handler: "handler",
      functionName: "auth-lambda",
      entry: path.join(__dirname, "../lambdas/authorizer", "index.ts"),
      environment: {
        CLERK_PUBLIC_KEY: process.env.CLERK_PUBLIC_KEY!,
      },
    });

    const testLambda = new NodejsFunction(this, "TestFunction", {
      runtime: Runtime.NODEJS_20_X,
      handler: "handler",
      functionName: "test-function",
      entry: path.join(__dirname, "../lambdas/operational/test", "index.ts"),
    });

    const tokenAuthorizer = new HttpLambdaAuthorizer(
      "DefaultAuthorizer",
      authorizationLambda,
      {
        responseTypes: [HttpLambdaResponseType.SIMPLE],
      }
    );

    // Define API Gateway HTTP API
    const httpApi = new apigwv2.HttpApi(this, "cloud-storage-api", {
      defaultAuthorizer: tokenAuthorizer,
    });

    // Define Lambda integration for the API Gateway
    const testLambdaIntegration = new HttpLambdaIntegration(
      "LambdaIntegration",
      testLambda
    );

    // // Add routes to the API Gateway
    httpApi.addRoutes({
      path: "/test",
      methods: [HttpMethod.GET],
      integration: testLambdaIntegration,
    });

    // define lambdas
    // define api gateway
    // define auth
    // TODO => create new stack for DB??
  }
}
