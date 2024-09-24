import { StackProps, Stack } from "aws-cdk-lib";
import { DomainName, EndpointType } from "aws-cdk-lib/aws-apigatewayv2";
import {
  Certificate,
  CertificateValidation,
} from "aws-cdk-lib/aws-certificatemanager";
import { ARecord, HostedZone, RecordTarget } from "aws-cdk-lib/aws-route53";
import { ApiGatewayv2DomainProperties } from "aws-cdk-lib/aws-route53-targets";
import { Construct } from "constructs";
import * as path from "path";

interface DnsStackProps extends StackProps {
  appName: string;
  rootDomain: string;
}

export class DnsStack extends Stack {
  readonly domainName: DomainName;

  constructor(scope: Construct, id: string, props: DnsStackProps) {
    super(scope, id, props);

    // Custom Domain
    const apiDomainName = `api.${props.appName.toLowerCase()}.${
      props.rootDomain
    }`;

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

    const domainName = new DomainName(this, `${props.appName}-DomainName`, {
      domainName: apiDomainName,
      certificate: domainCertificate,
      endpointType: EndpointType.REGIONAL,
    });

    new ARecord(this, `${props.appName}-AliasRecord`, {
      zone: hostedZone,
      recordName: apiDomainName,
      target: RecordTarget.fromAlias(
        new ApiGatewayv2DomainProperties(
          domainName.regionalDomainName,
          domainName.regionalHostedZoneId
        )
      ),
    });

    this.domainName = domainName;
  }
}
