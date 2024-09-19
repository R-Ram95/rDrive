import { StackProps, Stack, aws_apigatewayv2 as apigwv2 } from "aws-cdk-lib";
import { HttpMethod } from "aws-cdk-lib/aws-apigatewayv2";
import { HttpUserPoolAuthorizer } from "aws-cdk-lib/aws-apigatewayv2-authorizers";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { UserPool, UserPoolClient } from "aws-cdk-lib/aws-cognito";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import * as path from "path";

interface APIStackProps extends StackProps {
  appName: string;
  userPool: UserPool;
  appClient: UserPoolClient;
}

export class APIStack extends Stack {
  constructor(scope: Construct, id: string, props: APIStackProps) {
    super(scope, id, props);

    const testLambda = new NodejsFunction(this, `${props.appName}-TestLambda`, {
      runtime: Runtime.NODEJS_20_X,
      handler: "handler",
      functionName: `${props.appName}-test-function`,
      entry: path.join(__dirname, "../lambdas/endpoints/test", "index.ts"),
    });

    const apiAuthorizer = new HttpUserPoolAuthorizer(
      `${props.appName}-APIAuthorizer`,
      props.userPool,
      { userPoolClients: [props.appClient] }
    );

    const httpApi = new apigwv2.HttpApi(this, `${props.appName}-API`, {
      defaultAuthorizer: apiAuthorizer,
    });

    const testLambdaIntegration = new HttpLambdaIntegration(
      "TestLambdaIntegration",
      testLambda
    );

    httpApi.addRoutes({
      path: "/test",
      methods: [HttpMethod.GET],
      integration: testLambdaIntegration,
      authorizer: apiAuthorizer,
    });
  }
}
