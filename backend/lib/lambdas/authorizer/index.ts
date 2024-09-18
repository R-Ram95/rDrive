import { APIGatewayRequestAuthorizerEventV2 } from "aws-lambda";
import * as jwt from "jsonwebtoken";

const clerkPublicKey = process.env.CLERK_PUBLIC_KEY;
interface CustomJwtPayload {
  sub: string; // user id from Clerk
  metaData: {
    firstName: string;
    lastName: string;
  };
}

export async function handler(event: APIGatewayRequestAuthorizerEventV2) {
  if (!event?.headers?.Authorization) {
    return generateResponse(false);
  }

  const token = event.headers.Authorization.split(" ")[1];
  let claims;

  try {
    claims = jwt.verify(token, clerkPublicKey) as CustomJwtPayload;
  } catch (e) {
    return generateResponse(false);
  }

  if (
    claims.metaData.firstName === "Rohinesh" &&
    claims.metaData.lastName === "Ram"
  ) {
    return generateResponse(true, {
      sub: claims.sub,
      metaData: claims.metaData,
    });
  }

  return generateResponse(false);
}

function generateResponse(authorized: boolean, metaData?: CustomJwtPayload) {
  return {
    isAuthorized: authorized,
    context: {
      metaData: metaData,
    },
  };
}
