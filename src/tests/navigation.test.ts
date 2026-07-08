import { describe, expect, it } from "vitest";
import { navigationEntries } from "../data/navigation";

describe("首页基础导航", () => {
  it("包含学生钱包、学校后台和交易模拟三个入口", () => {
    expect(navigationEntries.map((entry) => entry.title)).toEqual(["学生钱包", "学校后台", "交易模拟"]);
  });

  it("每个入口都有可访问的标题、说明和链接", () => {
    navigationEntries.forEach((entry) => {
      expect(entry.title.length).toBeGreaterThan(0);
      expect(entry.description.length).toBeGreaterThan(0);
      expect(entry.href).toMatch(/^#/);
    });
  });
});
