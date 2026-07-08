import { describe, expect, it } from "vitest";
import { processExpiredSubsidies } from "../domain/refundEngine";
import type { StudentSubsidyAccount } from "../types";

const baseAccount: StudentSubsidyAccount = {
  accountId: "account-test-food",
  studentId: "student-test",
  planId: "plan-food-2026-spring",
  subsidyType: "food",
  initialAmount: 100,
  remainingAmount: 60,
  validFrom: "2026-03-01T00:00:00+08:00",
  validTo: "2026-07-31T23:59:59+08:00",
  status: "active"
};

describe("补助到期自动退回引擎", () => {
  it("未过期账户不退回", () => {
    const result = processExpiredSubsidies([baseAccount], "2026-07-01T00:00:00+08:00");

    expect(result.totalRefundAmount).toBe(0);
    expect(result.refundRecords).toHaveLength(0);
    expect(result.updatedAccounts[0]).toMatchObject({
      remainingAmount: 60,
      status: "active"
    });
  });

  it("已过期且有余额账户会退回", () => {
    const result = processExpiredSubsidies([baseAccount], "2026-08-01T00:00:00+08:00");

    expect(result.totalRefundAmount).toBe(60);
    expect(result.refundRecords).toHaveLength(1);
    expect(result.refundRecords[0]).toMatchObject({
      studentId: "student-test",
      accountId: "account-test-food",
      planId: "plan-food-2026-spring",
      subsidyType: "food",
      amount: 60,
      reason: "补助到期，未使用金额自动退回学校资金池"
    });
  });

  it("已经 refunded 的账户不会重复退回", () => {
    const result = processExpiredSubsidies([{ ...baseAccount, status: "refunded" }], "2026-08-01T00:00:00+08:00");

    expect(result.totalRefundAmount).toBe(0);
    expect(result.refundRecords).toHaveLength(0);
    expect(result.updatedAccounts[0]).toMatchObject({
      remainingAmount: 60,
      status: "refunded"
    });
  });

  it("退回后余额为 0，状态为 refunded", () => {
    const result = processExpiredSubsidies([baseAccount], "2026-08-01T00:00:00+08:00");

    expect(result.updatedAccounts[0]).toMatchObject({
      remainingAmount: 0,
      status: "refunded"
    });
  });
});
