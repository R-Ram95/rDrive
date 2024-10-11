import * as cdk from "aws-cdk-lib";
import { RemovalPolicy, StackProps } from "aws-cdk-lib";
import { OriginAccessIdentity } from "aws-cdk-lib/aws-cloudfront";
import {
  BlockPublicAccess,
  Bucket,
  BucketAccessControl,
  ObjectOwnership,
} from "aws-cdk-lib/aws-s3/lib";
import { Construct } from "constructs";

interface StorageStackProps extends StackProps {
  appName: string;
}

export class StorageStack extends cdk.Stack {
  readonly assetBucket: Bucket;
  readonly accessIdentity: OriginAccessIdentity;

  constructor(scope: Construct, id: string, props?: StorageStackProps) {
    super(scope, id, props);

    const appName = props?.appName;

    const assetBucket = new Bucket(this, `${appName}-FEAssetStorage`, {
      versioned: true,
      bucketName: `${props?.appName.toLowerCase()}-fe-asset-bucket-${
        this.account
      }-${this.region}`,
      accessControl: BucketAccessControl.PRIVATE,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
      objectOwnership: ObjectOwnership.BUCKET_OWNER_ENFORCED,
    });

    const cloudFrontOAI = new OriginAccessIdentity(
      this,
      `${appName}-FEAssetOAI`
    );

    assetBucket.grantRead(cloudFrontOAI);

    this.assetBucket = assetBucket;
    this.accessIdentity = cloudFrontOAI;
  }
}
