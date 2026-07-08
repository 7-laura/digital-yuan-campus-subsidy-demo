import NavEntry from "../components/NavEntry";
import { mockContractRules, mockMerchants, mockStudents } from "../data/mockData";
import { navigationEntries } from "../data/navigation";

function HomePage() {
  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">课程设计 Demo</p>
        <h1>数字人民币校园专项补助定向支付系统</h1>
        <p className="hero-copy">本系统为课程设计 demo，不接入真实数字人民币系统。</p>
      </section>

      <nav className="entry-grid" aria-label="功能入口">
        {navigationEntries.map((entry) => (
          <NavEntry key={entry.id} entry={entry} />
        ))}
      </nav>

      <section className="data-summary" aria-label="Mock 数据摘要">
        当前已加载 {mockStudents.length} 名学生、{mockMerchants.length} 个商户、{mockContractRules.length} 条合约规则。
      </section>
    </main>
  );
}

export default HomePage;
