import type { NavigationEntry } from "../types/navigation";

export const navigationEntries: NavigationEntry[] = [
  {
    id: "student-wallet",
    title: "学生钱包",
    description: "查看学生补助余额与钱包信息",
    href: "#student-wallet"
  },
  {
    id: "school-admin",
    title: "学校后台",
    description: "管理补助计划与资金使用情况",
    href: "#school-admin"
  },
  {
    id: "payment-simulator",
    title: "交易模拟",
    description: "模拟商户消费和规则判定流程",
    href: "#payment-simulator"
  }
];
