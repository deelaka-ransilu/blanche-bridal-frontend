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
  const { data: session, status } = useSession();
  const token = session?.user?.backendToken;

  const [tab, setTab] = useState<"active" | "deleted">("active");
  const [categories, setCategories] = useState<Category[]>([]);
  const [deletedCategories, setDeletedCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<CategoryFormState>(emptyForm);
  const [addSaving, setAddSaving] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<CategoryFormState>(emptyForm);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);

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

  useEffect(() => {
    if (status === "authenticated") loadActive();
  }, [status]);

  useEffect(() => {
    if (tab === "deleted" && status === "authenticated") loadDeleted();
  }, [tab, status]);

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
        { name: editForm.name.trim(), slug: editForm.slug.trim(), parentId: editForm.parentId || undefined },
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

  return (
    <div className="flex flex-1 flex-col p-4 sm:p-6 gap-4 sm:gap-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold">Categories</h2>
          <p className="text-sm text-muted-foreground">
            {categories.length} active
            {deletedCategories.length > 0 && `, ${deletedCategories.length} deleted`}
          </p>
        </div>
        {!showAddForm && tab === "active" && (
          <Button
            disabled={!token}
            className="bg-amber-600 hover:bg-amber-700 text-white shrink-0"
            onClick={() => { setShowAddForm(true); setAddForm(emptyForm); }}
          >
            <HugeiconsIcon icon={Add01Icon} className="size-4 mr-1.5" />
            <span className="hidden sm:inline">Add category</span>
            <span className="sm:hidden">Add</span>
          </Button>
        )}
      </div>

      {/* Add form */}
      {showAddForm && (
        <div className="bg-white rounded-xl border p-4 sm:p-5 space-y-4">
          <p className="text-sm font-semibold">New category</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            className={`px-3 sm:px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${
              tab === t
                ? "border-amber-600 text-amber-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t}
            {t === "deleted" && deletedCategories.length > 0 && (
              <span className="ml-1.5 bg-red-100 text-red-600 text-xs px-1.5 py-0.5 rounded-full">
                {deletedCategories.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
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
            <div className="divide-y">
              {categories.map((cat) => (
                <div key={cat.id}>
                  {/* Inline edit */}
                  {editingId === cat.id ? (
                    <div className="px-4 py-3 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          value={editForm.name}
                          onChange={(e) => handleEditNameChange(e.target.value)}
                          placeholder="Name"
                        />
                        <Input
                          value={editForm.slug}
                          onChange={(e) => setEditForm((f) => ({ ...f, slug: e.target.value }))}
                          placeholder="Slug"
                        />
                      </div>
                      <select
                        value={editForm.parentId}
                        onChange={(e) => setEditForm((f) => ({ ...f, parentId: e.target.value }))}
                        className="w-full border rounded-md px-3 py-2 text-sm"
                      >
                        <option value="">Top level</option>
                        {categories
                          .filter((c) => c.id !== cat.id)
                          .map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                      </select>
                      {editError && <p className="text-xs text-red-500">{editError}</p>}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleEditSave}
                          disabled={editSaving}
                          className="bg-amber-600 hover:bg-amber-700 text-white"
                        >
                          {editSaving ? "Saving…" : "Save"}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Normal row — stacks on mobile */
                    <div className="px-4 py-3 flex items-start sm:items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{cat.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {cat.slug}
                          {cat.parentName && (
                            <span className="ml-2 text-gray-400">· {cat.parentName}</span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="sm" onClick={() => startEdit(cat)}>
                          <HugeiconsIcon icon={PencilEdit01Icon} className="size-4" />
                        </Button>
                        {confirmDeleteId === cat.id ? (
                          <span className="inline-flex items-center gap-1">
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
                            <HugeiconsIcon icon={Delete01Icon} className="size-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        ) : (
          // Deleted tab
          deletedCategories.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No deleted categories.
            </div>
          ) : (
            <div className="divide-y">
              {deletedCategories.map((cat) => (
                <div key={cat.id} className="px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-400 truncate">{cat.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {cat.slug}
                      {cat.parentName && (
                        <span className="ml-2">· {cat.parentName}</span>
                      )}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRestore(cat.id)}
                    disabled={restoringId === cat.id}
                    className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 shrink-0"
                  >
                    {restoringId === cat.id ? "Restoring…" : "Restore"}
                  </Button>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}