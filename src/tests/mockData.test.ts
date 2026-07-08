import { describe, expect, it } from "vitest";
import {
  mockContractRules,
  mockMerchants,
  mockPaymentRequests,
  mockPaymentResults,
  mockStudentSubsidyAccounts,
  mockStudents,
  mockSubsidyPlans,
  mockTransactionRecords
} from "../data/mockData";

describe("核心 mock 数据", () => {
  it("包含张三、李四、王五三名学生及对应补助账户", () => {
    expect(mockStudents.map((student) => student.name)).toEqual(["张三", "李四", "王五"]);

    const zhangsanAccounts = mockStudentSubsidyAccounts.filter((account) => account.studentId === "student-zhangsan");
    const lisiAccounts = mockStudentSubsidyAccounts.filter((account) => account.studentId === "student-lisi");
    const wangwuAccounts = mockStudentSubsidyAccounts.filter((account) => account.studentId === "student-wangwu");

    expect(zhangsanAccounts.map((account) => [account.subsidyType, account.initialAmount])).toEqual([
      ["food", 300],
      ["study", 100]
    ]);
    expect(lisiAccounts.map((account) => [account.subsidyType, account.initialAmount])).toEqual([["food", 200]]);
    expect(wangwuAccounts).toHaveLength(0);
  });

  it("包含白名单商户和未通过白名单商户", () => {
    expect(mockMerchants.map((merchant) => [merchant.merchantName, merchant.category, merchant.whitelistStatus])).toEqual([
      ["一食堂", "canteen", "approved"],
      ["校内书店", "bookstore", "approved"],
      ["打印店", "printing", "approved"],
      ["奶茶店", "beverage", "rejected"],
      ["网吧", "entertainment", "rejected"]
    ]);
  });

  it("包含餐饮补贴和教材补贴规则", () => {
    expect(mockSubsidyPlans.map((plan) => plan.subsidyType)).toEqual(["food", "study"]);

    const foodRule = mockContractRules.find((rule) => rule.subsidyType === "food");
    const studyRule = mockContractRules.find((rule) => rule.subsidyType === "study");

    expect(foodRule?.allowedMerchantCategories).toEqual(["canteen"]);
    expect(foodRule?.singleTransactionLimit).toBe(30);
    expect(foodRule?.dailyLimit).toBe(30);
    expect(studyRule?.allowedMerchantCategories).toEqual(["bookstore", "printing"]);
    expect(studyRule?.singleTransactionLimit).toBe(100);
    expect(studyRule?.dailyLimit).toBe(100);
  });

  it("覆盖成功支付、商户不符、金额超限和无补助场景", () => {
    expect(mockPaymentRequests).toHaveLength(4);
    expect(mockTransactionRecords.map((transaction) => transaction.txId)).toEqual([
      "tx-success-food-canteen",
      "tx-failed-merchant-category",
      "tx-failed-single-limit",
      "tx-failed-no-account"
    ]);
    expect(mockPaymentResults.map((result) => result.code)).toEqual([
      "PAYMENT_SUCCESS",
      "MERCHANT_CATEGORY_NOT_ALLOWED",
      "SINGLE_TRANSACTION_LIMIT_EXCEEDED",
      "SUBSIDY_ACCOUNT_NOT_FOUND"
    ]);
  });
});
