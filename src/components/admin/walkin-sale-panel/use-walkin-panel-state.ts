"use client";

import { useState, useEffect, useMemo, useActionState, useRef } from "react";
import {
  getCustomersAction,
  getCustomerDetailAction,
  createWalkInCustomerAction,
  type WalkInCustomerFormState,
} from "@/lib/actions/customers";
import { getAvailableProductsAction } from "@/lib/actions/products";
import { getRentableProductsAction } from "@/lib/actions/rentals";
import { getAvailableSlotsAction } from "@/lib/actions/appointments";
import type { AdminUser } from "@/types/user";
import type { CustomerMeasurement } from "@/types/customer";
import type { ImageUploaderHandle, UploadedImage } from "@/components/products/image-uploader";
import type { Product } from "@/types/product";
import type { RentableProduct } from "@/types/rental";
import type { DiscountType } from "@/types/order";
import type { OccasionType } from "@/types/appointment";
import { STEP_SEQUENCE, type VisitType, type MeasurementValues, type OrderLine } from "./types";
import { getRentalDays, getRentalFee, todayLocalDateString, addDaysLocal, getPrice } from "./utils";

/**
 * All state, data-loading effects, and derived values for the walk-in sale
 * panel — split out of the single WalkInSalePanel component so the
 * step components can stay presentational. Returns one big object; the
 * orchestrator (index.tsx) destructures what it needs and passes slices
 * down to each step.
 */
