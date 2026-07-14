"use client";

import { useState } from "react";
import type { CustomerMeasurement } from "@/types/customer";
import { formatDate } from "@/lib/utils";
import { Ruler } from "lucide-react";

interface SettingsTabsProps {
  profileContent: React.ReactNode;
  measurements: CustomerMeasurement[];
}

type MeasurementGroup = {
  name: string;
  fields: { key: keyof CustomerMeasurement; label: string }[];
};

const MEASUREMENT_GROUPS: MeasurementGroup[] = [
  {
    name: "Torso",
    fields: [
      { key: "fullBust", label: "Full bust" },
      { key: "underBust", label: "Under bust" },
      { key: "upperBust", label: "Upper bust" },
      { key: "naturalWaist", label: "Natural waist" },
      { key: "fullHip", label: "Full hip" },
      { key: "bustApexDistance", label: "Bust apex distance" },
      { key: "shoulderToBustPoint", label: "Shoulder to bust point" },
      { key: "shoulderWidth", label: "Shoulder width" },
      { key: "neckCircumference", label: "Neck circumference" },
    ],
  },
  {
    name: "Arms",
    fields: [
      { key: "bicepCircumference", label: "Bicep circumference" },
      { key: "elbowCircumference", label: "Elbow circumference" },
      { key: "wristCircumference", label: "Wrist circumference" },
      { key: "sleeveLength", label: "Sleeve length" },
      { key: "armhole", label: "Armhole" },
    ],
  },
  {
    name: "Length and legs",
    fields: [
      { key: "heightWithShoes", label: "Height (with shoes)" },
      { key: "hollowToHem", label: "Hollow to hem" },
      { key: "torsoLength", label: "Torso length" },
      { key: "waistToKnee", label: "Waist to knee" },
      { key: "waistToFloor", label: "Waist to floor" },
      { key: "thighCircumference", label: "Thigh circumference" },
      { key: "trainLength", label: "Train length" },
    ],
  },
];

export function SettingsTabs({ profileContent, measurements }: SettingsTabsProps) {
  const [tab, setTab] = useState<"profile" | "measurements">("profile");

  const sorted = [...measurements].sort(
    (a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime(),
  );
  const latest = sorted[0];

  return (
    <div>
      <div className="mb-6 flex items-center justify-center gap-1 rounded-full border border-border bg-card p-1">
        <button
          type="button"
          onClick={() => setTab("profile")}
          className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            tab === "profile"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Profile
        </button>
        <button
          type="button"
          onClick={() => setTab("measurements")}
          className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            tab === "measurements"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Measurements
        </button>
      </div>

      {tab === "profile" ? (
        profileContent
      ) : !latest ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border p-8 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
            <Ruler className="h-5 w-5 text-primary" />
          </div>
          <p className="text-sm font-medium text-foreground">No measurements on file yet</p>
          <p className="max-w-xs text-xs text-muted-foreground">
            Your measurements are recorded by our team during a fitting appointment.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-sm font-medium text-foreground">
            Most recent — {formatDate(latest.measuredAt)}
          </p>

          {MEASUREMENT_GROUPS.map((group) => {
            const visibleFields = group.fields.filter(
              (f) => latest[f.key] !== null && latest[f.key] !== undefined,
            );
            if (visibleFields.length === 0) return null;

            return (
              <div key={group.name} className="rounded-2xl bg-accent/40 p-4">
                <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  {group.name}
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
                  {visibleFields.map((f) => (
                    <div key={f.key}>
                      <p className="text-[11px] text-muted-foreground">{f.label}</p>
                      <p className="text-sm font-medium text-foreground">
                        {String(latest[f.key])} cm
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {latest.notes && (
            <p className="text-xs italic text-muted-foreground">Note: {latest.notes}</p>
          )}
        </div>
      )}
    </div>
  );
}