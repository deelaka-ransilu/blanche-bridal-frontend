"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useFormStatus } from "react-dom";
import Image from "next/image";
import { Check, Lock, Loader2, Truck, Wallet } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { createOrderAction } from "@/lib/actions/orders";
import { getMyProfileAction } from "@/lib/actions/customers";
import { PayHereCheckout } from "@/components/payments/payhere-checkout";
import { DistrictCombobox } from "@/components/checkout/district-combobox";
import { TermsModal } from "@/components/checkout/terms-modal";
import type { OrderItemRequest, PaymentMethod } from "@/types/order";

// Only online payment is supported now — cash on delivery removed.
const PAYMENT_METHOD: PaymentMethod = "PAYHERE";

type FulfillmentMethod = "DELIVERY" | "PICKUP";

const SRI_LANKA_DISTRICTS = [
  "Colombo",
  "Gampaha",
  "Kalutara",
  "Kandy",
  "Matale",
  "Nuwara Eliya",
  "Galle",
  "Matara",
  "Hambantota",
  "Jaffna",
  "Kilinochchi",
  "Mannar",
  "Vavuniya",
  "Mullaitivu",
  "Batticaloa",
  "Ampara",
  "Trincomalee",
  "Kurunegala",
  "Puttalam",
  "Anuradhapura",
  "Polonnaruwa",
  "Badulla",
  "Moneragala",
  "Ratnapura",
  "Kegalle",
] as const;

const FREE_DELIVERY_DISTRICT = "Colombo";
const DELIVERY_FEE = 500;

// Sri Lankan mobile numbers: 10 digits, starting with 07.
const PHONE_REGEX = /^07\d{8}$/;
// Sri Lankan postal codes: 5 digits.
const POSTAL_CODE_REGEX = /^\d{5}$/;

