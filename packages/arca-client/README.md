# `@maitre/arca-client`

Cliente TypeScript reutilizable para los servicios de facturación electrónica de ARCA.

El paquete no depende de Fastify, Supabase ni del dominio de Maitre. HTTP, credenciales, firma
CMS, reloj, caché y diagnóstico se inyectan mediante interfaces, por lo que puede utilizarse en
otro backend Node.js o extraerse a un repositorio independiente.

## Capacidades actuales

- Ambientes oficiales de homologación y producción.
- WSAA:
  - generación del Login Ticket Request para `wsfe`;
  - CMS/PKCS#7 encapsulado y codificado en Base64;
  - adquisición, caché y renovación anticipada de Token/Sign.
- WSFEv1:
  - `FEDummy`;
  - `FECompUltimoAutorizado`;
  - `FECAESolicitar`;
  - `FECompConsultar`;
  - tipos de comprobante, documento, IVA, moneda, concepto y condición IVA del receptor.
- SOAP faults, errores y timeouts normalizados.
- Los timeouts de autorización se marcan como resultado potencialmente ambiguo.

## Ejemplo

```ts
import {
  FetchArcaHttpTransport,
  ForgeCmsSigner,
  MemoryWsaaTicketCache,
  WsaaClient,
  Wsfev1Client,
} from "@maitre/arca-client";

const transport = new FetchArcaHttpTransport({ timeoutMs: 15_000 });
const wsaa = new WsaaClient({
  environment: "homologation",
  representedCuit: "30XXXXXXXXX",
  transport,
  signer: new ForgeCmsSigner(),
  cache: new MemoryWsaaTicketCache(),
  credentials: {
    async getCredentials() {
      return {
        representedCuit: "30XXXXXXXXX",
        certificatePem: process.env.ARCA_CERTIFICATE_PEM!,
        privateKeyPem: process.env.ARCA_PRIVATE_KEY_PEM!,
      };
    },
  },
});

const wsfe = new Wsfev1Client({
  environment: "homologation",
  representedCuit: "30XXXXXXXXX",
  transport,
  tickets: wsaa,
});

const health = await wsfe.health();
const last = await wsfe.getLastAuthorized({ pointOfSale: 1, voucherType: 6 });
```

El caché incluido es en memoria y sirve para un proceso único. Un despliegue con varias réplicas
debe proporcionar un `WsaaTicketCache` distribuido y cifrado.

## Seguridad

- Nunca registrar certificado, clave privada, Token, Sign ni SOAP completo con datos personales.
- Inyectar credenciales desde un secret manager.
- No compartir certificados entre homologación y producción.
- No reintentar `FECAESolicitar` a ciegas después de un timeout: consultar primero el comprobante.
- La coordinación de numeración y el estado de intentos pertenecen a la aplicación integradora,
  no a este cliente de protocolo.
