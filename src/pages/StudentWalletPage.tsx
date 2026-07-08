import { useMemo } from "react";
import { useSubsidyStore } from "../services/SubsidyContext";
import type { Merchant, StudentSubsidyAccount, SubsidyType, TransactionRecord } from "../types";

const subsidyTypeLabels: Record<SubsidyType, string> = {
  food: "餐饮补贴",
  study: "教材补贴",
  transport: "交通补贴"
};

const accountStatusLabels: Record<StudentSubsidyAccount["status"], string> = {
  active: "可用",
  expired: "已过期",
  refunded: "已退回"
};

const transactionResultLabels: Record<TransactionRecord["result"], string> = {
  success: "成功",
  failed: "失败",
  frozen: "冻结"
};

const merchantCategoryLabels: Record<Merchant["category"], string> = {
  canteen: "食堂",
  bookstore: "书店",
  printing: "打印店",
  beverage: "饮品店",
  entertainment: "娱乐商户"
};

const formatMoney = (amount: number) => `${amount.toFixed(2)} 元`;

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date(value));

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));

function StudentWalletPage() {
  const { students, merchants, rules, subsidyAccounts, transactions } = useSubsidyStore();
  const student = students.find((item) => item.studentId === "student-zhangsan") ?? students[0];
  const accounts = subsidyAccounts.filter((account) => account.studentId === student.studentId);
  const studentTransactions = transactions.filter((transaction) => transaction.studentId === student.studentId);

  const merchantById = useMemo(
    () => new Map(merchants.map((merchant) => [merchant.merchantId, merchant])),
    [merchants]
  );

  const rulesBySubsidyType = useMemo(
    () => new Map(rules.map((rule) => [rule.subsidyType, rule])),
    [rules]
  );

  return (
    <main className="app-shell wallet-page">
      <a className="back-link" href="#">
        返回首页
      </a>

      <section className="hero wallet-hero">
        <p className="eyebrow">学生钱包</p>
        <h1>张三的专项补助钱包</h1>
        <p className="hero-copy">查看校园专项补助余额、合约使用规则和最近交易记录。</p>
      </section>

      <section className="wallet-section student-profile" aria-label="学生基本信息">
        <div>
          <span>姓名</span>
          <strong>{student.name}</strong>
        </div>
        <div>
          <span>学号</span>
          <strong>{student.studentNo}</strong>
        </div>
        <div>
          <span>钱包 ID</span>
          <strong>{student.walletId}</strong>
        </div>
      </section>

      <section className="wallet-section" aria-label="补助余额">
        <div className="section-title">
          <p className="eyebrow">补助余额</p>
          <h2>专项账户</h2>
        </div>
        <div className="subsidy-card-grid">
          {accounts.map((account) => (
            <article className={`subsidy-card ${account.status}`} key={account.accountId}>
              <div className="card-head">
                <h3>{subsidyTypeLabels[account.subsidyType]}</h3>
                <span className={`status-pill ${account.status}`}>{accountStatusLabels[account.status]}</span>
              </div>
              <strong>
                {formatMoney(account.remainingAmount)} / {formatMoney(account.initialAmount)}
              </strong>
              <p>
                有效期：{formatDate(account.validFrom)} 至 {formatDate(account.validTo)}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="wallet-section" aria-label="使用规则说明">
        <div className="section-title">
          <p className="eyebrow">使用规则</p>
          <h2>智能合约约束</h2>
        </div>
        <div className="rule-list">
          {accounts.map((account) => {
            const rule = rulesBySubsidyType.get(account.subsidyType);
            if (!rule) {
              return null;
            }
            const allowedMerchantNames = merchants
              .filter(
                (merchant) =>
                  merchant.whitelistStatus === "approved" && rule.allowedMerchantCategories.includes(merchant.category)
              )
              .map((merchant) => merchant.merchantName);

            return (
              <article className="rule-card" key={rule.ruleId}>
                <h3>{subsidyTypeLabels[rule.subsidyType]}</h3>
                <p>
                  允许商户：仅限{" "}
                  {rule.allowedMerchantCategories.map((category) => merchantCategoryLabels[category]).join("、")} 类商户。
                </p>
                <p>当前可用商户：{allowedMerchantNames.join("、")}。</p>
                <p>
                  限额规则：单笔 {formatMoney(rule.singleTransactionLimit)} 以内，每日{" "}
                  {formatMoney(rule.dailyLimit)} 以内。
                </p>
                <p>到期规则：{rule.refundPolicy}。</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="wallet-section" aria-label="最近交易记录">
        <div className="section-title">
          <p className="eyebrow">最近交易</p>
          <h2>交易记录</h2>
        </div>
        <div className="transaction-table">
          <div className="transaction-header">
            <span>时间</span>
            <span>商户</span>
            <span>补助类型</span>
            <span>金额</span>
            <span>结果</span>
            <span>说明</span>
          </div>
          {studentTransactions.map((transaction) => {
            const merchant = merchantById.get(transaction.merchantId);

            return (
              <article className={`transaction-item ${transaction.result}`} key={transaction.txId}>
                <span>{formatDateTime(transaction.txTime)}</span>
                <span>{merchant?.merchantName ?? transaction.merchantId}</span>
                <span>{subsidyTypeLabels[transaction.subsidyType]}</span>
                <span>{formatMoney(transaction.amount)}</span>
                <strong>{transactionResultLabels[transaction.result]}</strong>
                <span>{transaction.reason}</span>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

export default StudentWalletPage;
