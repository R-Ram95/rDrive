import { StackProps, Stack, CfnOutput } from "aws-cdk-lib";
import {
  HttpMethod,
  DomainName,
  HttpApi,
  EndpointType,
} from "aws-cdk-lib/aws-apigatewayv2";
import { HttpUserPoolAuthorizer } from "aws-cdk-lib/aws-apigatewayv2-authorizers";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import {
  Certificate,
  CertificateValidation,
} from "aws-cdk-lib/aws-certificatemanager";
import { UserPool, UserPoolClient } from "aws-cdk-lib/aws-cognito";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { ARecord, HostedZone, RecordTarget } from "aws-cdk-lib/aws-route53";
import { ApiGatewayv2DomainProperties } from "aws-cdk-lib/aws-route53-targets";
import { Construct } from "constructs";
import * as path from "path";

interface APIStackProps extends StackProps {
  appName: string;
  userPool: UserPool;
  appClient: UserPoolClient;
  rootDomain: string;
}

export class APIStack extends Stack {
  constructor(scope: Construct, id: string, props: APIStackProps) {
    super(scope, id, props);

    // Custom Domain
    const apiDomainName = `api.${props.appName}.${props.rootDomain}`;
    const hostedZone = HostedZone.fromLookup(this, "HostedZone", {
      domainName: props.rootDomain,
    });

    const domainCertificate = new Certificate(
      this,
      `${props.appName}-Certificate`,
      {
        domainName: apiDomainName,
        certificateName: `${props.appName}-Certificate`,
        validation: CertificateValidation.fromDns(hostedZone),
      }
    );

    // Custom domain for API
    const gatewayDomain = new DomainName(this, `${props.appName}-DomainName`, {
      domainName: apiDomainName,
      certificate: domainCertificate,
      endpointType: EndpointType.REGIONAL,
    });

    // route53 records
    new ARecord(this, `${props.appName}-AliasRecord`, {
      zone: hostedZone,
      recordName: apiDomainName,
      target: RecordTarget.fromAlias(
        new ApiGatewayv2DomainProperties(
          gatewayDomain.regionalDomainName,
          gatewayDomain.regionalHostedZoneId
        )
      ),
    });

    // Security
    const apiAuthorizer = new HttpUserPoolAuthorizer(
      `${props.appName}-APIAuthorizer`,
      props.userPool,
      { userPoolClients: [props.appClient] }
    );

    // API
    const httpApi = new HttpApi(this, `${props.appName}-API`, {
      defaultAuthorizer: apiAuthorizer,
    });

    new CfnOutput(this, "API Ednpoint", { value: httpApi.apiEndpoint });

    // Lambdas
    const testLambda = new NodejsFunction(this, `${props.appName}-TestLambda`, {
      runtime: Runtime.NODEJS_20_X,
      handler: "handler",
      functionName: `${props.appName}-test-function`,
      entry: path.join(__dirname, "../lambdas/endpoints/test", "index.ts"),
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
      authorizer: apiAuthorizer,
    });
  }
}
