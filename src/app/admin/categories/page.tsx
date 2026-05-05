"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Category, CreateCategoryPayload } from "@/types";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getDeletedCategories,
  restoreCategory,
} from "@/lib/api/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  PencilEdit01Icon,
  Delete01Icon,
} from "@hugeicons/core-free-icons";

// ── Helpers ───────────────────────────────────────────────────────────────────

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

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminCategoriesPage() {
  const { data: session, status } = useSession();
  const token = session?.user?.backendToken;

  // ── State ─────────────────────────────────────────────────────────────────
  const [tab, setTab] = useState<"active" | "deleted">("active");

  const [categories, setCategories] = useState<Category[]>([]);
  const [deletedCategories, setDeletedCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Add
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<CategoryFormState>(emptyForm);
  const [addSaving, setAddSaving] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<CategoryFormState>(emptyForm);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Restore
  const [restoringId, setRestoringId] = useState<string | null>(null);

  // ── Data loading ──────────────────────────────────────────────────────────

  async function loadActive() {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadDeleted() {
    if (!token) return;
    setLoading(true);
    try {
      const res = await getDeletedCategories(token);
      if (res.success) setDeletedCategories(res.data ?? []);
    } catch (err) {
      console.error("Failed to load deleted categories:", err);
    } finally {
      setLoading(false);
    }
  }

  // Load active on mount
  useEffect(() => {
    if (status === "authenticated") loadActive();
  }, [status]);

  // Load deleted when tab switches to deleted
  useEffect(() => {
    if (tab === "deleted" && status === "authenticated") loadDeleted();
  }, [tab, status]);

  // ── Add ───────────────────────────────────────────────────────────────────

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
      await loadActive();
    } catch {
      setAddError("Failed to create category. Slug may already be taken.");
    } finally {
      setAddSaving(false);
    }
  }

  // ── Edit ──────────────────────────────────────────────────────────────────

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setEditForm({ name: cat.name, slug: cat.slug, parentId: cat.parentId ?? "" });
    setEditError(null);
  }

  function handleEditNameChange(name: string) {
    setEditForm((f) => ({
      ...f,
      name,
      slug: f.slug === slugify(f.name) ? slugify(name) : f.slug,
    }));
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
      await loadActive();
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
      setConfirmDeleteId(null);
      alert("Cannot delete — this category still has products assigned.");
    } finally {
      setDeletingId(null);
    }
  }

  // ── Restore ───────────────────────────────────────────────────────────────

  async function handleRestore(id: string) {
    if (!token) return;
    setRestoringId(id);
    try {
      await restoreCategory(id, token);
      setDeletedCategories((prev) => prev.filter((c) => c.id !== id));
    } catch {
      console.error("Restore failed");
    } finally {
      setRestoringId(null);
    }
  }

  // ── UI ────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-1 flex-col p-6 gap-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Categories</h2>
          <p className="text-sm text-muted-foreground">
            {categories.length} active
            {deletedCategories.length > 0 && `, ${deletedCategories.length} deleted`}
          </p>
        </div>
        {!showAddForm && tab === "active" && (
          <Button
            disabled={!token}
            className="bg-amber-600 hover:bg-amber-700 text-white"
            onClick={() => { setShowAddForm(true); setAddForm(emptyForm); }}
          >
            <HugeiconsIcon icon={Add01Icon} className="size-4 mr-1.5" />
            Add category
          </Button>
        )}
      </div>

      {/* Add form */}
      {showAddForm && (
        <div className="bg-white rounded-xl border p-5 max-w-lg space-y-4">
          <p className="text-sm font-semibold">New category</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Name *</Label>
              <Input
                value={addForm.name}
                onChange={(e) => handleAddNameChange(e.target.value)}
              />
            </div>
            <div>
              <Label>Slug *</Label>
              <Input
                value={addForm.slug}
                onChange={(e) => setAddForm((f) => ({ ...f, slug: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <Label>Parent</Label>
            <select
              value={addForm.parentId}
              onChange={(e) => setAddForm((f) => ({ ...f, parentId: e.target.value }))}
              className="w-full border rounded-md px-3 py-2 text-sm"
            >
              <option value="">Top level</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          {addError && <p className="text-xs text-red-500">{addError}</p>}
          <div className="flex gap-2">
            <Button
              onClick={handleAdd}
              disabled={!addForm.name.trim() || addSaving || !token}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {addSaving ? "Creating…" : "Create"}
            </Button>
            <Button variant="outline" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200">
        {(["active", "deleted"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${
              tab === t
                ? "border-amber-600 text-amber-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t}
            {t === "deleted" && deletedCategories.length > 0 && (
              <span className="ml-2 bg-red-100 text-red-600 text-xs px-1.5 py-0.5 rounded-full">
                {deletedCategories.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-white overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 rounded-full border-2 border-amber-600 border-t-transparent animate-spin" />
          </div>
        ) : tab === "active" ? (
          categories.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No categories yet.
            </div>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id} className="border-b hover:bg-gray-50">

                    {/* Inline edit row */}
                    {editingId === cat.id ? (
                      <td colSpan={4} className="px-4 py-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <Input
                            value={editForm.name}
                            onChange={(e) => handleEditNameChange(e.target.value)}
                            className="w-40"
                            placeholder="Name"
                          />
                          <Input
                            value={editForm.slug}
                            onChange={(e) =>
                              setEditForm((f) => ({ ...f, slug: e.target.value }))
                            }
                            className="w-40"
                            placeholder="Slug"
                          />
                          <select
                            value={editForm.parentId}
                            onChange={(e) =>
                              setEditForm((f) => ({ ...f, parentId: e.target.value }))
                            }
                            className="border rounded-md px-3 py-2 text-sm"
                          >
                            <option value="">Top level</option>
                            {categories
                              .filter((c) => c.id !== cat.id)
                              .map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                          </select>
                          <Button
                            size="sm"
                            onClick={handleEditSave}
                            disabled={editSaving}
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                          >
                            {editSaving ? "Saving…" : "Save"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingId(null)}
                          >
                            Cancel
                          </Button>
                          {editError && (
                            <p className="text-xs text-red-500 w-full">{editError}</p>
                          )}
                        </div>
                      </td>
                    ) : (
                      <>
                        <td className="px-4 py-3 font-medium">{cat.name}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{cat.slug}</td>
                        <td className="px-4 py-3 text-gray-600">{cat.parentName ?? "Top level"}</td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEdit(cat)}
                          >
                            <HugeiconsIcon icon={PencilEdit01Icon} />
                          </Button>

                          {confirmDeleteId === cat.id ? (
                            <span className="inline-flex items-center gap-1 ml-1">
                              <span className="text-xs text-gray-500">Sure?</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(cat.id)}
                                disabled={deletingId === cat.id}
                                className="text-red-600 hover:bg-red-50 h-7 px-2 text-xs"
                              >
                                {deletingId === cat.id ? "…" : "Yes"}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setConfirmDeleteId(null)}
                                className="h-7 px-2 text-xs"
                              >
                                No
                              </Button>
                            </span>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setConfirmDeleteId(cat.id)}
                            >
                              <HugeiconsIcon icon={Delete01Icon} />
                            </Button>
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : (
          // Deleted tab
          deletedCategories.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No deleted categories.
            </div>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {deletedCategories.map((cat) => (
                  <tr key={cat.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-400 font-medium">{cat.name}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{cat.slug}</td>
                    <td className="px-4 py-3 text-gray-400">{cat.parentName ?? "Top level"}</td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestore(cat.id)}
                        disabled={restoringId === cat.id}
                        className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                      >
                        {restoringId === cat.id ? "Restoring…" : "Restore"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>
    </div>
  );
}