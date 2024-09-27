import { Duration, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import {
  BlockPublicAccess,
  Bucket,
  BucketAccessControl,
  BucketEncryption,
  StorageClass,
} from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

interface StorageStackProps extends StackProps {
  appName: string;
}

export class StorageStack extends Stack {
  readonly assetBucket: Bucket;

  constructor(scope: Construct, id: string, props: StorageStackProps) {
    super(scope, id, props);

    const bucket = new Bucket(this, `${props.appName}-AssetBucket`, {
      bucketName: `${props.appName.toLowerCase()}-asset-bucket-${
        this.account
      }-${this.region}`,
      accessControl: BucketAccessControl.PRIVATE,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      versioned: true,
      removalPolicy: RemovalPolicy.DESTROY, // TODO RETAIN ON PROD
      lifecycleRules: [
        {
          noncurrentVersionExpiration: Duration.days(90),
          transitions: [
            {
              storageClass: StorageClass.GLACIER,
              transitionAfter: Duration.days(30),
            },
          ],
        },
      ],
    });

    this.assetBucket = bucket;
  }
}
