export enum AccountingTransactionType {
  Sale = "SALE",
  Expense = "EXPENSE",
}

export enum AccountingVatType {
  Taxable = "TAXABLE",
  Zero = "ZERO",
  Exempt = "EXEMPT",
}

export enum AccountingTransactionStatus {
  Ready = "READY",
  Review = "REVIEW",
  Processed = "PROCESSED",
}

export enum AccountingVatMode {
  Split = "SPLIT",
  None = "NONE",
}

export enum AccountingLineSide {
  Debit = "DEBIT",
  Credit = "CREDIT",
}
