import { StackProps, Stack } from "aws-cdk-lib";
import {
  HttpMethod,
  DomainName,
  HttpApi,
  CorsHttpMethod,
} from "aws-cdk-lib/aws-apigatewayv2";
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

enum PERMISION {
  READ = "READ",
  WRITE = "WRITE",
  READ_WRITE = "READ-WRITE",
}

const lambdasDir = path.join(__dirname, "../lambdas");
const apiConfig = [
  {
    functionName: "FileUpload",
    endpoint: `/files`,
    entryFile: path.join(lambdasDir, "files", "file-upload.ts"),
    methods: [HttpMethod.POST],
    permission: PERMISION.READ_WRITE,
  },
  {
    functionName: "FileDownload",
    endpoint: `/files`,
    entryFile: path.join(lambdasDir, "files", "file-download.ts"),
    methods: [HttpMethod.GET],
    permission: PERMISION.READ,
  },
  {
    functionName: "BatchFileUpload",
    endpoint: `/files/batch`,
    entryFile: path.join(lambdasDir, "files", "file-upload-batch.ts"),
    methods: [HttpMethod.POST],
    permission: PERMISION.READ_WRITE,
  },
  {
    functionName: "BatchFileDownload",
    endpoint: `/files/batch`,
    entryFile: path.join(lambdasDir, "files", "file-download-batch.ts"),
    methods: [HttpMethod.GET],
    permission: PERMISION.READ,
  },
  {
    functionName: "CreateFolder",
    endpoint: `/directory`,
    entryFile: path.join(lambdasDir, "directory", "create-directory.ts"),
    methods: [HttpMethod.POST],
    permission: PERMISION.READ_WRITE,
  },
  {
    functionName: "ListDirectory",
    endpoint: `/directory`,
    entryFile: path.join(lambdasDir, "directory", "list-directory.ts"),
    methods: [HttpMethod.GET],
    permission: PERMISION.READ,
  },
];

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
      defaultDomainMapping: {
        domainName: props.gatewayDomain,
      },
      corsPreflight: {
        allowOrigins: ["http://localhost:3000"],
        allowMethods: [
          CorsHttpMethod.GET,
          CorsHttpMethod.PUT,
          CorsHttpMethod.POST,
          CorsHttpMethod.DELETE,
          CorsHttpMethod.OPTIONS,
        ],
        allowHeaders: ["Authorization", "Origin"],
      },
    });

    apiConfig.forEach(
      ({ functionName, endpoint, entryFile, methods, permission }) => {
        // create lambda
        const lambda = new NodejsFunction(
          this,
          `${props.appName}-${functionName}`,
          {
            runtime: Runtime.NODEJS_20_X,
            handler: "handler",
            functionName: `${props.appName}-${functionName}`,
            entry: entryFile,
            environment: {
              BUCKET_NAME: props.assetStorage.bucketName,
              REGION: this.region,
            },
          }
        );
        // grant permissions
        permission === PERMISION.READ_WRITE &&
          props.assetStorage.grantReadWrite(lambda);
        permission === PERMISION.READ && props.assetStorage.grantRead(lambda);
        permission === PERMISION.WRITE && props.assetStorage.grantWrite(lambda);

        // create integration
        const integration = new HttpLambdaIntegration(
          `${functionName}Integration`,
          lambda
        );
        // add route
        httpApi.addRoutes({
          path: endpoint,
          methods,
          integration,
          authorizer: apiAuthorizer,
        });
      }
    );

    // CORS
    const lambda = new NodejsFunction(this, `${props.appName}-Cors`, {
      runtime: Runtime.NODEJS_20_X,
      handler: "handler",
      functionName: `${props.appName}-Cors`,
      entry: path.join(__dirname, "../lambdas/cors/index.ts"),
    });

    const integration = new HttpLambdaIntegration(`CorsIntegration`, lambda);

    httpApi.addRoutes({
      path: "/{proxy+}",
      methods: [HttpMethod.OPTIONS],
      integration,
    });
  }
}
