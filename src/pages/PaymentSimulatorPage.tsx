import { useMemo, useState, type FormEvent } from "react";
import { useSubsidyStore } from "../services/SubsidyContext";
import type { PaymentRequest, PaymentResult, SubsidyType } from "../types";

const subsidyTypeLabels: Record<SubsidyType, string> = {
  food: "餐饮补贴",
  study: "教材补贴",
  transport: "交通补贴"
};

const quickScenarios: Array<{
  label: string;
  request: Omit<PaymentRequest, "txTime">;
}> = [
  {
    label: "张三在一食堂消费 12 元",
    request: { studentId: "student-zhangsan", merchantId: "merchant-canteen-1", subsidyType: "food", amount: 12 }
  },
  {
    label: "张三在奶茶店消费 20 元",
    request: { studentId: "student-zhangsan", merchantId: "merchant-beverage", subsidyType: "food", amount: 20 }
  },
  {
    label: "张三在一食堂消费 50 元",
    request: { studentId: "student-zhangsan", merchantId: "merchant-canteen-1", subsidyType: "food", amount: 50 }
  },
  {
    label: "张三在校内书店消费 30 元",
    request: { studentId: "student-zhangsan", merchantId: "merchant-bookstore", subsidyType: "study", amount: 30 }
  },
  {
    label: "王五在一食堂消费 10 元",
    request: { studentId: "student-wangwu", merchantId: "merchant-canteen-1", subsidyType: "food", amount: 10 }
  }
];

const toDateTimeLocalValue = (date: Date) => {
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 16);
};

const toRequestTime = (value: string) => new Date(value).toISOString();

const formatMoney = (amount: number) => `${amount.toFixed(2)} 元`;

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));

function PaymentSimulatorPage() {
  const { students, merchants, transactions, submitPayment, resetDemoData } = useSubsidyStore();
  const [studentId, setStudentId] = useState("student-zhangsan");
  const [merchantId, setMerchantId] = useState("merchant-canteen-1");
  const [subsidyType, setSubsidyType] = useState<SubsidyType>("food");
  const [amount, setAmount] = useState("12");
  const [txTime, setTxTime] = useState(() => toDateTimeLocalValue(new Date()));
  const [latestResult, setLatestResult] = useState<PaymentResult | null>(null);

  const studentById = useMemo(() => new Map(students.map((student) => [student.studentId, student])), [students]);
  const merchantById = useMemo(
    () => new Map(merchants.map((merchant) => [merchant.merchantId, merchant])),
    [merchants]
  );

  const submitRequest = (request: PaymentRequest) => {
    const result = submitPayment(request);
    setLatestResult(result);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitRequest({
      studentId,
      merchantId,
      subsidyType,
      amount: Number(amount),
      txTime: toRequestTime(txTime)
    });
  };

  const runQuickScenario = (request: Omit<PaymentRequest, "txTime">) => {
    setStudentId(request.studentId);
    setMerchantId(request.merchantId);
    setSubsidyType(request.subsidyType);
    setAmount(String(request.amount));
    const currentTxTime = toDateTimeLocalValue(new Date());
    setTxTime(currentTxTime);
    submitRequest({
      ...request,
      txTime: toRequestTime(currentTxTime)
    });
  };

  return (
    <main className="app-shell simulator-page">
      <a className="back-link" href="#">
        返回首页
      </a>

      <section className="hero wallet-hero">
        <p className="eyebrow">交易模拟</p>
        <h1>专项补助定向支付模拟</h1>
        <p className="hero-copy">选择学生、商户、补助类型和金额，系统会调用规则引擎自动判断支付是否成功。</p>
        <button
          className="reset-button"
          onClick={() => {
            resetDemoData();
            setLatestResult(null);
          }}
          type="button"
        >
          重置 Demo 数据
        </button>
      </section>

      <section className="wallet-section simulator-grid">
        <form className="payment-form" onSubmit={handleSubmit}>
          <label>
            学生
            <select value={studentId} onChange={(event) => setStudentId(event.target.value)}>
              {students.map((student) => (
                <option key={student.studentId} value={student.studentId}>
                  {student.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            商户
            <select value={merchantId} onChange={(event) => setMerchantId(event.target.value)}>
              {merchants.map((merchant) => (
                <option key={merchant.merchantId} value={merchant.merchantId}>
                  {merchant.merchantName}
                </option>
              ))}
            </select>
          </label>

          <label>
            补助类型
            <select value={subsidyType} onChange={(event) => setSubsidyType(event.target.value as SubsidyType)}>
              <option value="food">餐饮补贴 food</option>
              <option value="study">教材补贴 study</option>
            </select>
          </label>

          <label>
            金额
            <input min="0.01" step="0.01" type="number" value={amount} onChange={(event) => setAmount(event.target.value)} />
          </label>

          <label>
            交易时间
            <input type="datetime-local" value={txTime} onChange={(event) => setTxTime(event.target.value)} />
          </label>

          <button className="primary-button" type="submit">
            发起支付
          </button>
        </form>

        <aside className={`payment-result ${latestResult?.success ? "success" : latestResult ? "failed" : ""}`}>
          <p className="eyebrow">支付结果</p>
          {!latestResult ? (
            <p>请填写交易信息后发起支付。</p>
          ) : latestResult.success ? (
            <>
              <h2>支付成功</h2>
              <p>扣减金额：{formatMoney(latestResult.transaction.amount)}</p>
              <p>剩余余额：{formatMoney(latestResult.updatedAccount?.remainingAmount ?? 0)}</p>
            </>
          ) : (
            <>
              <h2>支付失败</h2>
              <p>失败原因：{latestResult.message}</p>
            </>
          )}
        </aside>
      </section>

      <section className="wallet-section">
        <div className="section-title">
          <p className="eyebrow">快捷测试</p>
          <h2>典型场景一键触发</h2>
        </div>
        <div className="quick-actions">
          {quickScenarios.map((scenario) => (
            <button className="secondary-button" key={scenario.label} onClick={() => runQuickScenario(scenario.request)}>
              {scenario.label}
            </button>
          ))}
        </div>
      </section>

      <section className="wallet-section" aria-label="本次 demo 交易记录">
        <div className="section-title">
          <p className="eyebrow">本次 demo</p>
          <h2>交易记录</h2>
        </div>
        <div className="transaction-table">
          <div className="transaction-header">
            <span>时间</span>
            <span>学生</span>
            <span>商户</span>
            <span>补助类型</span>
            <span>金额</span>
            <span>结果</span>
          </div>
          {transactions.map((transaction) => (
            <article className={`transaction-item simulator-record ${transaction.result}`} key={transaction.txId}>
              <span>{formatDateTime(transaction.txTime)}</span>
              <span>{studentById.get(transaction.studentId)?.name ?? transaction.studentId}</span>
              <span>{merchantById.get(transaction.merchantId)?.merchantName ?? transaction.merchantId}</span>
              <span>{subsidyTypeLabels[transaction.subsidyType]}</span>
              <span>{formatMoney(transaction.amount)}</span>
              <strong>{transaction.result === "success" ? "成功" : "失败"}：{transaction.reason}</strong>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default PaymentSimulatorPage;
