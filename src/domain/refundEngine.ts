import type { RefundRecord, RefundResult, StudentSubsidyAccount } from "../types";

const isExpired = (validTo: string, currentDate: string) =>
  new Date(validTo).getTime() < new Date(currentDate).getTime();

export const processExpiredSubsidies = (
  accounts: StudentSubsidyAccount[],
  currentDate: string
): RefundResult => {
  const refundRecords: RefundRecord[] = [];
  let totalRefundAmount = 0;

  const updatedAccounts = accounts.map((account) => {
    const shouldRefund =
      account.status === "active" && account.remainingAmount > 0 && isExpired(account.validTo, currentDate);

    if (!shouldRefund) {
      return { ...account };
    }

    const refundAmount = account.remainingAmount;
    totalRefundAmount = Number((totalRefundAmount + refundAmount).toFixed(2));
    refundRecords.push({
      refundId: `refund-${account.accountId}-${currentDate}`,
      studentId: account.studentId,
      accountId: account.accountId,
      planId: account.planId,
      subsidyType: account.subsidyType,
      amount: refundAmount,
      refundTime: currentDate,
      reason: "补助到期，未使用金额自动退回学校资金池"
    });

    return {
      ...account,
      remainingAmount: 0,
      status: "refunded" as const
    };
  });

  return {
    updatedAccounts,
    refundRecords,
    totalRefundAmount
  };
};
