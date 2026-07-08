import type {
  ContractRule,
  Merchant,
  PaymentRequest,
  PaymentResult,
  Student,
  StudentSubsidyAccount,
  TransactionRecord
} from "../types/subsidy";

export interface RuleEngineContext {
  students: Student[];
  subsidyAccounts: StudentSubsidyAccount[];
  merchants: Merchant[];
  rules: ContractRule[];
  transactions: TransactionRecord[];
}

const buildTransaction = (
  request: PaymentRequest,
  result: TransactionRecord["result"],
  reason: string,
  sequence: number
): TransactionRecord => ({
  txId: `tx-${sequence}-${request.studentId}-${request.merchantId}-${request.subsidyType}-${request.txTime}`,
  studentId: request.studentId,
  merchantId: request.merchantId,
  subsidyType: request.subsidyType,
  amount: request.amount,
  result,
  reason,
  txTime: request.txTime
});

const buildFailedResult = (request: PaymentRequest, code: string, message: string, sequence: number): PaymentResult => ({
  success: false,
  code,
  message,
  transaction: buildTransaction(request, "failed", message, sequence)
});

const isWithinRange = (time: string, validFrom: string, validTo: string) => {
  const current = new Date(time).getTime();
  return current >= new Date(validFrom).getTime() && current <= new Date(validTo).getTime();
};

const isSameTransactionDate = (left: string, right: string) => left.slice(0, 10) === right.slice(0, 10);

const calculateDailyUsedAmount = (request: PaymentRequest, context: RuleEngineContext) =>
  context.transactions
    .filter(
      (transaction) =>
        transaction.result === "success" &&
        transaction.studentId === request.studentId &&
        transaction.subsidyType === request.subsidyType &&
        isSameTransactionDate(transaction.txTime, request.txTime)
    )
    .reduce((total, transaction) => total + transaction.amount, 0);

export const evaluatePayment = (request: PaymentRequest, context: RuleEngineContext): PaymentResult => {
  const sequence = context.transactions.length + 1;
  const student = context.students.find((item) => item.studentId === request.studentId);

  if (!student) {
    return buildFailedResult(request, "STUDENT_NOT_FOUND", "学生不存在", sequence);
  }

  if (student.status !== "active") {
    return buildFailedResult(request, "STUDENT_NOT_ACTIVE", "学生状态异常，无法使用专项补助", sequence);
  }

  const merchant = context.merchants.find((item) => item.merchantId === request.merchantId);
  if (!merchant) {
    return buildFailedResult(request, "MERCHANT_NOT_FOUND", "商户不存在", sequence);
  }

  if (merchant.whitelistStatus !== "approved") {
    return buildFailedResult(request, "MERCHANT_NOT_WHITELISTED", "商户未进入专项补助白名单", sequence);
  }

  const account = context.subsidyAccounts.find(
    (item) =>
      item.studentId === request.studentId && item.subsidyType === request.subsidyType && item.status === "active"
  );

  if (!account) {
    return buildFailedResult(request, "SUBSIDY_ACCOUNT_NOT_FOUND", "未找到可用的专项补助账户", sequence);
  }

  if (!isWithinRange(request.txTime, account.validFrom, account.validTo)) {
    return buildFailedResult(request, "SUBSIDY_ACCOUNT_EXPIRED", "补助已过期", sequence);
  }

  if (request.amount > account.remainingAmount) {
    return buildFailedResult(request, "INSUFFICIENT_SUBSIDY_BALANCE", "补助余额不足", sequence);
  }

  const rule = context.rules.find((item) => item.planId === account.planId && item.subsidyType === request.subsidyType);
  if (!rule || !rule.allowedMerchantCategories.includes(merchant.category)) {
    return buildFailedResult(request, "MERCHANT_CATEGORY_NOT_ALLOWED", "当前商户类别不符合补助使用规则", sequence);
  }

  if (!isWithinRange(request.txTime, rule.validFrom, rule.validTo)) {
    return buildFailedResult(request, "SUBSIDY_RULE_EXPIRED", "补助已过期", sequence);
  }

  if (request.amount > rule.singleTransactionLimit) {
    return buildFailedResult(request, "SINGLE_TRANSACTION_LIMIT_EXCEEDED", "交易金额超过单笔限额", sequence);
  }

  const dailyUsedAmount = calculateDailyUsedAmount(request, context);
  if (dailyUsedAmount + request.amount > rule.dailyLimit) {
    return buildFailedResult(request, "DAILY_LIMIT_EXCEEDED", "交易金额超过当日限额", sequence);
  }

  const updatedAccount: StudentSubsidyAccount = {
    ...account,
    remainingAmount: Number((account.remainingAmount - request.amount).toFixed(2))
  };
  const transaction = buildTransaction(request, "success", "支付成功", sequence);

  return {
    success: true,
    code: "PAYMENT_SUCCESS",
    message: "支付成功",
    updatedAccount,
    transaction
  };
};
