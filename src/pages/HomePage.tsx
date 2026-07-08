import NavEntry from "../components/NavEntry";
import { mockContractRules, mockMerchants, mockStudents } from "../data/mockData";
import { navigationEntries } from "../data/navigation";
import { useSubsidyStore } from "../services/SubsidyContext";

function HomePage() {
  const { resetDemoData } = useSubsidyStore();
  const demoSteps = [
    "查看学生钱包余额",
    "进入交易模拟页面",
    "点击“张三在一食堂消费 12 元”",
    "查看支付成功和余额变化",
    "点击“张三在奶茶店消费 20 元”",
    "查看支付失败和失败原因",
    "进入学校后台查看资金使用记录",
    "执行到期退回，查看未使用资金退回"
  ];

  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">课程设计 Demo</p>
        <h1>数字人民币校园专项补助定向支付系统</h1>
        <p className="hero-copy">
          用一个本地可运行的课堂 demo，演示学校发放专项补助、学生定向消费、规则拦截和到期退回的完整流程。
        </p>
        <button className="reset-button" onClick={resetDemoData} type="button">
          重置 Demo 数据
        </button>
      </section>

      <nav className="entry-grid" aria-label="功能入口">
        {navigationEntries.map((entry) => (
          <NavEntry key={entry.id} entry={entry} />
        ))}
      </nav>

      <section className="data-summary" aria-label="Mock 数据摘要">
        当前已加载 {mockStudents.length} 名学生、{mockMerchants.length} 个商户、{mockContractRules.length} 条合约规则。
      </section>

      <section className="wallet-section demo-guide" aria-label="项目演示路径">
        <div className="section-title">
          <p className="eyebrow">项目演示路径</p>
          <h2>推荐课堂演示顺序</h2>
        </div>
        <ol>
          {demoSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="wallet-section boundary-section" aria-label="系统边界说明">
        <div className="section-title">
          <p className="eyebrow">系统边界说明</p>
          <h2>本项目只用于课程展示</h2>
        </div>
        <ul>
          <li>本系统仅为模拟 demo，用于展示业务流程和规则判断。</li>
          <li>不接入真实数字人民币系统、银行接口、支付接口或区块链网络。</li>
          <li>不处理真实身份信息，学生、商户和交易均为本地 mock 数据。</li>
          <li>学校只能查看专项补助交易，不查看学生普通钱包消费记录。</li>
        </ul>
      </section>
    </main>
  );
}

export default HomePage;
