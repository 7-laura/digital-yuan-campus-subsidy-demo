import type {
  ContractRule,
  Merchant,
  PaymentRequest,
  PaymentResult,
  Student,
  StudentSubsidyAccount,
  SubsidyPlan,
  TransactionRecord
} from "../types/subsidy";

export const mockStudents: Student[] = [
  {
    studentId: "student-zhangsan",
    name: "张三",
    studentNo: "20260001",
    walletId: "wallet-student-zhangsan",
    studentType: "undergraduate",
    status: "active"
  },
  {
    studentId: "student-lisi",
    name: "李四",
    studentNo: "20260002",
    walletId: "wallet-student-lisi",
    studentType: "undergraduate",
    status: "active"
  },
  {
    studentId: "student-wangwu",
    name: "王五",
    studentNo: "20260003",
    walletId: "wallet-student-wangwu",
    studentType: "undergraduate",
    status: "active"
  }
];

export const mockSubsidyPlans: SubsidyPlan[] = [
  {
    planId: "plan-food-2026-spring",
    planName: "2026 春季餐饮专项补助",
    subsidyType: "food",
    totalBudget: 500,
    issuerName: "学生资助管理中心",
    validFrom: "2026-03-01T00:00:00+08:00",
    validTo: "2026-07-31T23:59:59+08:00",
    status: "active"
  },
  {
    planId: "plan-study-2026-spring",
    planName: "2026 春季教材专项补助",
    subsidyType: "study",
    totalBudget: 100,
    issuerName: "学生资助管理中心",
    validFrom: "2026-03-01T00:00:00+08:00",
    validTo: "2026-07-31T23:59:59+08:00",
    status: "active"
  }
];

export const mockStudentSubsidyAccounts: StudentSubsidyAccount[] = [
  {
    accountId: "account-zhangsan-food",
    studentId: "student-zhangsan",
    planId: "plan-food-2026-spring",
    subsidyType: "food",
    initialAmount: 300,
    remainingAmount: 300,
    validFrom: "2026-03-01T00:00:00+08:00",
    validTo: "2026-07-31T23:59:59+08:00",
    status: "active"
  },
  {
    accountId: "account-zhangsan-study",
    studentId: "student-zhangsan",
    planId: "plan-study-2026-spring",
    subsidyType: "study",
    initialAmount: 100,
    remainingAmount: 100,
    validFrom: "2026-03-01T00:00:00+08:00",
    validTo: "2026-07-31T23:59:59+08:00",
    status: "active"
  },
  {
    accountId: "account-lisi-food",
    studentId: "student-lisi",
    planId: "plan-food-2026-spring",
    subsidyType: "food",
    initialAmount: 200,
    remainingAmount: 200,
    validFrom: "2026-03-01T00:00:00+08:00",
    validTo: "2026-07-31T23:59:59+08:00",
    status: "active"
  }
];

export const mockMerchants: Merchant[] = [
  {
    merchantId: "merchant-canteen-1",
    merchantName: "一食堂",
    category: "canteen",
    walletId: "wallet-merchant-canteen-1",
    whitelistStatus: "approved"
  },
  {
    merchantId: "merchant-bookstore",
    merchantName: "校内书店",
    category: "bookstore",
    walletId: "wallet-merchant-bookstore",
    whitelistStatus: "approved"
  },
  {
    merchantId: "merchant-printing",
    merchantName: "打印店",
    category: "printing",
    walletId: "wallet-merchant-printing",
    whitelistStatus: "approved"
  },
  {
    merchantId: "merchant-beverage",
    merchantName: "奶茶店",
    category: "beverage",
    walletId: "wallet-merchant-beverage",
    whitelistStatus: "rejected"
  },
  {
    merchantId: "merchant-entertainment",
    merchantName: "网吧",
    category: "entertainment",
    walletId: "wallet-merchant-entertainment",
    whitelistStatus: "rejected"
  }
];

