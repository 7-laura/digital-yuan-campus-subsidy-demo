export type StudentType = "undergraduate" | "graduate" | "vocational";

export type StudentStatus = "active" | "inactive";

export type SubsidyType = "food" | "study" | "transport";

export type StudentSubsidyAccountStatus = "active" | "expired" | "refunded";

export type MerchantCategory = "canteen" | "bookstore" | "printing" | "beverage" | "entertainment";

export type MerchantWhitelistStatus = "approved" | "rejected";

export type TransactionResult = "success" | "failed" | "frozen";

export type SubsidyPlanStatus = "draft" | "active" | "closed";

export interface Student {
  studentId: string;
  name: string;
  walletId: string;
  studentType: StudentType;
  status: StudentStatus;
}

export interface SubsidyPlan {
  planId: string;
  planName: string;
  subsidyType: SubsidyType;
  totalBudget: number;
  issuerName: string;
  validFrom: string;
  validTo: string;
  status: SubsidyPlanStatus;
}

export interface StudentSubsidyAccount {
  accountId: string;
  studentId: string;
  planId: string;
  subsidyType: SubsidyType;
  initialAmount: number;
  remainingAmount: number;
  validFrom: string;
  validTo: string;
  status: StudentSubsidyAccountStatus;
}

export interface Merchant {
  merchantId: string;
  merchantName: string;
  category: MerchantCategory;
  walletId: string;
  whitelistStatus: MerchantWhitelistStatus;
}

export interface ContractRule {
  ruleId: string;
  planId: string;
  subsidyType: SubsidyType;
  allowedMerchantCategories: MerchantCategory[];
  singleTransactionLimit: number;
  dailyLimit: number;
  validFrom: string;
  validTo: string;
  refundPolicy: string;
}

export interface TransactionRecord {
  txId: string;
  studentId: string;
  merchantId: string;
  subsidyType: SubsidyType;
  amount: number;
  result: TransactionResult;
  reason: string;
  txTime: string;
}

export interface PaymentRequest {
  studentId: string;
  merchantId: string;
  subsidyType: SubsidyType;
  amount: number;
  txTime: string;
}

export interface PaymentResult {
  success: boolean;
  code: string;
  message: string;
  updatedAccount?: StudentSubsidyAccount;
  transaction: TransactionRecord;
}
