import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  mockContractRules,
  mockMerchants,
  mockStudentSubsidyAccounts,
  mockStudents,
  mockTransactionRecords
} from "../data/mockData";
import { evaluatePayment } from "../domain/ruleEngine";
import type {
  ContractRule,
  Merchant,
  PaymentRequest,
  PaymentResult,
  Student,
  StudentSubsidyAccount,
  TransactionRecord
} from "../types";

interface SubsidyState {
  students: Student[];
  merchants: Merchant[];
  rules: ContractRule[];
  subsidyAccounts: StudentSubsidyAccount[];
  transactions: TransactionRecord[];
}

interface SubsidyContextValue extends SubsidyState {
  submitPayment: (request: PaymentRequest) => PaymentResult;
  resetDemoData: () => void;
}

const STORAGE_KEY = "campus-subsidy-demo-store";

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const createInitialState = (): SubsidyState => ({
  students: clone(mockStudents),
  merchants: clone(mockMerchants),
  rules: clone(mockContractRules),
  subsidyAccounts: clone(mockStudentSubsidyAccounts),
  transactions: clone(mockTransactionRecords)
});

const loadInitialState = (): SubsidyState => {
  if (typeof window === "undefined") {
    return createInitialState();
  }

  const savedState = window.localStorage.getItem(STORAGE_KEY);
  if (!savedState) {
    return createInitialState();
  }

  try {
    return JSON.parse(savedState) as SubsidyState;
  } catch {
    return createInitialState();
  }
};

const saveState = (state: SubsidyState) => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
};

const clearSavedState = () => {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(STORAGE_KEY);
  }
};

const SubsidyContext = createContext<SubsidyContextValue | null>(null);

export function SubsidyProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SubsidyState>(() => loadInitialState());

  const value = useMemo<SubsidyContextValue>(
    () => ({
      ...state,
      submitPayment: (request) => {
        const result = evaluatePayment(request, {
          students: state.students,
          subsidyAccounts: state.subsidyAccounts,
          merchants: state.merchants,
          rules: state.rules,
          transactions: state.transactions
        });

        const nextState: SubsidyState = {
          ...state,
          subsidyAccounts: result.updatedAccount
            ? state.subsidyAccounts.map((account) =>
                account.accountId === result.updatedAccount?.accountId ? result.updatedAccount : account
              )
            : state.subsidyAccounts,
          transactions: [result.transaction, ...state.transactions]
        };

        setState(nextState);
        saveState(nextState);
        return result;
      },
      resetDemoData: () => {
        const initialState = createInitialState();
        clearSavedState();
        setState(initialState);
      }
    }),
    [state]
  );

  return <SubsidyContext.Provider value={value}>{children}</SubsidyContext.Provider>;
}

export const useSubsidyStore = () => {
  const context = useContext(SubsidyContext);
  if (!context) {
    throw new Error("useSubsidyStore 必须在 SubsidyProvider 内使用");
  }
  return context;
};
