// src/components/admin/walkin-sale-panel/steps/consultation-step.tsx
"use client";

import { Loader2 } from "lucide-react";
import { ImageUploader, type ImageUploaderHandle, type UploadedImage } from "@/components/products/image-uploader";
import type { AdminUser } from "@/types/user";
import type { RentableProduct } from "@/types/rental";
import type { OccasionType } from "@/types/appointment";
import type { VisitType } from "../types";
import { ConsultationCustomFields } from "./consultation-custom-fields";
import { ConsultationRentalFields } from "./consultation-rental-fields";
import type { RefObject } from "react";

interface ConsultationStepProps {
  visitType: VisitType;
  selectedCustomer: AdminUser | null;

  // notes (shared) + images (CUSTOM only)
  adminNotes: string;
  setAdminNotes: (v: string) => void;
  existingImagesLoading: boolean;
  existingDesignImages: UploadedImage[];
  designImageUploaderRef: RefObject<ImageUploaderHandle | null>;
  saveError: string | null;

  // CUSTOM
  todayStr: string;
  occasionType: OccasionType | "";
  setOccasionType: (v: OccasionType) => void;
  occasionDate: string;
  setOccasionDate: (v: string) => void;
  consultationDate: string;
  setConsultationDate: (v: string) => void;
  availableSlots: string[];
  slotsLoading: boolean;
  selectedSlot: string;
  setSelectedSlot: (v: string) => void;
  customDesignError: string | null;

  // RENTAL
  selectedGown: RentableProduct | null;
  setSelectedGown: (p: RentableProduct | null) => void;
  gownSearch: string;
  setGownSearch: (v: string) => void;
  filteredGowns: RentableProduct[];
  rentableLoading: boolean;
  rentableError: string | null;
  rentalStart: string;
  setRentalStart: (v: string) => void;
  rentalEnd: string;
  isRentalStartInPast: boolean;
  rentalPaymentMethod: string;
  setRentalPaymentMethod: (v: string) => void;
  rentalNotes: string;
  setRentalNotes: (v: string) => void;
  rentalDays: number;
  rentalFee: number;
  rentalError: string | null;
}

export function ConsultationStep(props: ConsultationStepProps) {
  const {
    visitType,
    selectedCustomer,
    adminNotes,
    setAdminNotes,
    existingImagesLoading,
    existingDesignImages,
    designImageUploaderRef,
    saveError,
  } = props;

  return (
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

      {/* Design reference images only make sense for made-to-order pieces —
          a rental is an existing, already-photographed gown, so there's
          nothing to reference here. */}
      {visitType === "CUSTOM" && (
        <div>
          <p className="mb-1.5 text-xs font-medium text-foreground">Design references</p>

          {existingImagesLoading ? (
            <div className="flex items-center gap-2 py-3 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Loading existing references...
            </div>
          ) : (
            <ImageUploader
              ref={designImageUploaderRef}
              initialImages={existingDesignImages}
              uploadContext="custom-design"
            />
          )}

          {saveError && <p className="mt-2 text-xs text-destructive">{saveError}</p>}
        </div>
      )}

      {visitType === "CUSTOM" && (
        <ConsultationCustomFields
          todayStr={props.todayStr}
          occasionType={props.occasionType}
          setOccasionType={props.setOccasionType}
          occasionDate={props.occasionDate}
          setOccasionDate={props.setOccasionDate}
          consultationDate={props.consultationDate}
          setConsultationDate={props.setConsultationDate}
          availableSlots={props.availableSlots}
          slotsLoading={props.slotsLoading}
          selectedSlot={props.selectedSlot}
          setSelectedSlot={props.setSelectedSlot}
          customDesignError={props.customDesignError}
        />
      )}

      {visitType === "RENTAL" && (
        <ConsultationRentalFields
          todayStr={props.todayStr}
          selectedGown={props.selectedGown}
          setSelectedGown={props.setSelectedGown}
          gownSearch={props.gownSearch}
          setGownSearch={props.setGownSearch}
          filteredGowns={props.filteredGowns}
          rentableLoading={props.rentableLoading}
          rentableError={props.rentableError}
          rentalStart={props.rentalStart}
          setRentalStart={props.setRentalStart}
          rentalEnd={props.rentalEnd}
          isRentalStartInPast={props.isRentalStartInPast}
          rentalPaymentMethod={props.rentalPaymentMethod}
          setRentalPaymentMethod={props.setRentalPaymentMethod}
          rentalNotes={props.rentalNotes}
          setRentalNotes={props.setRentalNotes}
          rentalDays={props.rentalDays}
          rentalFee={props.rentalFee}
          rentalError={props.rentalError}
        />
      )}
    </div>
  );
}