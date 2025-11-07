export interface XeroTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  id_token?: string;
  scope?: string;
  token_type?: string;
}

export interface XeroConnection {
  id: string;
  tenantId: string;
  tenantType: string;
  createdDateUtc: string;
  updatedDateUtc: string;
}

export interface XeroInvoiceContact {
  ContactID: string;
  Name: string;
  EmailAddress?: string;
}

export interface XeroInvoice {
  InvoiceID: string;
  InvoiceNumber: string;
  Contact: XeroInvoiceContact;
  Status: 'DRAFT' | 'SUBMITTED' | 'AUTHORISED' | 'PAID' | 'VOIDED';
  DueDate: string;
  AmountDue: number;
  CurrencyCode: string;
  Total: number;
}

