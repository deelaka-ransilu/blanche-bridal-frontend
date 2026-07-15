"use client";

import { useState, type ReactNode } from "react";

export function AdminUsersTabs({
  customersCount,
  employeesCount,
  customersContent,
  employeesContent,
  customerTrigger,
  employeeTrigger,
}: {
  customersCount: number;
  employeesCount: number;
  customersContent: ReactNode;
  employeesContent: ReactNode;
  customerTrigger: ReactNode;
  employeeTrigger: ReactNode;
}) {
  const [tab, setTab] = useState<"customers" | "employees">("customers");

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-heading text-xl font-medium text-foreground">Users</h1>
          <p className="text-[13px] text-muted-foreground">
            {customersCount} customers · {employeesCount} employees
          </p>
        </div>
        {tab === "customers" ? customerTrigger : null}
        {tab === "employees" ? employeeTrigger : null}
      </div>

      <div className="mb-5 flex gap-1.5 rounded-xl border border-border bg-card p-1">
        <button
          onClick={() => setTab("customers")}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            tab === "customers"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-primary/5"
          }`}
        >
          Customers <span className="opacity-70">· {customersCount}</span>
        </button>
        <button
          onClick={() => setTab("employees")}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            tab === "employees"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-primary/5"
          }`}
        >
          Employees <span className="opacity-70">· {employeesCount}</span>
        </button>
      </div>

      {tab === "customers" ? customersContent : employeesContent}
    </div>
  );
}