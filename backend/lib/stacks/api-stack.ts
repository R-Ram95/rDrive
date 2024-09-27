import { StackProps, Stack } from "aws-cdk-lib";
import { HttpMethod, DomainName, HttpApi } from "aws-cdk-lib/aws-apigatewayv2";
import { HttpUserPoolAuthorizer } from "aws-cdk-lib/aws-apigatewayv2-authorizers";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { UserPool, UserPoolClient } from "aws-cdk-lib/aws-cognito";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import * as path from "path";

interface APIStackProps extends StackProps {
  appName: string;
  userPool: UserPool;
  appClient: UserPoolClient;
  gatewayDomain: DomainName;
  assetStorage: Bucket;
}

export class APIStack extends Stack {
  constructor(scope: Construct, id: string, props: APIStackProps) {
    super(scope, id, props);

    // Security
    const apiAuthorizer = new HttpUserPoolAuthorizer(
      `${props.appName}-APIAuthorizer`,
      props.userPool,
      { userPoolClients: [props.appClient] }
    );

    // API
    const httpApi = new HttpApi(this, `${props.appName}-API`, {
      defaultAuthorizer: apiAuthorizer,
      defaultDomainMapping: {
        domainName: props.gatewayDomain,
      },
    });

    // Lambdas
    const testLambda = new NodejsFunction(this, `${props.appName}-TestLambda`, {
      runtime: Runtime.NODEJS_20_X,
      handler: "handler",
      functionName: `${props.appName}-test-function`,
      entry: path.join(__dirname, "../lambdas/endpoints/test", "index.ts"),
    });

    const imageUploadLambda = new NodejsFunction(
      this,
      `${props.appName}-ImageUploadLambda`,
      {
        runtime: Runtime.NODEJS_20_X,
        handler: "handler",
        functionName: `${props.appName}-image-upload-function`,
        entry: path.join(
          __dirname,
          "../lambdas/image/image-upload",
          "index.ts"
        ),
        environment: {
          BUCKET_NAME: props.assetStorage.bucketName,
          REGION: this.region,
        },
      }
    );

    props.assetStorage.grantReadWrite(imageUploadLambda);

    const imageUploadIntegration = new HttpLambdaIntegration(
      "SingleImageUploadIntegration",
      imageUploadLambda
    );

    httpApi.addRoutes({
      path: "/image",
      methods: [HttpMethod.POST],
      integration: imageUploadIntegration,
    });

    // Registering routes
    const testLambdaIntegration = new HttpLambdaIntegration(
      "TestLambdaIntegration",
      testLambda
    );

    httpApi.addRoutes({
      path: "/test",
      methods: [HttpMethod.GET],
      integration: testLambdaIntegration,
    });
  }
}
