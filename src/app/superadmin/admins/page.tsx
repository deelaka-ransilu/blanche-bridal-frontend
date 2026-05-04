"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserAdd01Icon,
  Crown02Icon,
  ToggleOnIcon,
  ToggleOffIcon,
} from "@hugeicons/core-free-icons";
import {
  listAdmins,
  createAdmin,
  activateAdmin,
  deactivateAdmin,
} from "@/lib/api/auth";
import { User } from "@/types";

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  phone: "",
};

export default function SuperadminAdminsPage() {
  const { data: session } = useSession();
  const token = session?.user?.backendToken ?? "";

  const [admins, setAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    listAdmins(token).then((res) => {
      if (res.success && res.data) setAdmins(res.data);
      setLoading(false);
    });
  }, [token]);

  async function handleCreate() {
    if (!token) return;
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await createAdmin(token, {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
      });
      if (res.success && res.data) {
        setAdmins((prev) => [res.data!, ...prev]);
        setForm(EMPTY_FORM);
        setShowForm(false);
        toast.success("Admin created successfully.");
      } else {
        toast.error("Failed to create admin.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggle(admin: User) {
    if (!token) return;
    setActioningId(admin.id);
    try {
      const res = admin.isActive
        ? await deactivateAdmin(token, admin.id)
        : await activateAdmin(token, admin.id);
      if (res.success && res.data) {
        setAdmins((prev) =>
          prev.map((a) => (a.id === admin.id ? res.data! : a)),
        );
        toast.success(
          admin.isActive ? "Admin deactivated." : "Admin activated.",
        );
      }
    } catch {
      toast.error("Failed to update admin status.");
    } finally {
      setActioningId(null);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Admins</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage boutique administrator accounts.
          </p>
        </div>
        <Button
          className="bg-amber-600 hover:bg-amber-700 text-white"
          onClick={() => setShowForm((v) => !v)}
        >
          <HugeiconsIcon
            icon={UserAdd01Icon}
            strokeWidth={2}
            className="size-4 mr-2"
          />
          {showForm ? "Cancel" : "Add Admin"}
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <p className="text-sm font-medium text-gray-900">New Admin</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>First name *</Label>
                <Input
                  value={form.firstName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, firstName: e.target.value }))
                  }
                  placeholder="Nimasha"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Last name *</Label>
                <Input
                  value={form.lastName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, lastName: e.target.value }))
                  }
                  placeholder="Fernando"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  placeholder="nimasha@blanchebridal.lk"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Password *</Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                  placeholder="Temporary password"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  placeholder="+94 77 123 4567"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setForm(EMPTY_FORM);
                }}
              >
                Cancel
              </Button>
              <Button
                className="bg-amber-600 hover:bg-amber-700 text-white"
                onClick={handleCreate}
                disabled={submitting}
              >
                {submitting ? "Creating..." : "Create Admin"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admin list */}
      {loading ? (
        // ← CHANGED: just a small spinner instead of 3 skeleton boxes
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 rounded-full border-2 border-amber-600 border-t-transparent animate-spin" />
        </div>
      ) : admins.length === 0 ? (
        <div className="text-center py-16 space-y-2">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
            <HugeiconsIcon
              icon={Crown02Icon}
              strokeWidth={1.5}
              className="size-6 text-gray-400"
            />
          </div>
          <p className="font-medium text-gray-900">No admins yet</p>
          <p className="text-sm text-muted-foreground">
            Add your first admin to get started.
          </p>
        </div>
      ) : (
        <div className="bg-white border rounded-xl divide-y">
          {admins.map((admin) => (
            <div
              key={admin.id}
              className="flex items-center justify-between px-5 py-4 gap-4"
            >
              {/* Info */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <span className="text-xs font-semibold text-amber-700">
                    {admin.firstName[0]}{admin.lastName[0]}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {admin.firstName} {admin.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {admin.email}
                  </p>
                  {admin.phone && (
                    <p className="text-xs text-muted-foreground">
                      {admin.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Status + action */}
              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    admin.isActive
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {admin.isActive ? "Active" : "Inactive"}
                </span>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Joined{" "}
                  {new Date(admin.createdAt).toLocaleDateString("en-LK", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className={
                        admin.isActive
                          ? "text-red-600 border-red-200 hover:bg-red-50"
                          : "text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                      }
                      disabled={actioningId === admin.id}
                    >
                      <HugeiconsIcon
                        icon={admin.isActive ? ToggleOffIcon : ToggleOnIcon}
                        strokeWidth={2}
                        className="size-4 mr-1.5"
                      />
                      {admin.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {admin.isActive ? "Deactivate" : "Activate"}{" "}
                        {admin.firstName}?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {admin.isActive
                          ? `${admin.firstName} will lose access to the system immediately.`
                          : `${admin.firstName} will regain access to the system.`}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className={
                          admin.isActive
                            ? "bg-red-600 hover:bg-red-700 text-white"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white"
                        }
                        onClick={() => handleToggle(admin)}
                      >
                        Yes, {admin.isActive ? "Deactivate" : "Activate"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}