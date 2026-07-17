"use client";

import { Button } from "@/components/ui/button";
import { deactivateEmployeeAction, activateEmployeeAction } from "@/lib/actions/employees";

export function EmployeeStatusButton({ employeeId, active }: { employeeId: string; active: boolean }) {
  const action = active ? deactivateEmployeeAction : activateEmployeeAction;

  return (
    <form action={action.bind(null, employeeId)}>
      <Button type="submit" size="sm" variant={active ? "outline" : "default"}>
        {active ? "Deactivate" : "Activate"}
      </Button>
    </form>
  );
}