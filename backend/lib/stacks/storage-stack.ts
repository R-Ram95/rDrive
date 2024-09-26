import { Duration, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import {
  AttributeType,
  Billing,
  TableEncryptionV2,
  TableV2,
} from "aws-cdk-lib/aws-dynamodb";
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
  readonly metaDataTable: TableV2;
  readonly assetBucket: Bucket;

  constructor(scope: Construct, id: string, props: StorageStackProps) {
    super(scope, id, props);

    const table = new TableV2(this, `${props.appName}-MetaDataTable`, {
      tableName: `${props.appName}-MetaDataTable`,
      partitionKey: { name: "folderPath", type: AttributeType.STRING },
      sortKey: { name: "fileName", type: AttributeType.STRING },
      localSecondaryIndexes: [
        {
          indexName: "fileType",
          sortKey: { name: "fileType", type: AttributeType.STRING },
        },
      ],
      removalPolicy: RemovalPolicy.DESTROY, // TODO RETAIN ON PROD
      encryption: TableEncryptionV2.dynamoOwnedKey(),
      billing: Billing.onDemand({
        maxReadRequestUnits: 10,
        maxWriteRequestUnits: 10,
      }),
    });

    this.metaDataTable = table;

    const bucket = new Bucket(this, `${props.appName}-AssetBucket`, {
      bucketName: `${props.appName}-asset-bucket-${this.account}-${this.region}`,
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
