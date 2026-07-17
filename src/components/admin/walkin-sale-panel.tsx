"use client";

import { useState, useEffect, useMemo, useActionState } from "react";
import {
  X,
  Search,
  UserPlus,
  Sparkles,
  Shirt,
  ShoppingBag,
  ChevronLeft,
  Loader2,
  Minus,
  Plus,
  Check,
} from "lucide-react";
import {
  getCustomersAction,
  getCustomerDetailAction,
  createWalkInCustomerAction,
  updateCustomerProfileAction,
  addMeasurementAction,
  type WalkInCustomerFormState,
} from "@/lib/actions/customers";
import { getAvailableProductsAction } from "@/lib/actions/products";
import { createOrderAction } from "@/lib/actions/orders";
import type { AdminUser } from "@/types/user";
import { MEASUREMENT_FIELDS, type CustomerMeasurement } from "@/types/customer";
import { ImageUploader, type UploadedImage } from "@/components/products/image-uploader";
import { PRODUCT_SIZES, PRODUCT_SIZE_LABELS, type Product } from "@/types/product";
import type { DiscountType } from "@/types/order";

type VisitType = "CUSTOM" | "RENTAL" | "PURCHASE";

const VISIT_TYPES: { type: VisitType; label: string; description: string; icon: typeof Sparkles }[] = [
  {
    type: "CUSTOM",
    label: "Custom design",
    description: "Made-to-order — consultation, measurements, production",
    icon: Sparkles,
  },
  {
    type: "RENTAL",
    label: "Rental",
    description: "Existing gown — fitting, adjustments, measurements",
    icon: Shirt,
  },
  {
    type: "PURCHASE",
    label: "Straight purchase",
    description: "Ready-made, off the rack — no fitting needed",
    icon: ShoppingBag,
  },
];

// Step sequence per visit type. "Order" and "Payment" are shared endpoints
// every path converges on — only what happens before them differs.
const STEP_SEQUENCE: Record<VisitType, string[]> = {
  CUSTOM: ["customer", "consultation", "measurements", "payment"],
  RENTAL: ["customer", "consultation", "select-gown", "measurements", "order", "payment"],
  PURCHASE: ["customer", "order", "payment"],
};

const STEP_LABEL: Record<string, string> = {
  customer: "Customer",
  consultation: "Consultation",
  "select-gown": "Select gown",
  measurements: "Measurements",
  order: "Order",
  payment: "Payment",
};

// Measurement fields are all optional numeric values, entered as text so the
// field can be left blank rather than defaulting to 0.
type MeasurementValues = Partial<Record<keyof CustomerMeasurement, string>>;

function getPrice(p: Product): number {
  return p.purchasePrice ?? p.rentalPrice ?? 0;
}

interface OrderLine {
  key: string;
  product: Product;
  quantity: number;
  size: string;
}

