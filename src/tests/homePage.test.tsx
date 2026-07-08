import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import HomePage from "../pages/HomePage";
import { SubsidyProvider } from "../services/SubsidyContext";

describe("首页基础页面", () => {
  it("显示中文标题、说明和三个功能入口", () => {
    const html = renderToStaticMarkup(
      <SubsidyProvider>
        <HomePage />
      </SubsidyProvider>
    );

    expect(html).toContain("数字人民币校园专项补助定向支付系统");
    expect(html).toContain("演示学校发放专项补助、学生定向消费、规则拦截和到期退回");
    expect(html).toContain("学生钱包");
    expect(html).toContain("学校后台");
    expect(html).toContain("交易模拟");
    expect(html).toContain("重置 Demo 数据");
    expect(html).toContain("项目演示路径");
    expect(html).toContain("推荐课堂演示顺序");
    expect(html).toContain("点击“张三在一食堂消费 12 元”");
    expect(html).toContain("系统边界说明");
    expect(html).toContain("不接入真实数字人民币系统");
    expect(html).toContain("学校只能查看专项补助交易");
  });
});
