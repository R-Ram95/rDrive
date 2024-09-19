import { Duration, Stack, StackProps } from "aws-cdk-lib";
import {
  UserPool,
  UserPoolEmail,
  AccountRecovery,
  Mfa,
} from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";

interface CognitoStackProps extends StackProps {
  appName: string;
}

export class CognitoStack extends Stack {
  constructor(scope: Construct, id: string, props?: CognitoStackProps) {
    super(scope, id, props);

    const userPool = new UserPool(this, `${props?.appName}-UserPool`, {
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
        emailSubject:
          "Welcome the r:Drive - cloud storage for your videos and images",
        emailBody:
          "Hello {username},\n\nThis is your invitation to join r:Drive! Your temporary password is {####}. Please use it to sign in and change your password - it expires in 7 days.\n\n Thank you,\nr:Drive developer <3",
      },
    });

    // create app client
    userPool.addClient(`${props?.appName}`, {
      userPoolClientName: `${props?.appName}-WebApplication`,
      idTokenValidity: Duration.minutes(30),
      accessTokenValidity: Duration.minutes(30),
      refreshTokenValidity: Duration.minutes(60),
      authFlows: {
        userPassword: true,
      },
      generateSecret: false,
    });
  }
}
