import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs'; // Импортируем Construct из constructs
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
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
        blockPublicAcls: true,
        blockPublicPolicy: true,
        ignorePublicAcls: true,
        restrictPublicBuckets: true,
      }),
    });
    
    const cloudFrontOAI = new cloudfront.OriginAccessIdentity(this, 'OAI');

    bucket.addToResourcePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      principals: [new iam.CanonicalUserPrincipal(cloudFrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId)],
      actions: ['s3:GetObject'],
      resources: [`${bucket.bucketArn}/*`],
    }));

    const distribution = new cloudfront.Distribution(this, 'CloudFrontDistribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(bucket, {
          originAccessIdentity: cloudFrontOAI,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      defaultRootObject: 'index.html',
    });

    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset('/Users/sofiatkachenia/Documents/learning/rs_course/nodejs-aws-shop-react/dist')],
      destinationBucket: bucket,
      distribution: distribution,
      distributionPaths: ['/*'],
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