import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import PaymentSimulatorPage from "../pages/PaymentSimulatorPage";
import { SubsidyProvider } from "../services/SubsidyContext";

describe("交易模拟页面", () => {
  it("展示交易表单、快捷测试按钮和 demo 交易记录", () => {
    const html = renderToStaticMarkup(
      <SubsidyProvider>
        <PaymentSimulatorPage />
      </SubsidyProvider>
    );

    expect(html).toContain("专项补助定向支付模拟");
    expect(html).toContain("重置 Demo 数据");
    expect(html).toContain("发起支付");
    expect(html).toContain("张三在一食堂消费 12 元");
    expect(html).toContain("张三在奶茶店消费 20 元");
    expect(html).toContain("张三在一食堂消费 50 元");
    expect(html).toContain("张三在校内书店消费 30 元");
    expect(html).toContain("王五在一食堂消费 10 元");
    expect(html).toContain("本次 demo");
    expect(html).toContain("成功");
    expect(html).toContain("失败");
  });
});