export function WalkInSalePanel({ onClose }: { onClose: () => void }) {
  const [visitType, setVisitType] = useState<VisitType | null>(null);
  const [stepIndex, setStepIndex] = useState(0);

  // ── Real customer data ──────────────────────────────────────────────────
  const [customers, setCustomers] = useState<AdminUser[]>([]);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [customersError, setCustomersError] = useState<string | null>(null);

  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<AdminUser | null>(null);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);

  const [adminNotes, setAdminNotes] = useState("");

  // Design reference images: images already on the customer's profile
  // (fetched once a customer is selected) plus anything newly uploaded
  // during this visit. Kept separate so a save only ever adds to a
  // customer's history, never silently drops earlier uploads.
  const [existingDesignImages, setExistingDesignImages] = useState<UploadedImage[]>([]);
  const [existingImagesLoading, setExistingImagesLoading] = useState(false);
  const [newDesignImages, setNewDesignImages] = useState<UploadedImage[]>([]);
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Measurements — saved as a new measurement set (addMeasurementAction),
  // matching how measurements are recorded elsewhere: each visit creates a
  // new snapshot rather than editing a previous one.
  const [measurementValues, setMeasurementValues] = useState<MeasurementValues>({});
  const [measurementNotes, setMeasurementNotes] = useState("");
  const [savingMeasurements, setSavingMeasurements] = useState(false);
  const [measurementsSaved, setMeasurementsSaved] = useState(false);
  const [measurementError, setMeasurementError] = useState<string | null>(null);

  // ── Order step ───────────────────────────────────────────────────────────
  // NOTE: backend's OrderItemRequest.productId is @NotNull — every order
  // line must reference a real, already-existing Product row with real
  // stock. That's fine for PURCHASE/RENTAL (picking an existing gown), but
  // CUSTOM visits have no product yet — the piece doesn't exist until it's
  // made. So CUSTOM gets an honest explanatory state here instead of a
  // product picker that can't actually submit anything real. See handoff
  // notes for what a real fix would need (a placeholder/custom Product row,
  // priced later).
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [orderItems, setOrderItems] = useState<OrderLine[]>([]);
  const [fulfillmentMethod, setFulfillmentMethod] = useState("PICKUP");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [orderNotes, setOrderNotes] = useState("");
  const [discountType, setDiscountType] = useState<DiscountType | "">("");
  const [discountValue, setDiscountValue] = useState("");
  const [discountReason, setDiscountReason] = useState("");
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  // New-customer form — real server action, same one used in the Users page
  const [newCustomerState, newCustomerFormAction] = useActionState<WalkInCustomerFormState, FormData>(
    createWalkInCustomerAction,
    null,
  );

  useEffect(() => {
    let cancelled = false;
    async function loadCustomers() {
      setCustomersLoading(true);
      const result = await getCustomersAction();
      if (cancelled) return;
      if (result.success) {
        // Only active customers make sense to sell to at the counter
        setCustomers(result.data.filter((c) => c.active));
        setCustomersError(null);
      } else {
        setCustomersError(result.message);
      }
      setCustomersLoading(false);
    }
    loadCustomers();
    return () => {
      cancelled = true;
    };
  }, []);

  // When a new customer is successfully created, select them and drop back
  // into the search view so the flow can continue.
  useEffect(() => {
    if (newCustomerState?.success && newCustomerState.customer) {
      setCustomers((prev) => [newCustomerState.customer!, ...prev]);
      setSelectedCustomer(newCustomerState.customer);
      setShowNewCustomerForm(false);
    }
  }, [newCustomerState]);

  // Whenever the selected customer changes, load their existing design
  // reference images so uploads here merge instead of overwrite.
  useEffect(() => {
    if (!selectedCustomer) {
      setExistingDesignImages([]);
      setNewDesignImages([]);
      return;
    }
    let cancelled = false;
    async function loadDetail() {
      setExistingImagesLoading(true);
      const result = await getCustomerDetailAction(selectedCustomer!.id);
      if (cancelled) return;
      if (result.success) {
        setExistingDesignImages(
          result.data.designImageUrls.map((url) => ({ id: url, url, publicId: null })),
        );
      }
      setExistingImagesLoading(false);
    }
    loadDetail();
    return () => {
      cancelled = true;
    };
  }, [selectedCustomer]);

  // Load products once the Order step for a PURCHASE/RENTAL visit is
  // actually reached, rather than on panel open — no point fetching the
  // whole catalog for a CUSTOM visit that can't use it, or before the admin
  // has even picked a visit type.
  const steps = visitType ? STEP_SEQUENCE[visitType] : [];
  const currentStep = steps[stepIndex];
  const needsProducts = currentStep === "order" && visitType !== "CUSTOM";

  useEffect(() => {
    if (!needsProducts || products.length > 0 || productsLoading) return;
    let cancelled = false;
    async function loadProducts() {
      setProductsLoading(true);
      const result = await getAvailableProductsAction();
      if (cancelled) return;
      if (result.success) {
        setProducts(result.data);
        setProductsError(null);
      } else {
        setProductsError(result.message);
      }
      setProductsLoading(false);
    }
    loadProducts();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsProducts]);

  const filteredCustomers = customers.filter((c) =>
    `${c.firstName} ${c.lastName} ${c.phone ?? ""}`.toLowerCase().includes(customerSearch.toLowerCase()),
  );

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.category?.name?.toLowerCase().includes(q),
    );
  }, [products, productSearch]);

  const subtotal = orderItems.reduce((sum, i) => sum + i.quantity * getPrice(i.product), 0);
  const discountAmount =
    discountType === "PERCENTAGE"
      ? (subtotal * (Number(discountValue) || 0)) / 100
      : discountType === "FIXED"
        ? Number(discountValue) || 0
        : 0;
  const orderTotal = Math.max(subtotal - discountAmount, 0);

  function setMeasurementField(key: keyof CustomerMeasurement, value: string) {
    setMeasurementValues((prev) => ({ ...prev, [key]: value }));
  }

  function toggleProduct(product: Product) {
    setOrderItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) return prev.filter((i) => i.product.id !== product.id);
      return [...prev, { key: crypto.randomUUID(), product, quantity: 1, size: "" }];
    });
  }

  function updateItemQuantity(key: string, delta: number) {
    setOrderItems((prev) =>
      prev.map((i) => (i.key === key ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i)),
    );
  }

  function updateItemSize(key: string, size: string) {
    setOrderItems((prev) => prev.map((i) => (i.key === key ? { ...i, size } : i)));
  }

  async function goNext() {
    // Leaving the consultation step: persist any newly uploaded design
    // images (merged with what the customer already had) before moving on.
    if (currentStep === "consultation" && selectedCustomer && newDesignImages.length > 0) {
      setSavingProfile(true);
      setSaveError(null);

      const mergedUrls = [...existingDesignImages, ...newDesignImages].map((img) => img.url);
      const formData = new FormData();
      formData.set("adminNotes", adminNotes);
      formData.set("designImageUrls", JSON.stringify(mergedUrls));

      const result = await updateCustomerProfileAction(selectedCustomer.id, formData);
      setSavingProfile(false);

      if (!result.success) {
        setSaveError(result.message || "Could not save design images. Try again before continuing.");
        return;
      }

      // Fold the newly uploaded set into "existing" now that it's saved,
      // so re-visiting this step doesn't try to re-save the same images.
      setExistingDesignImages((prev) => [...prev, ...newDesignImages]);
      setNewDesignImages([]);
    }

    // Leaving the measurements step: save the entered set as a new
    // measurement snapshot for this customer, once, if there's anything
    // to save and it hasn't already been saved.
    if (currentStep === "measurements" && selectedCustomer && !measurementsSaved) {
      const hasAnyValue = Object.values(measurementValues).some((v) => v && v.trim() !== "");
      if (hasAnyValue) {
        setSavingMeasurements(true);
        setMeasurementError(null);

        const formData = new FormData();
        for (const { key } of MEASUREMENT_FIELDS) {
          formData.set(key, measurementValues[key] ?? "");
        }
        formData.set("notes", measurementNotes);

        const result = await addMeasurementAction(selectedCustomer.id, null, formData);
        setSavingMeasurements(false);

        if (!result?.success) {
          setMeasurementError(result?.message || "Could not save measurements. Try again before continuing.");
          return;
        }
        setMeasurementsSaved(true);
      }
    }

    // Leaving the order step: create the real order via createOrderAction.
    // Only applies to PURCHASE/RENTAL (see needsProducts note above) — for
    // CUSTOM there's nothing to submit yet, so this is skipped entirely and
    // the flow just moves on to the (still placeholder) Payment step.
    if (currentStep === "order" && visitType !== "CUSTOM" && !createdOrderId && selectedCustomer) {
      if (orderItems.length === 0) {
        setOrderError("Add at least one item before continuing.");
        return;
      }

      setCreatingOrder(true);
      setOrderError(null);

      const formData = new FormData();
      formData.set(
        "itemsJson",
        JSON.stringify(
          orderItems.map((i) => ({
            productId: i.product.id,
            quantity: i.quantity,
            ...(i.size ? { size: i.size } : {}),
          })),
        ),
      );
      formData.set("customerId", selectedCustomer.id);
      formData.set("orderMode", "WALK_IN");
      formData.set("fulfillmentMethod", fulfillmentMethod);
      formData.set("paymentMethod", paymentMethod);
      formData.set("notes", orderNotes);
      formData.set("customerPhone", selectedCustomer.phone ?? "");
      if (discountType) {
        formData.set("discountType", discountType);
        formData.set("discountValue", discountValue);
        formData.set("discountReason", discountReason);
      }

      const result = await createOrderAction(null, formData);
      setCreatingOrder(false);

      if (!result?.success) {
        setOrderError(result?.message || "Could not create the order. Try again before continuing.");
        return;
      }
      setCreatedOrderId(result.orderId ?? null);
    }

    if (stepIndex < steps.length - 1) setStepIndex((i) => i + 1);
  }

  function goBack() {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
    else setVisitType(null); // back out of the whole flow to the entry screen
  }

  const canContinueCustomer = selectedCustomer !== null;
  const isBusy = savingProfile || savingMeasurements || creatingOrder;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl bg-card shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <p className="font-heading text-base font-medium text-foreground">New walk-in sale</p>
            {visitType && (
              <p className="text-xs text-muted-foreground">
                {VISIT_TYPES.find((v) => v.type === visitType)?.label}
              </p>
            )}
          </div>
          <button
            aria-label="Close"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-primary/5"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step indicator: dot-and-line, only current + next carry a label */}
        {visitType && (
          <div className="flex items-center border-b border-border px-5 py-4">
            {steps.map((step, i) => {
              const isCurrent = i === stepIndex;
              const isNext = i === stepIndex + 1;
              const isDone = i < stepIndex;
              const showLabel = isCurrent || isNext;

              return (
                <div key={step} className={`flex items-center ${i < steps.length - 1 ? "flex-1" : ""}`}>
                  <button
                    onClick={() => i <= stepIndex && setStepIndex(i)}
                    disabled={i > stepIndex}
                    className="flex flex-col items-center gap-1.5"
                  >
                    <span
                      className={`flex items-center justify-center rounded-full transition-all ${
                        isCurrent
                          ? "h-3 w-3 bg-primary ring-4 ring-primary/15"
                          : isDone
                            ? "h-2 w-2 bg-primary"
                            : "h-2 w-2 border border-muted-foreground/40 bg-transparent"
                      }`}
                    />
                    {showLabel && (
                      <span
                        className={`whitespace-nowrap text-[10px] font-medium ${
                          isCurrent ? "text-foreground" : "text-muted-foreground/60"
                        }`}
                      >
                        {STEP_LABEL[step]}
                      </span>
                    )}
                  </button>
                  {i < steps.length - 1 && (
                    <div
                      className={`mx-1 h-px flex-1 transition-colors ${
                        i < stepIndex ? "bg-primary/40" : "bg-border"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {/* Entry screen */}
          {!visitType && (
            <div className="flex flex-col gap-2.5">
              <p className="mb-1 text-xs text-muted-foreground">What&apos;s this visit for?</p>
              {VISIT_TYPES.map(({ type, label, description, icon: Icon }) => (
                <button
                  key={type}
                  onClick={() => {
                    setVisitType(type);
                    setStepIndex(0);
                  }}
                  className="flex items-start gap-3 rounded-xl border border-border p-3.5 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Customer step */}
          {currentStep === "customer" && (
            <div className="flex flex-col gap-4">
              {!showNewCustomerForm && (
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    placeholder="Search by name or phone..."
                    className="w-full rounded-lg border border-border bg-transparent py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              )}

              {!showNewCustomerForm && (
                <div className="flex flex-col gap-1.5">
                  {customersLoading && (
                    <div className="flex items-center justify-center gap-2 py-6 text-xs text-muted-foreground">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Loading customers...
                    </div>
                  )}

                  {!customersLoading && customersError && (
                    <p className="py-2 text-center text-xs text-destructive">{customersError}</p>
                  )}

                  {!customersLoading &&
                    !customersError &&
                    filteredCustomers.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedCustomer(c)}
                        className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-colors ${
                          selectedCustomer?.id === c.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/40"
                        }`}
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {c.firstName} {c.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">{c.phone ?? c.email}</p>
                        </div>
                        {selectedCustomer?.id === c.id && (
                          <span className="text-[11px] font-medium text-primary">Selected</span>
                        )}
                      </button>
                    ))}

                  {!customersLoading && !customersError && filteredCustomers.length === 0 && customerSearch && (
                    <p className="py-2 text-center text-xs text-muted-foreground">
                      No matches for &quot;{customerSearch}&quot;
                    </p>
                  )}

                  {!customersLoading && !customersError && customers.length === 0 && !customerSearch && (
                    <p className="py-2 text-center text-xs text-muted-foreground">No customers yet.</p>
                  )}

                  <button
                    onClick={() => {
                      setShowNewCustomerForm(true);
                      setSelectedCustomer(null);
                    }}
                    className="mt-1 flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2.5 text-xs font-medium text-primary hover:bg-primary/5"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    New customer
                  </button>
                </div>
              )}

              {showNewCustomerForm && (
                <form action={newCustomerFormAction} className="flex flex-col gap-3 rounded-lg border border-border p-3.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-foreground">New customer</p>
                    <button
                      type="button"
                      onClick={() => setShowNewCustomerForm(false)}
                      className="text-[11px] text-muted-foreground hover:text-foreground"
                    >
                      Search instead
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      name="firstName"
                      placeholder="First name"
                      required
                      className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    />
                    <input
                      name="lastName"
                      placeholder="Last name"
                      required
                      className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                  <input
                    name="phone"
                    placeholder="Phone"
                    className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                  <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    required
                    className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />

                  {newCustomerState && !newCustomerState.success && (
                    <p className="text-xs text-destructive">{newCustomerState.message}</p>
                  )}

                  <button
                    type="submit"
                    className="rounded-lg bg-primary py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    Add customer
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Consultation step */}
          {currentStep === "consultation" && (
            <div className="flex flex-col gap-5">
              <div>
                <p className="mb-1.5 text-xs font-medium text-foreground">Notes</p>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                  placeholder="What did she describe wanting? Any details worth remembering for this order..."
                  className="w-full resize-none rounded-lg border border-border bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Saved to {selectedCustomer?.firstName ?? "this customer"}&apos;s profile permanently.
                </p>
              </div>

              <div>
                <p className="mb-1.5 text-xs font-medium text-foreground">Design references</p>

                {existingImagesLoading ? (
                  <div className="flex items-center gap-2 py-3 text-xs text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Loading existing references...
                  </div>
                ) : (
                  <>
                    {existingDesignImages.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-2">
                        {existingDesignImages.map((img) => (
                          <div key={img.id} className="h-16 w-16 overflow-hidden rounded-lg border border-border">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={img.url} alt="" className="h-full w-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                    <ImageUploader
                      images={newDesignImages}
                      onChange={setNewDesignImages}
                      name="newDesignImages"
                      uploadContext="custom-design"
                    />
                  </>
                )}

                {saveError && <p className="mt-2 text-xs text-destructive">{saveError}</p>}
              </div>
            </div>
          )}

          {/* Measurements step */}
          {currentStep === "measurements" && (
            <div className="flex flex-col gap-4">
              <p className="text-xs text-muted-foreground">
                Recorded as a new measurement set for{" "}
                {selectedCustomer?.firstName ?? "this customer"}. Leave any field blank if it wasn&apos;t taken.
              </p>

              <div className="grid grid-cols-2 gap-2.5">
                {MEASUREMENT_FIELDS.map(({ key, label }) => (
                  <div key={key}>
                    <label className="mb-1 block text-[11px] text-muted-foreground">{label}</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="999.99"
                      value={measurementValues[key] ?? ""}
                      onChange={(e) => setMeasurementField(key, e.target.value)}
                      placeholder="—"
                      className="w-full rounded-lg border border-border bg-transparent px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground">Notes</label>
                <textarea
                  value={measurementNotes}
                  onChange={(e) => setMeasurementNotes(e.target.value)}
                  rows={3}
                  placeholder="Anything the tailor should know about this fitting..."
                  className="w-full resize-none rounded-lg border border-border bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {measurementsSaved && (
                <p className="text-xs text-status-completed">Measurements saved.</p>
              )}
              {measurementError && <p className="text-xs text-destructive">{measurementError}</p>}
            </div>
          )}

          {/* Order step — PURCHASE / RENTAL only; CUSTOM has no "order" step
              (see STEP_SEQUENCE — nothing exists to order until the piece is
              made, so it's skipped entirely rather than shown as empty). */}
          {currentStep === "order" && visitType !== "CUSTOM" && (
            <div className="flex flex-col gap-4">
              {createdOrderId ? (
                <div className="flex flex-col items-center gap-2 rounded-xl border border-status-completed/30 bg-status-completed/5 py-6 text-center">
                  <Check className="h-5 w-5 text-status-completed" />
                  <p className="text-sm font-medium text-status-completed">Order created.</p>
                  <p className="text-[11px] text-muted-foreground">
                    Order #{createdOrderId.slice(0, 8).toUpperCase()}
                  </p>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Search dresses, jewelry..."
                      className="w-full rounded-lg border border-border bg-transparent py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  {productsLoading && (
                    <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Loading products...
                    </div>
                  )}
                  {!productsLoading && productsError && (
                    <p className="py-2 text-center text-xs text-destructive">{productsError}</p>
                  )}

                  {!productsLoading && !productsError && productSearch.trim().length > 0 && (
                    <div className="max-h-44 overflow-y-auto rounded-lg border border-border">
                      {filteredProducts.map((p) => {
                        const isSelected = orderItems.some((i) => i.product.id === p.id);
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => toggleProduct(p)}
                            className={`flex w-full items-center justify-between gap-2 border-b border-border px-3 py-2.5 text-left last:border-b-0 transition-colors ${
                              isSelected ? "bg-primary/10" : "hover:bg-primary/5"
                            }`}
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-foreground">{p.name}</p>
                              {p.category?.name && (
                                <p className="truncate text-xs text-muted-foreground">{p.category.name}</p>
                              )}
                            </div>
                            <p className="shrink-0 text-xs text-muted-foreground">
                              Rs {getPrice(p).toLocaleString("en-LK")}
                            </p>
                          </button>
                        );
                      })}
                      {filteredProducts.length === 0 && (
                        <p className="py-4 text-center text-xs text-muted-foreground">No products found.</p>
                      )}
                    </div>
                  )}

                  {orderItems.length > 0 && (
                    <div className="flex flex-col gap-2.5">
                      {orderItems.map((item) => (
                        <div key={item.key} className="rounded-lg border border-border p-3">
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <p className="min-w-0 truncate text-sm font-medium text-foreground">
                              {item.product.name}
                            </p>
                            <div className="flex shrink-0 items-center gap-1">
                              <button
                                type="button"
                                onClick={() => updateItemQuantity(item.key, -1)}
                                className="flex h-6 w-6 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-primary/5"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-5 text-center text-sm tabular-nums text-foreground">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateItemQuantity(item.key, 1)}
                                className="flex h-6 w-6 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-primary/5"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                          {item.product.type === "DRESS" && (
                            <div className="flex flex-wrap gap-1.5">
                              {PRODUCT_SIZES.map((size) => (
                                <button
                                  key={size}
                                  type="button"
                                  onClick={() => updateItemSize(item.key, size)}
                                  className={`rounded-md border px-2 py-1 text-[11px] transition-colors ${
                                    item.size === size
                                      ? "border-primary bg-primary/10 text-primary"
                                      : "border-border text-muted-foreground hover:border-muted-foreground"
                                  }`}
                                >
                                  {PRODUCT_SIZE_LABELS[size]}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2.5 border-t border-border pt-3.5">
                    <div>
                      <label className="mb-1 block text-[11px] text-muted-foreground">Fulfillment</label>
                      <select
                        value={fulfillmentMethod}
                        onChange={(e) => setFulfillmentMethod(e.target.value)}
                        className="w-full rounded-lg border border-border bg-transparent px-2.5 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
                      >
                        <option value="PICKUP">Pickup</option>
                        <option value="DELIVERY">Delivery</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] text-muted-foreground">Payment method</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full rounded-lg border border-border bg-transparent px-2.5 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
                      >
                        <option value="CASH">Cash</option>
                        <option value="PAYHERE">PayHere</option>
                      </select>
                    </div>
                  </div>

                  {fulfillmentMethod === "DELIVERY" && (
                    <p className="text-[11px] text-muted-foreground">
                      Delivery address comes from {selectedCustomer?.firstName ?? "the customer"}&apos;s
                      profile — update it on their customer page if it&apos;s missing or wrong.
                    </p>
                  )}

                  <div>
                    <label className="mb-1 block text-[11px] text-muted-foreground">Notes</label>
                    <input
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      className="w-full rounded-lg border border-border bg-transparent px-2.5 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] text-muted-foreground">Discount (optional)</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(["", "PERCENTAGE", "FIXED"] as const).map((type) => (
                        <button
                          key={type || "none"}
                          type="button"
                          onClick={() => {
                            setDiscountType(type);
                            setDiscountValue("");
                          }}
                          className={`rounded-lg border px-2 py-1.5 text-[11px] font-medium transition-colors ${
                            discountType === type
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:border-muted-foreground"
                          }`}
                        >
                          {type === "" ? "None" : type === "PERCENTAGE" ? "Percent" : "Fixed"}
                        </button>
                      ))}
                    </div>
                    {discountType && (
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          step="0.01"
                          value={discountValue}
                          onChange={(e) => setDiscountValue(e.target.value)}
                          placeholder={discountType === "PERCENTAGE" ? "e.g. 10 (%)" : "e.g. 2000 (Rs)"}
                          className="rounded-lg border border-border bg-transparent px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
                        />
                        <input
                          value={discountReason}
                          onChange={(e) => setDiscountReason(e.target.value)}
                          placeholder="Reason"
                          className="rounded-lg border border-border bg-transparent px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
                        />
                      </div>
                    )}
                  </div>

                  <div className="rounded-lg border border-dashed border-border p-3 font-mono text-sm">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span className="text-foreground">Rs {subtotal.toLocaleString("en-LK")}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>Discount</span>
                        <span className="text-destructive">
                          −Rs {discountAmount.toLocaleString("en-LK")}
                        </span>
                      </div>
                    )}
                    <div className="mt-2 flex items-center justify-between border-t border-dashed border-border pt-2 text-base font-semibold">
                      <span className="text-foreground">Total</span>
                      <span className="text-foreground">Rs {orderTotal.toLocaleString("en-LK")}</span>
                    </div>
                  </div>

                  {orderError && <p className="text-xs text-destructive">{orderError}</p>}
                </>
              )}
            </div>
          )}

          {/* Placeholder for not-yet-built steps */}
          {currentStep && !["customer", "consultation", "measurements", "order"].includes(currentStep) && (
            <div className="flex h-full items-center justify-center py-16">
              <p className="text-xs text-muted-foreground">
                &quot;{STEP_LABEL[currentStep]}&quot; step — coming next.
              </p>
            </div>
          )}
        </div>

        {/* Footer nav */}
        {visitType && (
          <div className="flex items-center justify-between border-t border-border px-5 py-3.5">
            <button
              onClick={goBack}
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Back
            </button>
            <button
              onClick={goNext}
              disabled={(currentStep === "customer" && !canContinueCustomer) || isBusy}
              className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
            >
              {isBusy ? "Saving..." : "Continue"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}