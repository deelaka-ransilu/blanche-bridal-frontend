"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Category, CreateCategoryPayload } from "@/types";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/api/products";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  PencilEdit01Icon,
  Delete01Icon,
  Cancel01Icon,
  FloppyDiskIcon,
} from "@hugeicons/core-free-icons";

// Auto-generate slug from name
function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

interface CategoryFormState {
  name: string;
  slug: string;
  parentId: string;
}

const emptyForm: CategoryFormState = { name: "", slug: "", parentId: "" };

export default function AdminCategoriesPage() {
  const { data: session } = useSession();
  const token = session?.user?.backendToken;

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Add form
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<CategoryFormState>(emptyForm);
  const [addSaving, setAddSaving] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Edit form
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<CategoryFormState>(emptyForm);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete confirm
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // ── Add ──────────────────────────────────────────────────────────────────
  function handleAddNameChange(name: string) {
    setAddForm((f) => ({ ...f, name, slug: slugify(name) }));
  }

  async function handleAdd() {
    if (!addForm.name.trim() || !token) return;
    setAddSaving(true);
    setAddError(null);
    try {
      const payload: CreateCategoryPayload = {
        name: addForm.name.trim(),
        slug: addForm.slug.trim() || slugify(addForm.name),
        parentId: addForm.parentId || undefined,
      };
      await createCategory(payload, token);
      setAddForm(emptyForm);
      setShowAddForm(false);
      await load();
    } catch {
      setAddError("Failed to create category. Slug may already be taken.");
    } finally {
      setAddSaving(false);
    }
  }

  // ── Edit ─────────────────────────────────────────────────────────────────
  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setEditForm({
      name: cat.name,
      slug: cat.slug,
      parentId: cat.parentId ?? "",
    });
    setEditError(null);
  }

  function handleEditNameChange(name: string) {
    setEditForm((f) => ({ ...f, name, slug: slugify(name) }));
  }

  async function handleEditSave() {
    if (!editingId || !editForm.name.trim() || !token) return;
    setEditSaving(true);
    setEditError(null);
    try {
      await updateCategory(
        editingId,
        {
          name: editForm.name.trim(),
          slug: editForm.slug.trim(),
          parentId: editForm.parentId || undefined,
        },
        token,
      );
      setEditingId(null);
      await load();
    } catch {
      setEditError("Failed to save. Slug may already be taken.");
    } finally {
      setEditSaving(false);
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  async function handleDelete(id: string) {
    if (!token) return;
    setDeletingId(id);
    try {
      await deleteCategory(id, token);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setConfirmDeleteId(null);
    } catch {
      // Backend returns error if category has products
      setConfirmDeleteId(null);
      alert("Cannot delete — this category still has products assigned to it.");
    } finally {
      setDeletingId(null);
    }
  }

  // ── UI ────────────────────────────────────────────────────────────────────
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-6 gap-6">
          {/* Page header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Categories</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {categories.length} categories
              </p>
            </div>
            {!showAddForm && (
              <Button
                className="bg-amber-600 hover:bg-amber-700 text-white"
                onClick={() => {
                  setShowAddForm(true);
                  setAddForm(emptyForm);
                }}
              >
                <HugeiconsIcon icon={Add01Icon} className="size-4 mr-1.5" />
                Add category
              </Button>
            )}
          </div>

          {/* Add form */}
          {showAddForm && (
            <div className="bg-white rounded-xl border p-5 max-w-lg space-y-4">
              <p className="text-sm font-semibold text-gray-900">
                New category
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="add-name">Name *</Label>
                  <Input
                    id="add-name"
                    value={addForm.name}
                    onChange={(e) => handleAddNameChange(e.target.value)}
                    placeholder="e.g. Ball Gowns"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="add-slug">Slug *</Label>
                  <Input
                    id="add-slug"
                    value={addForm.slug}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, slug: e.target.value }))
                    }
                    placeholder="auto-generated"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="add-parent">Parent category</Label>
                <select
                  id="add-parent"
                  value={addForm.parentId}
                  onChange={(e) =>
                    setAddForm((f) => ({ ...f, parentId: e.target.value }))
                  }
                  className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                  <option value="">— Top level —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              {addError && <p className="text-xs text-red-500">{addError}</p>}
              <div className="flex gap-2">
                <Button
                  onClick={handleAdd}
                  disabled={addSaving || !addForm.name.trim()}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {addSaving ? "Creating…" : "Create"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setAddForm(emptyForm);
                    setAddError(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="rounded-xl border bg-white overflow-hidden max-w-3xl">
            {loading ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Loading…
              </div>
            ) : categories.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No categories yet.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-xs text-muted-foreground uppercase tracking-wide">
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Slug</th>
                    <th className="px-4 py-3 text-left">Parent</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {categories.map((cat) =>
                    editingId === cat.id ? (
                      // ── Inline edit row ──
                      <tr key={cat.id} className="bg-amber-50/40">
                        <td className="px-4 py-2">
                          <Input
                            value={editForm.name}
                            onChange={(e) =>
                              handleEditNameChange(e.target.value)
                            }
                            className="h-8 text-sm"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <Input
                            value={editForm.slug}
                            onChange={(e) =>
                              setEditForm((f) => ({
                                ...f,
                                slug: e.target.value,
                              }))
                            }
                            className="h-8 text-sm"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <select
                            value={editForm.parentId}
                            onChange={(e) =>
                              setEditForm((f) => ({
                                ...f,
                                parentId: e.target.value,
                              }))
                            }
                            className="rounded-md border border-input bg-white px-2 py-1 text-sm w-full"
                          >
                            <option value="">— Top level —</option>
                            {categories
                              .filter((c) => c.id !== cat.id)
                              .map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.name}
                                </option>
                              ))}
                          </select>
                          {editError && (
                            <p className="text-xs text-red-500 mt-1">
                              {editError}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-amber-700 hover:text-amber-800"
                              disabled={editSaving}
                              onClick={handleEditSave}
                            >
                              <HugeiconsIcon
                                icon={FloppyDiskIcon}
                                className="size-4"
                              />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground"
                              onClick={() => setEditingId(null)}
                            >
                              <HugeiconsIcon
                                icon={Cancel01Icon}
                                className="size-4"
                              />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      // ── Read row ──
                      <tr
                        key={cat.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {cat.name}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                          {cat.slug}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {cat.parentName ?? (
                            <span className="text-xs italic">Top level</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-amber-700"
                              onClick={() => startEdit(cat)}
                            >
                              <HugeiconsIcon
                                icon={PencilEdit01Icon}
                                className="size-4"
                              />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600"
                              onClick={() => setConfirmDeleteId(cat.id)}
                            >
                              <HugeiconsIcon
                                icon={Delete01Icon}
                                className="size-4"
                              />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </SidebarInset>

      {/* Delete confirm dialog */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setConfirmDeleteId(null)}
          />
          <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              Delete category?
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              If any products are assigned to this category, the delete will be
              blocked. You'll need to reassign them first.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setConfirmDeleteId(null)}
              >
                Cancel
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={deletingId === confirmDeleteId}
                onClick={() => handleDelete(confirmDeleteId)}
              >
                {deletingId === confirmDeleteId ? "Deleting…" : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </SidebarProvider>
  );
}
