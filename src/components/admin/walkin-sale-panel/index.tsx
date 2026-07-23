"use client";

import { X, ChevronLeft } from "lucide-react";
import { updateCustomerProfileAction, addMeasurementAction } from "@/lib/actions/customers";
import { MEASUREMENT_FIELDS } from "@/types/customer";
import { VISIT_TYPES, STEP_LABEL, type VisitType } from "./types";
import { useWalkInPanelState } from "./use-walkin-panel-state";
import { submitRentalBooking } from "./actions/rental-booking-submit";
import { submitCustomDesignRequest } from "./actions/custom-design-submit";
import { submitPurchaseOrder } from "./actions/purchase-order-submit";
import { CustomerStep } from "./steps/customer-step";
import { ConsultationStep } from "./steps/consultation-step";
import { MeasurementsStep } from "./steps/measurements-step";
import { OrderStep } from "./steps/order-step";
import { PaymentStep } from "./steps/payment-step";

export function WalkInSalePanel({ onClose }: { onClose: () => void }) {
  const s = useWalkInPanelState();

  async function goNext() {
    // Leaving the consultation step: validate gown/dates for RENTAL first
    // (nothing saved yet if this fails).
    if (s.currentStep === "consultation" && s.visitType === "RENTAL") {
      if (!s.selectedGown) {
        s.setRentalError("Select a gown before continuing.");
        return;
      }
      if (!s.rentalStart || !s.rentalEnd) {
        s.setRentalError("Pick a rental date range before continuing.");
        return;
      }
      if (s.isRentalStartInPast) {
        s.setRentalError("Rental start date can't be in the past.");
        return;
      }
      if (s.rentalDays <= 0) {
        s.setRentalError("Rental end date must be after the start date.");
        return;
      }
      s.setRentalError(null);
    }

    // Leaving the consultation step: validate occasion + consultation slot
    // for CUSTOM before anything is saved.
    if (s.currentStep === "consultation" && s.visitType === "CUSTOM" && !s.isCustomConsultationValid) {
      s.setCustomDesignError("Fill in occasion, occasion date, consultation date, and a time slot before continuing.");
      return;
    }
    if (s.currentStep === "consultation" && s.visitType === "CUSTOM") {
      s.setCustomDesignError(null);
    }

    // Leaving the consultation step: persist any newly uploaded design
    // images (merged with what the customer already had).
    if (s.currentStep === "consultation" && s.selectedCustomer && s.designImageUploaderRef.current?.hasPending()) {
      s.setSavingProfile(true);
      s.setSaveError(null);

      let mergedImages;
      try {
        mergedImages = await s.designImageUploaderRef.current.uploadAll();
      } catch (err) {
        s.setSavingProfile(false);
        s.setSaveError(err instanceof Error ? err.message : "Could not upload design images. Try again before continuing.");
        return;
      }

      const formData = new FormData();
      formData.set("adminNotes", s.adminNotes);
      formData.set("designImageUrls", JSON.stringify(mergedImages.map((img) => img.url)));

      const result = await updateCustomerProfileAction(s.selectedCustomer.id, formData);
      s.setSavingProfile(false);

      if (!result.success) {
        s.setSaveError(result.message || "Could not save design images. Try again before continuing.");
        return;
      }

      s.setExistingDesignImages(mergedImages);
    }

    // Leaving the measurements step: save the entered set as a new
    // measurement snapshot for this customer, once, if there's anything
    // to save and it hasn't already been saved.
    if (s.currentStep === "measurements" && s.selectedCustomer && !s.measurementsSaved) {
      const hasAnyValue = Object.values(s.measurementValues).some((v) => v && v.trim() !== "");
      if (hasAnyValue) {
        s.setSavingMeasurements(true);
        s.setMeasurementError(null);

        const formData = new FormData();
        for (const { key } of MEASUREMENT_FIELDS) {
          formData.set(key, s.measurementValues[key] ?? "");
        }
        formData.set("notes", s.measurementNotes);

        const result = await addMeasurementAction(s.selectedCustomer.id, null, formData);
        s.setSavingMeasurements(false);

        if (!result?.success) {
          s.setMeasurementError(result?.message || "Could not save measurements. Try again before continuing.");
          return;
        }
        s.setMeasurementsSaved(true);
      }
    }

    // Leaving the measurements step for RENTAL: create the real
    // Order + Rental pair.
    if (
      s.currentStep === "measurements" &&
      s.visitType === "RENTAL" &&
      !s.createdOrderId &&
      s.selectedCustomer &&
      s.selectedGown
    ) {
      s.setCreatingRental(true);
      s.setRentalError(null);

      const result = await submitRentalBooking({
        selectedCustomer: s.selectedCustomer,
        selectedGown: s.selectedGown,
        rentalStart: s.rentalStart,
        rentalEnd: s.rentalEnd,
        rentalPaymentMethod: s.rentalPaymentMethod,
        rentalNotes: s.rentalNotes,
        measurementNotes: s.measurementNotes,
      });
      s.setCreatingRental(false);

      if (!result.success) {
        s.setRentalError(result.message);
        return;
      }
      s.setCreatedOrderId(result.orderId);
    }

    // Leaving the measurements step for CUSTOM: create the real
    // Appointment + CustomDesignRequest pair.
    if (
      s.currentStep === "measurements" &&
      s.visitType === "CUSTOM" &&
      !s.createdCustomDesignRequestId &&
      s.selectedCustomer
    ) {
      s.setCreatingCustomDesign(true);
      s.setCustomDesignError(null);

      const result = await submitCustomDesignRequest({
        selectedCustomer: s.selectedCustomer,
        consultationDate: s.consultationDate,
        selectedSlot: s.selectedSlot,
        occasionType: s.occasionType,
        occasionDate: s.occasionDate,
        adminNotes: s.adminNotes,
        measurementNotes: s.measurementNotes,
        existingDesignImages: s.existingDesignImages,
      });
      s.setCreatingCustomDesign(false);

      if (!result.success) {
        s.setCustomDesignError(result.message);
        return;
      }
      s.setCreatedCustomDesignRequestId(result.customDesignRequestId);
    }

    // Leaving the order step: create the real order. PURCHASE only.
    if (s.currentStep === "order" && s.visitType === "PURCHASE" && !s.createdOrderId && s.selectedCustomer) {
      if (s.orderItems.length === 0) {
        s.setOrderError("Add at least one item before continuing.");
        return;
      }

      s.setCreatingOrder(true);
      s.setOrderError(null);

      const result = await submitPurchaseOrder({
        selectedCustomer: s.selectedCustomer,
        orderItems: s.orderItems,
        fulfillmentMethod: s.fulfillmentMethod,
        paymentMethod: s.paymentMethod,
        orderNotes: s.orderNotes,
        discountType: s.discountType,
        discountValue: s.discountValue,
        discountReason: s.discountReason,
      });
      s.setCreatingOrder(false);

      if (!result.success) {
        s.setOrderError(result.message);
        return;
      }
      s.setCreatedOrderId(result.orderId);
    }

    if (s.stepIndex < s.steps.length - 1) s.setStepIndex((i) => i + 1);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl bg-card shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <p className="font-heading text-base font-medium text-foreground">New walk-in sale</p>
            {s.visitType && (
              <p className="text-xs text-muted-foreground">
                {VISIT_TYPES.find((v) => v.type === s.visitType)?.label}
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
        {s.visitType && (
          <div className="flex items-center border-b border-border px-5 py-4">
            {s.steps.map((step, i) => {
              const isCurrent = i === s.stepIndex;
              const isNext = i === s.stepIndex + 1;
              const isDone = i < s.stepIndex;
              const showLabel = isCurrent || isNext;

              return (
                <div key={step} className={`flex items-center ${i < s.steps.length - 1 ? "flex-1" : ""}`}>
                  <button
                    onClick={() => i <= s.stepIndex && s.setStepIndex(i)}
                    disabled={i > s.stepIndex}
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
                  {i < s.steps.length - 1 && (
                    <div
                      className={`mx-1 h-px flex-1 transition-colors ${
                        i < s.stepIndex ? "bg-primary/40" : "bg-border"
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
          {!s.visitType && (
            <div className="flex flex-col gap-2.5">
              <p className="mb-1 text-xs text-muted-foreground">What&apos;s this visit for?</p>
              {VISIT_TYPES.map(({ type, label, description, icon: Icon }) => (
                <button
                  key={type}
                  onClick={() => {
                    s.setVisitType(type as VisitType);
                    s.setStepIndex(0);
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

          {s.currentStep === "customer" && (
            <CustomerStep
              customersLoading={s.customersLoading}
              customersError={s.customersError}
              customerSearch={s.customerSearch}
              setCustomerSearch={s.setCustomerSearch}
              filteredCustomers={s.filteredCustomers}
              customers={s.customers}
              selectedCustomer={s.selectedCustomer}
              setSelectedCustomer={s.setSelectedCustomer}
              showNewCustomerForm={s.showNewCustomerForm}
              setShowNewCustomerForm={s.setShowNewCustomerForm}
              newCustomerState={s.newCustomerState}
              newCustomerFormAction={s.newCustomerFormAction}
            />
          )}

          {s.currentStep === "consultation" && s.visitType && (
            <ConsultationStep
              visitType={s.visitType}
              selectedCustomer={s.selectedCustomer}
              adminNotes={s.adminNotes}
              setAdminNotes={s.setAdminNotes}
              existingImagesLoading={s.existingImagesLoading}
              existingDesignImages={s.existingDesignImages}
              designImageUploaderRef={s.designImageUploaderRef}
              saveError={s.saveError}
              todayStr={s.todayStr}
              occasionType={s.occasionType}
              setOccasionType={s.setOccasionType}
              occasionDate={s.occasionDate}
              setOccasionDate={s.setOccasionDate}
              consultationDate={s.consultationDate}
              setConsultationDate={s.setConsultationDate}
              availableSlots={s.availableSlots}
              slotsLoading={s.slotsLoading}
              selectedSlot={s.selectedSlot}
              setSelectedSlot={s.setSelectedSlot}
              customDesignError={s.customDesignError}
              selectedGown={s.selectedGown}
              setSelectedGown={s.setSelectedGown}
              gownSearch={s.gownSearch}
              setGownSearch={s.setGownSearch}
              filteredGowns={s.filteredGowns}
              rentableLoading={s.rentableLoading}
              rentableError={s.rentableError}
              rentalStart={s.rentalStart}
              setRentalStart={s.setRentalStart}
              rentalEnd={s.rentalEnd}
              isRentalStartInPast={s.isRentalStartInPast}
              rentalPaymentMethod={s.rentalPaymentMethod}
              setRentalPaymentMethod={s.setRentalPaymentMethod}
              rentalNotes={s.rentalNotes}
              setRentalNotes={s.setRentalNotes}
              rentalDays={s.rentalDays}
              rentalFee={s.rentalFee}
              rentalError={s.rentalError}
            />
          )}

          {s.currentStep === "measurements" && s.visitType && (
            <MeasurementsStep
              visitType={s.visitType}
              selectedCustomer={s.selectedCustomer}
              measurementValues={s.measurementValues}
              setMeasurementField={s.setMeasurementField}
              measurementNotes={s.measurementNotes}
              setMeasurementNotes={s.setMeasurementNotes}
              measurementsSaved={s.measurementsSaved}
              measurementError={s.measurementError}
              rentalError={s.rentalError}
              customDesignError={s.customDesignError}
            />
          )}

          {s.currentStep === "order" && s.visitType === "PURCHASE" && (
            <OrderStep
              selectedCustomer={s.selectedCustomer}
              createdOrderId={s.createdOrderId}
              productSearch={s.productSearch}
              setProductSearch={s.setProductSearch}
              productsLoading={s.productsLoading}
              productsError={s.productsError}
              filteredProducts={s.filteredProducts}
              orderItems={s.orderItems}
              toggleProduct={s.toggleProduct}
              updateItemQuantity={s.updateItemQuantity}
              updateItemSize={s.updateItemSize}
              fulfillmentMethod={s.fulfillmentMethod}
              setFulfillmentMethod={s.setFulfillmentMethod}
              paymentMethod={s.paymentMethod}
              setPaymentMethod={s.setPaymentMethod}
              orderNotes={s.orderNotes}
              setOrderNotes={s.setOrderNotes}
              discountType={s.discountType}
              setDiscountType={s.setDiscountType}
              discountValue={s.discountValue}
              setDiscountValue={s.setDiscountValue}
              discountReason={s.discountReason}
              setDiscountReason={s.setDiscountReason}
              subtotal={s.subtotal}
              discountAmount={s.discountAmount}
              orderTotal={s.orderTotal}
              orderError={s.orderError}
            />
          )}

          {s.currentStep === "payment" && s.visitType && (
            <PaymentStep
              visitType={s.visitType}
              currentStep={s.currentStep}
              createdOrderId={s.createdOrderId}
              rentalError={s.rentalError}
              selectedGown={s.selectedGown}
              rentalDays={s.rentalDays}
              rentalFee={s.rentalFee}
              rentalPaymentMethod={s.rentalPaymentMethod}
              createdCustomDesignRequestId={s.createdCustomDesignRequestId}
              customDesignError={s.customDesignError}
            />
          )}
        </div>

        {/* Footer nav */}
        {s.visitType && (
          <div className="flex items-center justify-between border-t border-border px-5 py-3.5">
            <button
              onClick={s.goBack}
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Back
            </button>
            <button
              onClick={goNext}
              disabled={
                (s.currentStep === "customer" && !s.canContinueCustomer) ||
                !s.canContinueConsultation ||
                s.isBusy
              }
              className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
            >
              {s.isBusy ? "Saving..." : "Continue"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