function Crumb({ n, label, done, active }: { n: number; label: string; done?: boolean; active?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${
          active ? "bg-primary text-white" : done ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
        }`}
      >
        {done ? <Check className="h-3 w-3" /> : n}
      </span>
      <span className={`hidden text-xs font-medium sm:inline ${active ? "text-foreground" : "text-muted-foreground"}`}>
        {label}
      </span>
    </div>
  );
}

const boxInputClass =
  "w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 transition-colors focus:border-primary focus:outline-none";

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Placing order…
        </>
      ) : (
        "Continue to PayHere"
      )}
    </button>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { status } = useSession();
  const { items, total, clear } = useCart();
  const [state, formAction] = useActionState(createOrderAction, null);

  const [fulfillmentMethod, setFulfillmentMethod] = useState<FulfillmentMethod>("DELIVERY");
  const [addressDraft, setAddressDraft] = useState("");
  const [district, setDistrict] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [phoneDraft, setPhoneDraft] = useState("");
  const [addressLoaded, setAddressLoaded] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);

  // Only show "invalid format" errors once the user has actually typed
  // something — an empty field just shows as "required" via the button
  // disabled state, not as a format error.
  const phoneError =
    phoneDraft.length > 0 && !PHONE_REGEX.test(phoneDraft)
      ? "Enter a valid number, e.g. 07XXXXXXXX"
      : null;
  const postalCodeError =
    postalCode.length > 0 && !POSTAL_CODE_REGEX.test(postalCode)
      ? "Postal code must be 5 digits"
      : null;

  useEffect(() => {
    if (status !== "authenticated") return;
    getMyProfileAction().then((result) => {
      if (result.success) {
        setAddressDraft(result.data.address ?? "");
        setPhoneDraft(result.data.phone ?? "");
      }
      setAddressLoaded(true);
    });
  }, [status]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login?callbackUrl=/my/checkout-redirect");
    }
  }, [status, router]);

  useEffect(() => {
    if (items.length === 0 && !state?.success) {
      router.replace("/products");
    }
  }, [items.length, state, router]);

  useEffect(() => {
    if (state?.success) {
      clear();
    }
  }, [state, clear]);

  if (status !== "authenticated") return null;

  if (state?.success && state.orderId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 sm:px-6">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-sm sm:p-10">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Check className="h-8 w-8 text-primary" />
          </div>
          <h1 className="mb-2 text-xl font-semibold text-foreground sm:text-2xl">Almost done</h1>
          <p className="mb-8 text-sm text-muted-foreground">
            Redirecting you to complete secure payment via PayHere.
          </p>
          <PayHereCheckout orderId={state.orderId} paymentMethod={PAYMENT_METHOD} isRentalDeposit={false} />
        </div>
      </div>
    );
  }

  const orderItems: OrderItemRequest[] = items.map((i) => ({
    productId: i.productId,
    quantity: i.quantity,
    size: i.size ?? undefined,
  }));

  const isPickup = fulfillmentMethod === "PICKUP";
  const deliveryFee = isPickup || district === FREE_DELIVERY_DISTRICT ? 0 : DELIVERY_FEE;
  const grandTotal = total + deliveryFee;

  const fullDeliveryAddress = isPickup
    ? ""
    : [addressDraft.trim(), district, postalCode.trim()].filter(Boolean).join(", ");

  const hasRequiredFields = isPickup
    ? PHONE_REGEX.test(phoneDraft)
    : addressDraft.trim().length > 0 &&
      district.length > 0 &&
      POSTAL_CODE_REGEX.test(postalCode) &&
      PHONE_REGEX.test(phoneDraft);
  const canSubmit = hasRequiredFields && agreed;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-3 py-6 sm:px-6 sm:py-10">
      <div className="w-full max-w-5xl overflow-hidden rounded-2xl border border-border bg-card shadow-sm sm:rounded-3xl">
        {/* Top bar: wordmark + breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-4 sm:gap-4 sm:px-8 sm:py-5">
          <span className="text-base font-bold tracking-tight text-foreground sm:text-lg">Blanche Bridal</span>
          <div className="flex items-center gap-2 sm:gap-3">
            <Crumb n={1} label="Cart" done />
            <div className="h-px w-3 bg-border sm:w-4" />
            <Crumb n={2} label="Review" done />
            <div className="h-px w-3 bg-border sm:w-4" />
            <Crumb n={3} label="Checkout" active />
          </div>
        </div>

        <form
          id="checkout-form"
          action={formAction}
          className="grid gap-8 p-4 sm:gap-10 sm:p-8 md:grid-cols-[1fr_1px_320px] lg:grid-cols-[1fr_1px_360px]"
        >
          <input type="hidden" name="itemsJson" value={JSON.stringify(orderItems)} />
          <input type="hidden" name="orderMode" value="WEBSITE" />
          <input type="hidden" name="paymentMethod" value={PAYMENT_METHOD} />
          <input type="hidden" name="fulfillmentMethod" value={fulfillmentMethod} />
          <input type="hidden" name="deliveryAddress" value={fullDeliveryAddress} />
          <input type="hidden" name="customerPhone" value={phoneDraft} />

          {/* ── Left: shipping info ── */}
          <div>
            <h1 className="mb-6 text-lg font-semibold text-foreground sm:text-xl">Checkout</h1>

            <h2 className="mb-4 text-sm font-semibold text-foreground">Shipping Information</h2>

            <div className="mb-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFulfillmentMethod("DELIVERY")}
                className={`flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-medium transition-colors ${
                  fulfillmentMethod === "DELIVERY"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-muted-foreground hover:border-muted-foreground/30"
                }`}
              >
                <Truck className="h-4 w-4" />
                Delivery
              </button>
              <button
                type="button"
                onClick={() => setFulfillmentMethod("PICKUP")}
                className={`flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-medium transition-colors ${
                  fulfillmentMethod === "PICKUP"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-muted-foreground hover:border-muted-foreground/30"
                }`}
              >
                <Wallet className="h-4 w-4" />
                Pick up
              </button>
            </div>

            {!addressLoaded ? (
              <div className="space-y-4">
                {!isPickup && <div className="h-11 animate-pulse rounded-lg bg-muted" />}
                <div className="h-11 animate-pulse rounded-lg bg-muted" />
              </div>
            ) : (
              <div className="space-y-4">
                {isPickup ? (
                  <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                    Pick up your order at our boutique. We&apos;ll confirm a pickup time by phone once
                    your order is ready.
                  </div>
                ) : (
                  <>
                    <Field label="Delivery address" required>
                      <textarea
                        value={addressDraft}
                        onChange={(e) => setAddressDraft(e.target.value)}
                        rows={2}
                        placeholder="House/apartment number, street, city"
                        className={`${boxInputClass} resize-none`}
                      />
                    </Field>

                    <div className="grid grid-cols-2 gap-3">
                      <Field label="District" required>
                        <DistrictCombobox
                          districts={SRI_LANKA_DISTRICTS}
                          value={district}
                          onChange={setDistrict}
                        />
                      </Field>

                      <Field label="Postal code" required error={postalCodeError}>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, "").slice(0, 5))}
                          placeholder="10100"
                          maxLength={5}
                          className={boxInputClass}
                        />
                      </Field>
                    </div>

                    {district && district !== FREE_DELIVERY_DISTRICT && (
                      <p className="text-xs text-muted-foreground">
                        A flat delivery charge of LKR {DELIVERY_FEE.toLocaleString()} applies outside
                        Colombo.
                      </p>
                    )}
                  </>
                )}
                <Field label="Phone number" required error={phoneError}>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={phoneDraft}
                    onChange={(e) => setPhoneDraft(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="07XXXXXXXX"
                    maxLength={10}
                    className={boxInputClass}
                  />
                </Field>
              </div>
            )}

            <label className="mt-6 flex items-center gap-2.5 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => {
                  if (!e.target.checked) {
                    setAgreed(false);
                    return;
                  }
                  // Checking the box always opens the modal to (re-)confirm —
                  // agreement is only actually set via onAccept below.
                  setTermsModalOpen(true);
                }}
                className="h-4 w-4 shrink-0 accent-primary"
              />
              <span>
                I have read and agree to the{" "}
                <button
                  type="button"
                  onClick={() => setTermsModalOpen(true)}
                  className="text-primary hover:underline"
                >
                  Terms and Conditions
                </button>
              </span>
            </label>

            {state && !state.success && (
              <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                <p className="text-sm text-destructive">{state.message}</p>
              </div>
            )}
          </div>

          {/* ── Divider (vertical on md+, horizontal on mobile) ── */}
          <div className="hidden bg-border md:block" />
          <div className="h-px w-full bg-border md:hidden" />

          {/* ── Right: review cart ── */}
          <div className="h-fit space-y-5">
            <h2 className="text-sm font-semibold text-foreground">Review your cart</h2>

            <div className="space-y-4">
              {items.map((item) => (
                <div key={`${item.productId}-${item.size ?? "default"}`} className="flex items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                    {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.quantity}x</p>
                  </div>
                  <p className="shrink-0 text-sm font-medium text-foreground">
                    LKR {(item.unitPrice * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>LKR {total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>{isPickup ? "Pickup" : "Shipping"}</span>
                <span>{isPickup || deliveryFee === 0 ? "Free" : `LKR ${deliveryFee.toLocaleString()}`}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-3 text-base font-semibold text-foreground">
                <span>Total</span>
                <span>LKR {grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <SubmitButton disabled={!canSubmit} />
            {!canSubmit && (
              <p className="text-center text-xs text-muted-foreground">
                {!hasRequiredFields
                  ? isPickup
                    ? "Add a valid phone number"
                    : "Add a delivery address, district, valid postal code, and valid phone number"
                  : "Please agree to the Terms and Conditions"}
              </p>
            )}

            <div className="flex items-start gap-2 rounded-xl bg-muted/50 p-3">
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="text-xs font-medium text-foreground">Secure Checkout</p>
                <p className="text-xs text-muted-foreground">
                  Ensuring your financial and personal details are secure during every transaction.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>

      <TermsModal
        open={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
        onAccept={() => {
          setAgreed(true);
          setTermsModalOpen(false);
        }}
      />
    </div>
  );
}