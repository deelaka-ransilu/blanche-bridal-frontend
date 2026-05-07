"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { getProfile, updateProfile, getMyMeasurements } from "@/lib/api/auth";
import { User, Measurements } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName:  z.string().min(1, "Last name is required"),
  phone:     z.string().optional(),
  address:   z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const measurementFields: { label: string; key: keyof Measurements }[] = [
  { label: "Height (with shoes)",    key: "heightWithShoes" },
  { label: "Hollow to Hem",          key: "hollowToHem" },
  { label: "Full Bust",              key: "fullBust" },
  { label: "Under Bust",             key: "underBust" },
  { label: "Natural Waist",          key: "naturalWaist" },
  { label: "Full Hip",               key: "fullHip" },
  { label: "Shoulder Width",         key: "shoulderWidth" },
  { label: "Torso Length",           key: "torsoLength" },
  { label: "Thigh",                  key: "thighCircumference" },
  { label: "Waist to Knee",          key: "waistToKnee" },
  { label: "Waist to Floor",         key: "waistToFloor" },
  { label: "Armhole",                key: "armhole" },
  { label: "Bicep",                  key: "bicepCircumference" },
  { label: "Elbow",                  key: "elbowCircumference" },
  { label: "Wrist",                  key: "wristCircumference" },
  { label: "Sleeve Length",          key: "sleeveLength" },
  { label: "Upper Bust",             key: "upperBust" },
  { label: "Bust Apex Distance",     key: "bustApexDistance" },
  { label: "Shoulder to Bust Point", key: "shoulderToBustPoint" },
  { label: "Neck",                   key: "neckCircumference" },
  { label: "Train Length",           key: "trainLength" },
];

function MeasurementCard({ m }: { m: Measurements }) {
  const filled = measurementFields.filter(
    ({ key }) => m[key] !== null && m[key] !== undefined,
  );

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-3">
        Recorded on{" "}
        {new Date(m.measuredAt).toLocaleDateString("en-LK", {
          dateStyle: "long",
        })}
        {" · "}
        <span className="font-mono">{m.publicId}</span>
      </p>

      {filled.length === 0 ? (
        <p className="text-sm text-muted-foreground">No measurements entered.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filled.map(({ label, key }) => (
            <div key={key} className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-sm font-medium mt-0.5">{String(m[key])} cm</p>
            </div>
          ))}
        </div>
      )}

      {m.notes && (
        <p className="text-xs text-muted-foreground mt-3 italic">{m.notes}</p>
      )}
    </div>
  );
}

export function ProfileForm() {
  const { data: session } = useSession();
  const [profile, setProfile]           = useState<User | null>(null);
  const [measurements, setMeasurements] = useState<Measurements[]>([]);
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);

  const token = session?.user?.backendToken ?? "";
  const role  = session?.user?.role ?? "";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (!token) return;

    async function load() {
      setLoading(true);
      try {
        const res = await getProfile(token);
        if (res.success && res.data) {
          setProfile(res.data);
          reset({
            firstName: res.data.firstName,
            lastName:  res.data.lastName,
            phone:     res.data.phone    ?? "",
            address:   res.data.address  ?? "",
          });
        }

        if (role === "CUSTOMER") {
          const mRes = await getMyMeasurements(token);
          if (mRes.success && mRes.data) setMeasurements(mRes.data);
        }
      } catch {
        toast.error("Could not load profile. Is the server running?");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [token, role, reset]);

  async function onSubmit(values: ProfileFormValues) {
    setSaving(true);
    const res = await updateProfile(token, values);
    if (res.success) {
      toast.success("Profile updated successfully.");
    } else {
      toast.error(res.error?.message ?? "Failed to update profile.");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="space-y-3 max-w-2xl">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Profile card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Read-only email */}
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={profile?.email ?? ""} disabled />
            </div>

            {/* Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" {...register("firstName")} />
                {errors.firstName && (
                  <p className="text-xs text-red-500">{errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" {...register("lastName")} />
                {errors.lastName && (
                  <p className="text-xs text-red-500">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="+94 77 000 0000"
              />
            </div>

            {/* Address — used to prefill delivery address at checkout */}
            <div className="space-y-1.5">
              <Label htmlFor="address">Delivery Address</Label>
              <textarea
                id="address"
                {...register("address")}
                rows={3}
                placeholder="Enter your delivery address (optional — prefilled at checkout)"
                className="w-full text-sm border rounded-lg px-3 py-2 resize-none
                           focus:outline-none focus:ring-2 focus:ring-amber-400
                           focus:border-transparent placeholder:text-gray-400"
              />
              <p className="text-xs text-muted-foreground">
                Saved here and prefilled automatically when you choose delivery at checkout.
              </p>
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Measurements — CUSTOMER only */}
      {role === "CUSTOMER" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">My Measurements</CardTitle>
          </CardHeader>
          <CardContent>
            {measurements.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No measurements on file yet. Visit the boutique to have your
                measurements recorded.
              </p>
            ) : (
              <div className="space-y-6">
                {measurements.map((m) => (
                  <MeasurementCard key={m.id} m={m} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}