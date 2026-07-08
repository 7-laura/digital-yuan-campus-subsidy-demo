import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import AdminDashboardPage from "../pages/AdminDashboardPage";
import { SubsidyProvider } from "../services/SubsidyContext";

describe("学校补助管理后台页面", () => {
  it("展示计划概览、学生账户、商户白名单、交易审计和隐私边界说明", () => {
    const html = renderToStaticMarkup(
      <SubsidyProvider>
        <AdminDashboardPage />
      </SubsidyProvider>
    );

    expect(html).toContain("补助资金使用管理后台");
    expect(html).toContain("学校后台仅用于查看专项补助资金的使用情况，不应查看学生普通钱包消费记录。");
    expect(html).toContain("执行到期未使用资金自动退回");
    expect(html).toContain("执行到期退回");
    expect(html).toContain("总发放金额");
    expect(html).toContain("已使用金额");
    expect(html).toContain("未使用金额");
    expect(html).toContain("退回金额");
    expect(html).toContain("学生补助账户");
    expect(html).toContain("张三");
    expect(html).toContain("李四");
    expect(html).toContain("商户白名单");
    expect(html).toContain("一食堂");
    expect(html).toContain("奶茶店");
    expect(html).toContain("专项补助交易审计");
    expect(html).toContain("学校资金池退回明细");
    expect(html).toContain("成功");
    expect(html).toContain("失败");
  });
});
