import * as cdk from "aws-cdk-lib";
import { RemovalPolicy, StackProps } from "aws-cdk-lib";
import {
  Certificate,
  CertificateValidation,
} from "aws-cdk-lib/aws-certificatemanager";
import { Distribution, ViewerProtocolPolicy } from "aws-cdk-lib/aws-cloudfront";
import { S3BucketOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import { ARecord, HostedZone, RecordTarget } from "aws-cdk-lib/aws-route53";
import { CloudFrontTarget } from "aws-cdk-lib/aws-route53-targets";
import {
  BlockPublicAccess,
  Bucket,
  BucketAccessControl,
  ObjectOwnership,
} from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";

interface WebAppStackProps extends StackProps {
  appName: string;
  rootDomain: string;
}

export class WebAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: WebAppStackProps) {
    super(scope, id, props);

    const { appName, rootDomain } = props ?? {};

    if (!appName || !rootDomain) return;

    const assetBucket = new Bucket(this, `${appName}-WebAppBucket`, {
      versioned: true,
      bucketName: `${props?.appName.toLowerCase()}-web-app-bucket-${
        this.account
      }-${this.region}`,
      accessControl: BucketAccessControl.PRIVATE,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
      objectOwnership: ObjectOwnership.BUCKET_OWNER_ENFORCED,
    });

    const hostedZone = HostedZone.fromLookup(this, `HostedZone`, {
      domainName: rootDomain ?? "",
    });

    const certificate = new Certificate(this, `${appName}-WebAppCertificate`, {
      domainName: `${appName.toLowerCase()}.${rootDomain}`,
      subjectAlternativeNames: [`www.${appName.toLowerCase()}.${rootDomain}`],
      validation: CertificateValidation.fromDns(hostedZone),
    });

    const distribution = new Distribution(
      this,
      `${appName}-WebAppDistribution`,
      {
        defaultBehavior: {
          origin: S3BucketOrigin.withOriginAccessControl(assetBucket),
          viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
        defaultRootObject: "index.html",
        certificate: certificate,
        domainNames: [
          `${appName.toLowerCase()}.${rootDomain}`,
          `www.${appName.toLowerCase()}.${rootDomain}`,
        ],
      }
    );

    new ARecord(this, `${appName}-WebAppAliasRecord`, {
      zone: hostedZone,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
      recordName: `${appName.toLowerCase()}.${rootDomain}`,
    });

    new ARecord(this, `${appName}-WebAppWWWAliasRecord`, {
      zone: hostedZone,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
      recordName: `www.${appName.toLowerCase()}.${rootDomain}`,
    });

    new BucketDeployment(this, "WebAppBucketDeployment", {
      destinationBucket: assetBucket,
      sources: [Source.asset("../dist")],
    });
  }
}
