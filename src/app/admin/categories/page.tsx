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

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

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

const emptyForm: CategoryFormState = {
  name: "",
  slug: "",
  parentId: "",
};

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export default function AdminCategoriesPage() {
  const { data: session, status } = useSession();
  const token = session?.user?.backendToken;

  const [categories, setCategories] = useState<Category[]>([]);
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

  // ─────────────────────────────────────────────────────────────
  // Load data
  // ─────────────────────────────────────────────────────────────

  async function load() {
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

  useEffect(() => {
    if (status === "authenticated") {
      load();
    }
  }, [status]);

  // ─────────────────────────────────────────────────────────────
  // Add
  // ─────────────────────────────────────────────────────────────

  function handleAddNameChange(name: string) {
    setAddForm((f) => ({
      ...f,
      name,
      slug: slugify(name),
    }));
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

  // ─────────────────────────────────────────────────────────────
  // Edit
  // ─────────────────────────────────────────────────────────────

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
    setEditForm((f) => ({
      ...f,
      name,
      slug:
        f.slug === slugify(f.name) // only auto-update if user hasn't changed it
          ? slugify(name)
          : f.slug,
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
        token
      );

      setEditingId(null);
      await load();
    } catch {
      setEditError("Failed to save. Slug may already be taken.");
    } finally {
      setEditSaving(false);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Delete
  // ─────────────────────────────────────────────────────────────

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

  function handleConfirmDelete() {
    if (confirmDeleteId) {
      void handleDelete(confirmDeleteId);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────────────────────

  return (
      <div className="flex flex-1 flex-col p-6 gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Categories</h2>
            <p className="text-sm text-muted-foreground">
              {categories.length} categories
            </p>
          </div>

          {!showAddForm && (
            <Button
              disabled={!token}
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

        {/* Add Form */}
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
                  onChange={(e) =>
                    setAddForm((f) => ({ ...f, slug: e.target.value }))
                  }
                />
              </div>
            </div>

            <div>
              <Label>Parent</Label>
              <select
                value={addForm.parentId}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, parentId: e.target.value }))
                }
                className="w-full border rounded-md px-3 py-2 text-sm"
              >
                <option value="">Top level</option>
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
                disabled={!addForm.name.trim() || addSaving || !token}
              >
                {addSaving ? "Creating…" : "Create"}
              </Button>

              <Button
                variant="outline"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="rounded-xl border bg-white overflow-hidden">
          {loading ? (
            <div className="p-6 text-center text-sm">Loading…</div>
          ) : categories.length === 0 ? (
            <div className="p-6 text-center text-sm">No categories</div>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id} className="border-b">
                    <td className="px-4 py-3">{cat.name}</td>
                    <td className="px-4 py-3 text-xs">{cat.slug}</td>
                    <td className="px-4 py-3">
                      {cat.parentName ?? "Top level"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button onClick={() => startEdit(cat)}>Edit</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
  );
}