import { useMemo, useState } from "react";
import { useSubsidyStore } from "../services/SubsidyContext";
import type { Merchant, RefundResult, StudentSubsidyAccount, SubsidyType, TransactionRecord } from "../types";

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

const merchantCategoryLabels: Record<Merchant["category"], string> = {
  canteen: "食堂",
  bookstore: "书店",
  printing: "打印店",
  beverage: "饮品店",
  entertainment: "娱乐商户"
};

const transactionResultLabels: Record<TransactionRecord["result"], string> = {
  success: "成功",
  failed: "失败",
  frozen: "冻结"
};

const formatMoney = (amount: number) => `${amount.toFixed(2)} 元`;

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));

const toDateInputValue = (date: Date) => {
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 10);
};

function AdminDashboardPage() {
  const { students, merchants, rules, subsidyAccounts, transactions, refundRecords, processExpiredRefunds } =
    useSubsidyStore();
  const [refundDate, setRefundDate] = useState(() => toDateInputValue(new Date()));
  const [latestRefundResult, setLatestRefundResult] = useState<RefundResult | null>(null);

  const studentById = useMemo(() => new Map(students.map((student) => [student.studentId, student])), [students]);
  const merchantById = useMemo(
    () => new Map(merchants.map((merchant) => [merchant.merchantId, merchant])),
    [merchants]
  );

  const planSummaries = useMemo(
    () =>
      rules.map((rule) => {
        const accounts = subsidyAccounts.filter((account) => account.planId === rule.planId);
        const totalAmount = accounts.reduce((sum, account) => sum + account.initialAmount, 0);
        const unusedAmount = accounts.reduce((sum, account) => sum + account.remainingAmount, 0);
        const usedAmount = totalAmount - unusedAmount;

        return {
          planId: rule.planId,
          planName: `${subsidyTypeLabels[rule.subsidyType]}计划`,
          totalAmount,
          usedAmount,
          unusedAmount,
          refundedAmount: refundRecords
            .filter((record) => record.planId === rule.planId)
            .reduce((sum, record) => sum + record.amount, 0)
        };
      }),
    [rules, subsidyAccounts, refundRecords]
  );

  return (
    <main className="app-shell admin-page">
      <a className="back-link" href="#">
        返回首页
      </a>

      <section className="hero wallet-hero">
        <p className="eyebrow">学校后台</p>
        <h1>补助资金使用管理后台</h1>
        <p className="hero-copy">查看专项补助计划执行情况、学生补助账户、商户白名单和交易审计记录。</p>
      </section>

      <section className="privacy-note">
        学校后台仅用于查看专项补助资金的使用情况，不应查看学生普通钱包消费记录。
      </section>

      <section className="wallet-section refund-panel">
        <div>
          <p className="eyebrow">到期退回</p>
          <h2>执行到期未使用资金自动退回</h2>
          <p>选择模拟日期后，系统会扫描已过期且仍有余额的可用补助账户，并退回学校资金池。</p>
        </div>
        <label>
          模拟当前日期
          <input type="date" value={refundDate} onChange={(event) => setRefundDate(event.target.value)} />
        </label>
        <button
          className="primary-button"
          onClick={() => setLatestRefundResult(processExpiredRefunds(`${refundDate}T00:00:00+08:00`))}
          type="button"
        >
          执行到期退回
        </button>
        {latestRefundResult ? (
          <strong className="refund-result">本次退回金额：{formatMoney(latestRefundResult.totalRefundAmount)}</strong>
        ) : null}
      </section>

      <section className="wallet-section">
        <div className="section-title">
          <p className="eyebrow">补助计划概览</p>
          <h2>资金使用概览</h2>
        </div>
        <div className="admin-summary-grid">
          {planSummaries.map((summary) => (
            <article className="admin-summary-card" key={summary.planId}>
              <h3>{summary.planName}</h3>
              <dl>
                <div>
                  <dt>总发放金额</dt>
                  <dd>{formatMoney(summary.totalAmount)}</dd>
                </div>
                <div>
                  <dt>已使用金额</dt>
                  <dd>{formatMoney(summary.usedAmount)}</dd>
                </div>
                <div>
                  <dt>未使用金额</dt>
                  <dd>{formatMoney(summary.unusedAmount)}</dd>
                </div>
                <div>
                  <dt>退回金额</dt>
                  <dd>{formatMoney(summary.refundedAmount)}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="wallet-section">
        <div className="section-title">
          <p className="eyebrow">账户列表</p>
          <h2>学生补助账户</h2>
        </div>
        <div className="admin-table account-table">
          <div className="admin-table-header">
            <span>学生姓名</span>
            <span>补助类型</span>
            <span>初始金额</span>
            <span>剩余金额</span>
            <span>状态</span>
          </div>
          {subsidyAccounts.map((account) => (
            <article className="admin-table-row" key={account.accountId}>
              <span>{studentById.get(account.studentId)?.name ?? account.studentId}</span>
              <span>{subsidyTypeLabels[account.subsidyType]}</span>
              <span>{formatMoney(account.initialAmount)}</span>
              <span>{formatMoney(account.remainingAmount)}</span>
              <strong className={`status-text ${account.status}`}>{accountStatusLabels[account.status]}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="wallet-section">
        <div className="section-title">
          <p className="eyebrow">商户白名单</p>
          <h2>专项补助允许商户</h2>
        </div>
        <div className="admin-table merchant-table">
          <div className="admin-table-header">
            <span>商户名称</span>
            <span>商户类别</span>
            <span>白名单状态</span>
          </div>
          {merchants.map((merchant) => (
            <article className="admin-table-row" key={merchant.merchantId}>
              <span>{merchant.merchantName}</span>
              <span>{merchantCategoryLabels[merchant.category]}</span>
              <strong className={`status-text ${merchant.whitelistStatus}`}>
                {merchant.whitelistStatus === "approved" ? "通过" : "未通过"}
              </strong>
            </article>
          ))}
        </div>
      </section>

      <section className="wallet-section">
        <div className="section-title">
          <p className="eyebrow">审计记录</p>
          <h2>专项补助交易审计</h2>
        </div>
        <div className="admin-table audit-table">
          <div className="admin-table-header">
            <span>时间</span>
            <span>学生</span>
            <span>商户</span>
            <span>金额</span>
            <span>结果</span>
            <span>原因</span>
          </div>
          {transactions.map((transaction) => (
            <article className={`admin-table-row audit-row ${transaction.result}`} key={transaction.txId}>
              <span>{formatDateTime(transaction.txTime)}</span>
              <span>{studentById.get(transaction.studentId)?.name ?? transaction.studentId}</span>
              <span>{merchantById.get(transaction.merchantId)?.merchantName ?? transaction.merchantId}</span>
              <span>{formatMoney(transaction.amount)}</span>
              <strong>{transactionResultLabels[transaction.result]}</strong>
              <span>{transaction.reason}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="wallet-section">
        <div className="section-title">
          <p className="eyebrow">退回记录</p>
          <h2>学校资金池退回明细</h2>
        </div>
        {refundRecords.length === 0 ? (
          <p className="empty-state">暂无退回记录，请点击“执行到期退回”模拟到期退回。</p>
        ) : (
          <div className="admin-table refund-table">
            <div className="admin-table-header">
              <span>退回时间</span>
              <span>学生</span>
              <span>补助类型</span>
              <span>金额</span>
              <span>原因</span>
            </div>
            {refundRecords.map((record) => (
              <article className="admin-table-row refund-row" key={record.refundId}>
                <span>{formatDateTime(record.refundTime)}</span>
                <span>{studentById.get(record.studentId)?.name ?? record.studentId}</span>
                <span>{subsidyTypeLabels[record.subsidyType]}</span>
                <span>{formatMoney(record.amount)}</span>
                <span>{record.reason}</span>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminDashboardPage;
