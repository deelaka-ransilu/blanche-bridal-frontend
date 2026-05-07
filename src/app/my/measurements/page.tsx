"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getMyMeasurements } from "@/lib/api/auth";
import { type Measurements } from "@/types";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Ruler, CalendarDays, Inbox } from "lucide-react";

// ── Measurement sections ──────────────────────────────────────────────────────

const SECTIONS: {
  title: string;
  fields: { label: string; key: keyof Measurements }[];
}[] = [
  {
    title: "Length & Height",
    fields: [
      { label: "Height with Shoes",  key: "heightWithShoes"     },
      { label: "Hollow to Hem",      key: "hollowToHem"         },
      { label: "Torso Length",       key: "torsoLength"         },
      { label: "Waist to Knee",      key: "waistToKnee"         },
      { label: "Waist to Floor",     key: "waistToFloor"        },
      { label: "Train Length",       key: "trainLength"         },
    ],
  },
  {
    title: "Bust & Chest",
    fields: [
      { label: "Full Bust",          key: "fullBust"            },
      { label: "Under Bust",         key: "underBust"           },
      { label: "Upper Bust",         key: "upperBust"           },
      { label: "Bust Apex Distance", key: "bustApexDistance"    },
      { label: "Shoulder to Bust",   key: "shoulderToBustPoint" },
    ],
  },
  {
    title: "Waist, Hip & Thigh",
    fields: [
      { label: "Natural Waist",      key: "naturalWaist"        },
      { label: "Full Hip",           key: "fullHip"             },
      { label: "Thigh",              key: "thighCircumference"  },
    ],
  },
  {
    title: "Shoulders & Arms",
    fields: [
      { label: "Shoulder Width",     key: "shoulderWidth"       },
      { label: "Neck Circumference", key: "neckCircumference"   },
      { label: "Armhole",            key: "armhole"             },
      { label: "Bicep",              key: "bicepCircumference"  },
      { label: "Elbow",              key: "elbowCircumference"  },
      { label: "Wrist",              key: "wristCircumference"  },
      { label: "Sleeve Length",      key: "sleeveLength"        },
    ],
  },
];

// ── Single measurement tile ───────────────────────────────────────────────────

function MeasurementTile({
  label,
  value,
}: {
  label: string;
  value: number | null;
}) {
  return (
    <div className="rounded-xl border bg-muted/30 p-4 space-y-1">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      {value != null ? (
        <p className="text-xl font-semibold tabular-nums">
          {value}
          <span className="text-sm font-normal text-muted-foreground ml-1">cm</span>
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">—</p>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MyMeasurementsPage() {
  const { data: session, status } = useSession();

  const [measurement, setMeasurement] = useState<Measurements | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    const token = session?.user?.backendToken;
    if (!token) { setLoading(false); return; }

    getMyMeasurements(token)
      .then((res) => {
        if (res.success && res.data && res.data.length > 0) {
          // Most recent first
          const sorted = [...res.data].sort(
            (a, b) =>
              new Date(b.measuredAt).getTime() -
              new Date(a.measuredAt).getTime(),
          );
          setMeasurement(sorted[0]);
        }
      })
      .catch(() => toast.error("Failed to load measurements"))
      .finally(() => setLoading(false));
  }, [session, status]);

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-6 max-w-3xl space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  // ── No measurements ───────────────────────────────────────────────────────
  if (!measurement) {
    return (
      <div className="p-6 max-w-3xl">
        <h1 className="text-2xl font-semibold mb-1">My Measurements</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Your saved body measurements for fittings and alterations
        </p>
        <div className="rounded-xl border bg-card p-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto">
            <Inbox className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="font-medium">No measurements on file</p>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Visit us in-store or book a fitting appointment and our team will
            record your measurements.
          </p>
        </div>
      </div>
    );
  }

  // ── Has measurements ──────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-3xl space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">My Measurements</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your saved body measurements for fittings and alterations
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
          <CalendarDays className="h-3.5 w-3.5" />
          Measured{" "}
          {new Date(measurement.measuredAt).toLocaleDateString("en-LK", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      <Separator />

      {/* Sections */}
      {SECTIONS.map((section) => (
        <div key={section.title} className="space-y-3">
          <div className="flex items-center gap-2">
            <Ruler className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-gray-700">
              {section.title}
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {section.fields.map(({ label, key }) => (
              <MeasurementTile
                key={key}
                label={label}
                value={measurement[key] as number | null}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Notes */}
      {measurement.notes && (
        <>
          <Separator />
          <div className="space-y-1.5">
            <p className="text-sm font-semibold">Notes</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {measurement.notes}
            </p>
          </div>
        </>
      )}

      <p className="text-xs text-muted-foreground pb-2">
        To update your measurements, please visit us in-store or book a fitting
        appointment.
      </p>
    </div>
  );
}