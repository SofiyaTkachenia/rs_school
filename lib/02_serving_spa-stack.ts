import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs'; // Импортируем Construct из constructs
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Duration, RemovalPolicy } from 'aws-cdk-lib';


class ServingSpaStack extends cdk.Stack {
  /**
   * @param {Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, '02-serving-spa', {
      versioned: true,
      removalPolicy: RemovalPolicy.DESTROY,
      websiteIndexDocument: 'index.html',
      objectOwnership: s3.ObjectOwnership.OBJECT_WRITER,
      blockPublicAccess: new s3.BlockPublicAccess({
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      }),
    });
    
    const policyStatement = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      principals: [new iam.AnyPrincipal()],
      actions: ['s3:GetObject'],
      resources: [`${bucket.bucketArn}/*`],
    });

    bucket.addToResourcePolicy(policyStatement);

    const bucketDeployment = new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset('/Users/sofiatkachenia/Documents/learning/rs_course/nodejs-aws-shop-react/dist')],
      destinationBucket: bucket,
      contentType: 'text/html', 
      contentLanguage: 'en',
      storageClass: s3deploy.StorageClass.INTELLIGENT_TIERING,
      serverSideEncryption: s3deploy.ServerSideEncryption.AES_256, 
      cacheControl: [
        s3deploy.CacheControl.setPublic(),
        s3deploy.CacheControl.maxAge(Duration.hours(1)),
      ],
      accessControl: s3.BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
    });
  }
}

export { ServingSpaStack }