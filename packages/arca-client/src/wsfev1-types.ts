export interface WsfeAuth {
  token: string;
  sign: string;
  cuit: string;
}

export interface ArcaMessage {
  code: number;
  message: string;
}

export interface WsfeHealth {
  appServer: string;
  dbServer: string;
  authServer: string;
}

export interface WsfeLastAuthorizedRequest {
  pointOfSale: number;
  voucherType: number;
}

export interface WsfeLastAuthorized {
  pointOfSale: number;
  voucherType: number;
  voucherNumber: number;
  errors: ArcaMessage[];
  events: ArcaMessage[];
}

export interface WsfeVatDetail {
  id: number;
  taxableBase: number;
  amount: number;
}

export interface WsfeTaxDetail {
  id: number;
  description: string;
  taxableBase: number;
  rate: number;
  amount: number;
}

export interface WsfeAssociatedVoucher {
  voucherType: number;
  pointOfSale: number;
  voucherNumber: number;
  cuit?: string;
  date?: string;
}

export interface WsfeOptionalField {
  id: string;
  value: string;
}

export interface WsfeCaeDetailRequest {
  concept: 1 | 2 | 3;
  recipientDocumentType: number;
  recipientDocumentNumber: string;
  voucherFrom: number;
  voucherTo: number;
  voucherDate: string;
  totalAmount: number;
  nonTaxedAmount: number;
  netAmount: number;
  exemptAmount: number;
  vatAmount: number;
  taxAmount: number;
  serviceFrom?: string;
  serviceTo?: string;
  paymentDueDate?: string;
  currencyId: string;
  currencyRate: number;
  recipientVatConditionId?: number;
  vat?: WsfeVatDetail[];
  taxes?: WsfeTaxDetail[];
  associatedVouchers?: WsfeAssociatedVoucher[];
  optionalFields?: WsfeOptionalField[];
}

export interface WsfeCaeRequest {
  pointOfSale: number;
  voucherType: number;
  details: WsfeCaeDetailRequest[];
}

export interface WsfeCaeDetailResult {
  concept: number;
  recipientDocumentType: number;
  recipientDocumentNumber: string;
  voucherFrom: number;
  voucherTo: number;
  voucherDate: string;
  result: "A" | "R" | "P";
  cae?: string;
  caeExpirationDate?: string;
  observations: ArcaMessage[];
}

export interface WsfeCaeResult {
  pointOfSale: number;
  voucherType: number;
  result: "A" | "R" | "P";
  processedAt?: string;
  details: WsfeCaeDetailResult[];
  errors: ArcaMessage[];
  events: ArcaMessage[];
}

export interface WsfeVoucherQuery {
  pointOfSale: number;
  voucherType: number;
  voucherNumber: number;
}

export interface WsfeVoucherResult {
  found: boolean;
  detail?: WsfeCaeDetailResult;
  errors: ArcaMessage[];
  events: ArcaMessage[];
}

export interface WsfeParameterItem {
  id: string;
  description: string;
  validFrom?: string;
  validTo?: string;
}

export type WsfeParameterKind =
  | "voucher-types"
  | "document-types"
  | "vat-rates"
  | "currencies"
  | "concepts"
  | "recipient-vat-conditions";
