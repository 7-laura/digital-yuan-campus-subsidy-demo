import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import StudentWalletPage from "../pages/StudentWalletPage";
import { SubsidyProvider } from "../services/SubsidyContext";

describe("学生钱包页面", () => {
  it("展示张三基本信息、补助余额、使用规则和最近交易记录", () => {
    const html = renderToStaticMarkup(
      <SubsidyProvider>
        <StudentWalletPage />
      </SubsidyProvider>
    );

    expect(html).toContain("张三的专项补助钱包");
    expect(html).toContain("20260001");
    expect(html).toContain("wallet-student-zhangsan");
    expect(html).toContain("餐饮补贴");
    expect(html).toContain("300.00 元 / 300.00 元");
    expect(html).toContain("教材补贴");
    expect(html).toContain("100.00 元 / 100.00 元");
    expect(html).toContain("单笔 30.00 元");
    expect(html).toContain("校内书店");
    expect(html).toContain("奶茶店");
    expect(html).toContain("失败");
  });
});
