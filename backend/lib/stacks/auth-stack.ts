import { Duration, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import {
  UserPool,
  UserPoolEmail,
  AccountRecovery,
  Mfa,
  UserPoolClient,
} from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";

interface AuthStackProps extends StackProps {
  appName: string;
}

export class AuthStack extends Stack {
  readonly userPool: UserPool;
  readonly appClient: UserPoolClient;

  constructor(scope: Construct, id: string, props: AuthStackProps) {
    super(scope, id, props);

    const formattedAppName =
      props.appName.slice(0, 1) + "/" + props.appName.slice(1);

    this.userPool = new UserPool(this, `${props.appName}-UserPool`, {
      userPoolName: `${props?.appName}-UserPool`,
      accountRecovery: AccountRecovery.EMAIL_ONLY,
      email: UserPoolEmail.withCognito(),
      mfa: Mfa.OPTIONAL,
      mfaSecondFactor: {
        sms: false,
        otp: true,
      },
      selfSignUpEnabled: false,
      signInAliases: {
        username: true,
        email: true,
      },
      userInvitation: {
        emailSubject: `Welcome to ${formattedAppName} - cloud storage for your videos and images`,
        emailBody: `Hello {username},\n\nThis is your invitation to join ${formattedAppName}! Your temporary password is {####}. Please use it to sign in and change your password - it expires in 7 days.\n\n Thank you,\nr:Drive developer <3`,
      },
      removalPolicy: RemovalPolicy.DESTROY, // DEV ONLY REMOVE IN PROD
    });

    // create app client
    this.appClient = this.userPool.addClient(`${props.appName}`, {
      userPoolClientName: `${props.appName}-WebAppClient`,
      idTokenValidity: Duration.minutes(20),
      accessTokenValidity: Duration.minutes(20),
      refreshTokenValidity: Duration.days(3),
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
      generateSecret: false,
    });
  }
}
