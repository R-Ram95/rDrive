import * as cdk from "aws-cdk-lib";
import {
  aws_apigatewayv2 as apigwv2,
  aws_apigatewayv2_integrations as integrations,
} from "aws-cdk-lib";
import { HttpMethod } from "aws-cdk-lib/aws-apigatewayv2";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import * as path from "path";

export class APIStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Define Lambda function
    const myLambda = new NodejsFunction(this, "MyLambda", {
      runtime: Runtime.NODEJS_18_X,
      handler: "handler",
      functionName: "test-function",
      entry: path.join(__dirname, "../lambdas/authorizer", "index.ts"),
    });

    // Define API Gateway HTTP API
    const httpApi = new apigwv2.HttpApi(this, "image-api");

    // Define Lambda integration for the API Gateway
    const lambdaIntegration = new integrations.HttpLambdaIntegration(
      "LambdaIntegration",
      myLambda
    );

    // Add routes to the API Gateway
    httpApi.addRoutes({
      path: "/test",
      methods: [HttpMethod.GET],
      integration: lambdaIntegration,
    });

    // define lambdas
    // define api gateway
    // define auth
    // TODO => create new stack for DB??
  }
}
