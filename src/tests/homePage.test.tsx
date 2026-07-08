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
    expect(html).toContain("本系统为课程设计 demo，不接入真实数字人民币系统");
    expect(html).toContain("学生钱包");
    expect(html).toContain("学校后台");
    expect(html).toContain("交易模拟");
    expect(html).toContain("重置 Demo 数据");
  });
});