export const mockContractRules: ContractRule[] = [
  {
    ruleId: "rule-food-2026-spring",
    planId: "plan-food-2026-spring",
    subsidyType: "food",
    allowedMerchantCategories: ["canteen"],
    singleTransactionLimit: 30,
    dailyLimit: 30,
    validFrom: "2026-03-01T00:00:00+08:00",
    validTo: "2026-07-31T23:59:59+08:00",
    refundPolicy: "到期未使用金额自动退回学校资金池"
  },
  {
    ruleId: "rule-study-2026-spring",
    planId: "plan-study-2026-spring",
    subsidyType: "study",
    allowedMerchantCategories: ["bookstore", "printing"],
    singleTransactionLimit: 100,
    dailyLimit: 100,
    validFrom: "2026-03-01T00:00:00+08:00",
    validTo: "2026-07-31T23:59:59+08:00",
    refundPolicy: "到期未使用金额自动退回学校资金池"
  }
];

export const mockPaymentRequests: PaymentRequest[] = [
  {
    studentId: "student-zhangsan",
    merchantId: "merchant-canteen-1",
    subsidyType: "food",
    amount: 12,
    txTime: "2026-07-08T12:00:00+08:00"
  },
  {
    studentId: "student-zhangsan",
    merchantId: "merchant-beverage",
    subsidyType: "food",
    amount: 20,
    txTime: "2026-07-08T13:00:00+08:00"
  },
  {
    studentId: "student-zhangsan",
    merchantId: "merchant-canteen-1",
    subsidyType: "food",
    amount: 50,
    txTime: "2026-07-08T18:00:00+08:00"
  },
  {
    studentId: "student-wangwu",
    merchantId: "merchant-canteen-1",
    subsidyType: "food",
    amount: 10,
    txTime: "2026-07-08T12:30:00+08:00"
  }
];

export const mockTransactionRecords: TransactionRecord[] = [
  {
    txId: "tx-success-food-canteen",
    studentId: "student-zhangsan",
    merchantId: "merchant-canteen-1",
    subsidyType: "food",
    amount: 12,
    result: "success",
    reason: "餐饮补贴可在白名单食堂使用，金额未超过单笔限额",
    txTime: "2026-07-08T12:00:00+08:00"
  },
  {
    txId: "tx-failed-merchant-category",
    studentId: "student-zhangsan",
    merchantId: "merchant-beverage",
    subsidyType: "food",
    amount: 20,
    result: "failed",
    reason: "奶茶店不属于餐饮补贴允许的商户类别",
    txTime: "2026-07-08T13:00:00+08:00"
  },
  {
    txId: "tx-failed-single-limit",
    studentId: "student-zhangsan",
    merchantId: "merchant-canteen-1",
    subsidyType: "food",
    amount: 50,
    result: "failed",
    reason: "支付金额超过餐饮补贴 30 元单笔限额",
    txTime: "2026-07-08T18:00:00+08:00"
  },
  {
    txId: "tx-failed-no-account",
    studentId: "student-wangwu",
    merchantId: "merchant-canteen-1",
    subsidyType: "food",
    amount: 10,
    result: "failed",
    reason: "王五没有可用的餐饮补助账户",
    txTime: "2026-07-08T12:30:00+08:00"
  }
];

export const mockPaymentResults: PaymentResult[] = [
  {
    success: true,
    code: "PAYMENT_SUCCESS",
    message: "支付成功",
    updatedAccount: {
      ...mockStudentSubsidyAccounts[0],
      remainingAmount: 288
    },
    transaction: mockTransactionRecords[0]
  },
  {
    success: false,
    code: "MERCHANT_CATEGORY_NOT_ALLOWED",
    message: "商户类别不在补助允许范围内",
    transaction: mockTransactionRecords[1]
  },
  {
    success: false,
    code: "SINGLE_TRANSACTION_LIMIT_EXCEEDED",
    message: "超过单笔限额",
    transaction: mockTransactionRecords[2]
  },
  {
    success: false,
    code: "SUBSIDY_ACCOUNT_NOT_FOUND",
    message: "学生没有对应补助账户",
    transaction: mockTransactionRecords[3]
  }
];