export function useWalkInPanelState() {
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
  const designImageUploaderRef = useRef<ImageUploaderHandle>(null);
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

  // ── Gown selection (RENTAL only) — lives inside the consultation step
  // rather than its own step. ─────────────────────────────────────────────
  const [rentableProducts, setRentableProducts] = useState<RentableProduct[]>([]);
  const [rentableLoading, setRentableLoading] = useState(false);
  const [rentableError, setRentableError] = useState<string | null>(null);
  const [gownSearch, setGownSearch] = useState("");
  const [selectedGown, setSelectedGown] = useState<RentableProduct | null>(null);
  const [rentalStart, setRentalStart] = useState("");
  const rentalEnd = rentalStart ? addDaysLocal(rentalStart, 1) : "";
  const [rentalPaymentMethod, setRentalPaymentMethod] = useState("CASH");
  // Booking-specific notes (special requests, why this gown/date range) —
  // separate from measurementNotes, which captures fit-check / alteration
  // notes taken during the actual fitting.
  const [rentalNotes, setRentalNotes] = useState("");
  const [creatingRental, setCreatingRental] = useState(false);
  const [rentalError, setRentalError] = useState<string | null>(null);

  const todayStr = useMemo(() => todayLocalDateString(), []);

  // ── Custom design request fields (CUSTOM only) ──────────────────────────
  const [occasionType, setOccasionType] = useState<OccasionType | "">("");
  const [occasionDate, setOccasionDate] = useState("");
  // Defaults to today — this is an admin walk-in flow (the customer is
  // physically in the store), so there's no reason to make the admin
  // re-pick a date that's always going to be today.
  const [consultationDate, setConsultationDate] = useState(todayStr); // appointmentDate
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [creatingCustomDesign, setCreatingCustomDesign] = useState(false);
  const [customDesignError, setCustomDesignError] = useState<string | null>(null);
  const [createdCustomDesignRequestId, setCreatedCustomDesignRequestId] = useState<string | null>(null);

  // ── Order step (PURCHASE only) ──────────────────────────────────────────
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

  const steps = visitType ? STEP_SEQUENCE[visitType] : [];
  const currentStep = steps[stepIndex];

  // Purchase-only product catalog — loaded once the Order step for a
  // PURCHASE visit is actually reached, rather than on panel open.
  const needsProducts = currentStep === "order" && visitType === "PURCHASE";

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

  // Rentable gowns — loaded once the consultation step is reached for a
  // RENTAL visit (gown picker lives inside that step).
  const needsRentableProducts = currentStep === "consultation" && visitType === "RENTAL";

  useEffect(() => {
    if (!needsRentableProducts || rentableProducts.length > 0 || rentableLoading) return;
    let cancelled = false;
    async function loadRentable() {
      setRentableLoading(true);
      const result = await getRentableProductsAction();
      if (cancelled) return;
      if (result.success) {
        setRentableProducts(result.data);
        setRentableError(null);
      } else {
        setRentableError(result.message);
      }
      setRentableLoading(false);
    }
    loadRentable();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsRentableProducts]);

  // Available consultation slots — loaded whenever a consultation date is
  // picked for a CUSTOM visit.
  useEffect(() => {
    if (!consultationDate || visitType !== "CUSTOM") return;
    let cancelled = false;
    async function loadSlots() {
      setSlotsLoading(true);
      setSelectedSlot("");
      const result = await getAvailableSlotsAction(consultationDate);
      if (cancelled) return;
      if (result.success) {
        setAvailableSlots(result.data);
      } else {
        setAvailableSlots([]);
      }
      setSlotsLoading(false);
    }
    loadSlots();
    return () => {
      cancelled = true;
    };
  }, [consultationDate, visitType]);

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

  const filteredGowns = useMemo(() => {
    const q = gownSearch.trim().toLowerCase();
    if (!q) return rentableProducts;
    return rentableProducts.filter(
      (p) => p.name.toLowerCase().includes(q) || p.categoryName?.toLowerCase().includes(q),
    );
  }, [rentableProducts, gownSearch]);

  const rentalDays = useMemo(() => getRentalDays(rentalStart, rentalEnd), [rentalStart, rentalEnd]);
  const rentalFee = useMemo(
    () => (selectedGown ? getRentalFee(selectedGown, rentalDays) : 0),
    [selectedGown, rentalDays],
  );

  // Past-start-date guard — mirrors the backend's @FutureOrPresent check on
  // CreateRentalBookingRequest.rentalStart, so the error surfaces before the
  // round-trip rather than only after.
  const isRentalStartInPast = rentalStart !== "" && rentalStart < todayStr;

  const isRentalGownStepValid =
    selectedGown !== null &&
    rentalStart !== "" &&
    rentalEnd !== "" &&
    !isRentalStartInPast &&
    rentalDays > 0;

  const isCustomConsultationValid =
    occasionType !== "" && occasionDate !== "" && consultationDate !== "" && selectedSlot !== "";

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

  function goBack() {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
    else setVisitType(null); // back out of the whole flow to the entry screen
  }

  const canContinueCustomer = selectedCustomer !== null;
  const canContinueConsultation =
    (currentStep !== "consultation" || visitType !== "RENTAL" || isRentalGownStepValid) &&
    (currentStep !== "consultation" || visitType !== "CUSTOM" || isCustomConsultationValid);
  const isBusy = savingProfile || savingMeasurements || creatingOrder || creatingRental || creatingCustomDesign;

  return {
    // navigation
    visitType, setVisitType,
    stepIndex, setStepIndex,
    steps, currentStep,
    goBack,
    canContinueCustomer,
    canContinueConsultation,
    isBusy,

    // customer step
    customers, customersLoading, customersError,
    customerSearch, setCustomerSearch,
    selectedCustomer, setSelectedCustomer,
    showNewCustomerForm, setShowNewCustomerForm,
    filteredCustomers,
    newCustomerState, newCustomerFormAction,

    // consultation — shared
    adminNotes, setAdminNotes,
    existingDesignImages, setExistingDesignImages,
    existingImagesLoading,
    designImageUploaderRef,
    savingProfile, setSavingProfile,
    saveError, setSaveError,
    todayStr,

    // consultation — CUSTOM
    occasionType, setOccasionType,
    occasionDate, setOccasionDate,
    consultationDate, setConsultationDate,
    availableSlots,
    slotsLoading,
    selectedSlot, setSelectedSlot,
    creatingCustomDesign, setCreatingCustomDesign,
    customDesignError, setCustomDesignError,
    createdCustomDesignRequestId, setCreatedCustomDesignRequestId,
    isCustomConsultationValid,

    // consultation — RENTAL
    rentableProducts,
    rentableLoading, rentableError,
    gownSearch, setGownSearch,
    filteredGowns,
    selectedGown, setSelectedGown,
    rentalStart, setRentalStart,
    rentalEnd,
    rentalDays, rentalFee,
    rentalPaymentMethod, setRentalPaymentMethod,
    rentalNotes, setRentalNotes,
    creatingRental, setCreatingRental,
    rentalError, setRentalError,
    isRentalStartInPast,
    isRentalGownStepValid,

    // measurements
    measurementValues, setMeasurementField,
    measurementNotes, setMeasurementNotes,
    savingMeasurements, setSavingMeasurements,
    measurementsSaved, setMeasurementsSaved,
    measurementError, setMeasurementError,

    // order (PURCHASE)
    products, productsLoading, productsError,
    productSearch, setProductSearch,
    filteredProducts,
    orderItems, setOrderItems,
    toggleProduct, updateItemQuantity, updateItemSize,
    fulfillmentMethod, setFulfillmentMethod,
    paymentMethod, setPaymentMethod,
    orderNotes, setOrderNotes,
    discountType, setDiscountType,
    discountValue, setDiscountValue,
    discountReason, setDiscountReason,
    creatingOrder, setCreatingOrder,
    orderError, setOrderError,
    createdOrderId, setCreatedOrderId,
    subtotal, discountAmount, orderTotal,
  };
}

export type WalkInPanelState = ReturnType<typeof useWalkInPanelState>;
