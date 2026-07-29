import forge from "node-forge";
import { ArcaError } from "./errors.js";
import type { CmsSigner } from "./ports.js";

export class ForgeCmsSigner implements CmsSigner {
  async sign(input: {
    content: string;
    certificatePem: string;
    privateKeyPem: string;
  }): Promise<string> {
    try {
      const certificate = forge.pki.certificateFromPem(input.certificatePem);
      const privateKey = forge.pki.privateKeyFromPem(input.privateKeyPem);
      const sha256Oid = forge.pki.oids.sha256;
      const contentTypeOid = forge.pki.oids.contentType;
      const dataOid = forge.pki.oids.data;
      const messageDigestOid = forge.pki.oids.messageDigest;
      if (!sha256Oid || !contentTypeOid || !dataOid || !messageDigestOid) {
        throw new Error("Required CMS object identifiers are unavailable");
      }
      const message = forge.pkcs7.createSignedData();
      message.content = forge.util.createBuffer(input.content, "utf8");
      message.addCertificate(certificate);
      message.addSigner({
        key: privateKey,
        certificate,
        digestAlgorithm: sha256Oid,
        authenticatedAttributes: [
          {
            type: contentTypeOid,
            value: dataOid,
          },
          {
            type: messageDigestOid,
          },
        ],
      });
      // WSAA requires an encapsulated CMS (`openssl cms -sign -nodetach`).
      message.sign();
      return forge.util.encode64(
        forge.asn1.toDer(message.toAsn1()).getBytes(),
        64,
      );
    } catch (cause) {
      throw new ArcaError("Unable to sign the WSAA login request", {
        kind: "AUTHENTICATION",
        cause,
      });
    }
  }
}
