import { describe, expect, it } from "vitest";
import {
  mockContractRules,
  mockMerchants,
  mockStudentSubsidyAccounts,
  mockStudents,
  mockTransactionRecords
} from "../data/mockData";
import { evaluatePayment, type RuleEngineContext } from "../domain/ruleEngine";
import type { PaymentRequest, StudentSubsidyAccount } from "../types";

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const createContext = (overrides: Partial<RuleEngineContext> = {}): RuleEngineContext => ({
  students: clone(mockStudents),
  subsidyAccounts: clone(mockStudentSubsidyAccounts),
  merchants: clone(mockMerchants),
  rules: clone(mockContractRules),
  transactions: [],
  ...overrides
});

const findAccount = (accounts: StudentSubsidyAccount[], accountId: string) => {
  const account = accounts.find((item) => item.accountId === accountId);
  if (!account) {
    throw new Error(`测试数据缺少账户：${accountId}`);
  }
  return account;
};

describe("专项补助支付规则引擎", () => {
  it("测试 1：合规餐饮支付成功，张三在一食堂消费 12 元后餐饮余额减少 12 元", () => {
    const context = createContext();
    const beforeAccount = findAccount(context.subsidyAccounts, "account-zhangsan-food");
    const request: PaymentRequest = {
      studentId: "student-zhangsan",
      merchantId: "merchant-canteen-1",
      subsidyType: "food",
      amount: 12,
      txTime: "2026-07-08T12:00:00+08:00"
    };

    const result = evaluatePayment(request, context);

    expect(result.success).toBe(true);
    expect(result.message).toBe("支付成功");
    expect(result.updatedAccount?.accountId).toBe("account-zhangsan-food");
    expect(result.updatedAccount?.remainingAmount).toBe(beforeAccount.remainingAmount - 12);
    expect(beforeAccount.remainingAmount).toBe(300);
    expect(result.transaction).toMatchObject({
      studentId: "student-zhangsan",
      merchantId: "merchant-canteen-1",
      subsidyType: "food",
      amount: 12,
      result: "success"
    });
  });

  it("测试 2：商户类别不符合规则，张三在奶茶店使用 food 补助支付失败", () => {
    const context = createContext();
    const beforeAccount = findAccount(context.subsidyAccounts, "account-zhangsan-food");
    const request: PaymentRequest = {
      studentId: "student-zhangsan",
      merchantId: "merchant-beverage",
      subsidyType: "food",
      amount: 20,
      txTime: "2026-07-08T13:00:00+08:00"
    };

    const result = evaluatePayment(request, context);

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/商户|类别/);
    expect(result.updatedAccount).toBeUndefined();
    expect(beforeAccount.remainingAmount).toBe(300);
    expect(result.transaction).toMatchObject({
      result: "failed",
      reason: result.message
    });
  });

  it("测试 3：单笔金额超过限额，张三在一食堂消费 50 元支付失败", () => {
    const context = createContext();
    const beforeAccount = findAccount(context.subsidyAccounts, "account-zhangsan-food");
    const request: PaymentRequest = {
      studentId: "student-zhangsan",
      merchantId: "merchant-canteen-1",
      subsidyType: "food",
      amount: 50,
      txTime: "2026-07-08T18:00:00+08:00"
    };

    const result = evaluatePayment(request, context);

    expect(result.success).toBe(false);
    expect(result.message).toContain("单笔限额");
    expect(result.updatedAccount).toBeUndefined();
    expect(beforeAccount.remainingAmount).toBe(300);
    expect(result.transaction.result).toBe("failed");
  });

  it("测试 4：教材补贴在书店支付成功，张三在校内书店消费 30 元后教材余额减少", () => {
    const context = createContext();
    const beforeAccount = findAccount(context.subsidyAccounts, "account-zhangsan-study");
    const request: PaymentRequest = {
      studentId: "student-zhangsan",
      merchantId: "merchant-bookstore",
      subsidyType: "study",
      amount: 30,
      txTime: "2026-07-08T15:00:00+08:00"
    };

    const result = evaluatePayment(request, context);

    expect(result.success).toBe(true);
    expect(result.updatedAccount?.accountId).toBe("account-zhangsan-study");
    expect(result.updatedAccount?.remainingAmount).toBe(beforeAccount.remainingAmount - 30);
    expect(beforeAccount.remainingAmount).toBe(100);
    expect(result.transaction.result).toBe("success");
  });

  it("测试 5：学生没有对应补助，王五在一食堂使用 food 补助支付失败", () => {
    const context = createContext();
    const request: PaymentRequest = {
      studentId: "student-wangwu",
      merchantId: "merchant-canteen-1",
      subsidyType: "food",
      amount: 10,
      txTime: "2026-07-08T12:30:00+08:00"
    };

    const result = evaluatePayment(request, context);

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/未找到|无可用补助/);
    expect(result.updatedAccount).toBeUndefined();
    expect(result.transaction.result).toBe("failed");
  });

  it("测试 6：余额不足时支付失败，补助账户余额保持不变", () => {
    const context = createContext();
    const studyAccount = findAccount(context.subsidyAccounts, "account-zhangsan-study");
    studyAccount.remainingAmount = 20;
    const request: PaymentRequest = {
      studentId: "student-zhangsan",
      merchantId: "merchant-bookstore",
      subsidyType: "study",
      amount: 30,
      txTime: "2026-07-08T15:00:00+08:00"
    };

    const result = evaluatePayment(request, context);

    expect(result.success).toBe(false);
    expect(result.message).toContain("余额不足");
    expect(result.updatedAccount).toBeUndefined();
    expect(studyAccount.remainingAmount).toBe(20);
    expect(findAccount(mockStudentSubsidyAccounts, "account-zhangsan-study").remainingAmount).toBe(100);
  });

  it("测试 7：补助过期时支付失败，原因包含过期", () => {
    const context = createContext();
    const foodAccount = findAccount(context.subsidyAccounts, "account-zhangsan-food");
    foodAccount.validTo = "2026-07-01T00:00:00+08:00";
    const request: PaymentRequest = {
      studentId: "student-zhangsan",
      merchantId: "merchant-canteen-1",
      subsidyType: "food",
      amount: 12,
      txTime: "2026-07-08T12:00:00+08:00"
    };

    const result = evaluatePayment(request, context);

    expect(result.success).toBe(false);
    expect(result.message).toContain("过期");
    expect(result.updatedAccount).toBeUndefined();
    expect(foodAccount.remainingAmount).toBe(300);
  });

  it("测试 8：当日累计超过 dailyLimit 时支付失败，原因包含当日限额", () => {
    const context = createContext({
      transactions: [clone(mockTransactionRecords[0])]
    });
    const beforeAccount = findAccount(context.subsidyAccounts, "account-zhangsan-food");
    const request: PaymentRequest = {
      studentId: "student-zhangsan",
      merchantId: "merchant-canteen-1",
      subsidyType: "food",
      amount: 20,
      txTime: "2026-07-08T18:00:00+08:00"
    };

    const result = evaluatePayment(request, context);

    expect(result.success).toBe(false);
    expect(result.message).toContain("当日限额");
    expect(result.updatedAccount).toBeUndefined();
    expect(beforeAccount.remainingAmount).toBe(300);
    expect(result.transaction.result).toBe("failed");
  });
});
