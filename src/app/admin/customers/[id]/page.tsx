"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { ArrowLeft, Loader2, User } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminApiError, getCustomerDetail, updateCustomerProfile, getCustomerMeasurements, createCustomerMeasurement, updateCustomerMeasurement } from "@/lib/api/customers";
import type { CustomerDetailResponse, MeasurementRequest, MeasurementsResponse } from "@/types";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-medium tracking-[0.06em] uppercase text-muted-foreground mb-2.5">
      {children}
    </p>
  );
}

interface CustomerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const [id, setId] = useState<string>("");
  const router = useRouter();
  const { data: session } = useSession();
  const token = session?.user?.backendToken ?? "";

  const [customer, setCustomer] = useState<CustomerDetailResponse | null>(null);
  const [measurements, setMeasurements] = useState<MeasurementsResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [adminNotes, setAdminNotes] = useState("");
  const [designUrls, setDesignUrls] = useState<string[]>([]);
  const [newDesignUrl, setNewDesignUrl] = useState("");

  const [measurementDraft, setMeasurementDraft] = useState<Record<string, string>>({});
  const [editingMeasurementId, setEditingMeasurementId] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (!id || !token) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const [detail, meas] = await Promise.all([
          getCustomerDetail(token, id),
          getCustomerMeasurements(token, id),
        ]);

        setCustomer(detail);
        setMeasurements(meas || []);
        setAdminNotes(detail?.adminNotes || "");
        setDesignUrls(detail?.designImageUrls || []);
      } catch (error) {
        if (error instanceof AdminApiError && (error.status === 401 || error.status === 403)) {
          await signOut({ callbackUrl: "/login" });
          return;
        }
        toast.error("Failed to load customer details");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, token]);

  async function handleAuthError() {
    await signOut({ callbackUrl: "/login" });
  }

  const saveProfile = async () => {
    if (!customer) return;

    setSaving(true);
    try {
      const updated = await updateCustomerProfile(token, customer.id, {
        adminNotes: adminNotes.trim() || null,
        designImageUrls: designUrls.filter((url) => url.trim()),
      });

      setCustomer(updated);
      toast.success("Profile updated successfully");
    } catch (error) {
      if (error instanceof AdminApiError && (error.status === 401 || error.status === 403)) {
        await handleAuthError();
        return;
      }
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const addDesignUrl = () => {
    if (newDesignUrl.trim()) {
      setDesignUrls([...designUrls, newDesignUrl.trim()]);
      setNewDesignUrl("");
    }
  };

  const removeDesignUrl = (index: number) => {
    setDesignUrls(designUrls.filter((_, i) => i !== index));
  };

  const saveMeasurement = async () => {
    if (!customer) return;

    setSaving(true);
    try {
      const payload: MeasurementRequest = {
        heightWithShoes: measurementDraft.heightWithShoes ? Number(measurementDraft.heightWithShoes) : null,
        hollowToHem: measurementDraft.hollowToHem ? Number(measurementDraft.hollowToHem) : null,
        fullBust: measurementDraft.fullBust ? Number(measurementDraft.fullBust) : null,
        underBust: measurementDraft.underBust ? Number(measurementDraft.underBust) : null,
        naturalWaist: measurementDraft.naturalWaist ? Number(measurementDraft.naturalWaist) : null,
        fullHip: measurementDraft.fullHip ? Number(measurementDraft.fullHip) : null,
        shoulderWidth: measurementDraft.shoulderWidth ? Number(measurementDraft.shoulderWidth) : null,
        torsoLength: measurementDraft.torsoLength ? Number(measurementDraft.torsoLength) : null,
        thighCircumference: measurementDraft.thighCircumference ? Number(measurementDraft.thighCircumference) : null,
        waistToKnee: measurementDraft.waistToKnee ? Number(measurementDraft.waistToKnee) : null,
        waistToFloor: measurementDraft.waistToFloor ? Number(measurementDraft.waistToFloor) : null,
        armhole: measurementDraft.armhole ? Number(measurementDraft.armhole) : null,
        bicepCircumference: measurementDraft.bicepCircumference ? Number(measurementDraft.bicepCircumference) : null,
        elbowCircumference: measurementDraft.elbowCircumference ? Number(measurementDraft.elbowCircumference) : null,
        wristCircumference: measurementDraft.wristCircumference ? Number(measurementDraft.wristCircumference) : null,
        sleeveLength: measurementDraft.sleeveLength ? Number(measurementDraft.sleeveLength) : null,
        upperBust: measurementDraft.upperBust ? Number(measurementDraft.upperBust) : null,
        bustApexDistance: measurementDraft.bustApexDistance ? Number(measurementDraft.bustApexDistance) : null,
        shoulderToBustPoint: measurementDraft.shoulderToBustPoint ? Number(measurementDraft.shoulderToBustPoint) : null,
        neckCircumference: measurementDraft.neckCircumference ? Number(measurementDraft.neckCircumference) : null,
        trainLength: measurementDraft.trainLength ? Number(measurementDraft.trainLength) : null,
        notes: measurementDraft.notes || null,
      };

      let result: MeasurementsResponse;
      if (editingMeasurementId) {
        result = await updateCustomerMeasurement(token, customer.id, editingMeasurementId, payload);
        setMeasurements(measurements.map((m) => (m.id === editingMeasurementId ? result : m)));
      } else {
        result = await createCustomerMeasurement(token, customer.id, payload);
        setMeasurements([result, ...measurements]);
      }

      setMeasurementDraft({});
      setEditingMeasurementId(null);
      toast.success(editingMeasurementId ? "Measurement updated" : "Measurement added");
    } catch (error) {
      if (error instanceof AdminApiError && (error.status === 401 || error.status === 403)) {
        await handleAuthError();
        return;
      }
      toast.error("Failed to save measurement");
    } finally {
      setSaving(false);
    }
  };

  const loadMeasurementForEdit = (m: MeasurementsResponse) => {
    setMeasurementDraft({
      heightWithShoes: m.heightWithShoes?.toString() || "",
      hollowToHem: m.hollowToHem?.toString() || "",
      fullBust: m.fullBust?.toString() || "",
      underBust: m.underBust?.toString() || "",
      naturalWaist: m.naturalWaist?.toString() || "",
      fullHip: m.fullHip?.toString() || "",
      shoulderWidth: m.shoulderWidth?.toString() || "",
      torsoLength: m.torsoLength?.toString() || "",
      thighCircumference: m.thighCircumference?.toString() || "",
      waistToKnee: m.waistToKnee?.toString() || "",
      waistToFloor: m.waistToFloor?.toString() || "",
      armhole: m.armhole?.toString() || "",
      bicepCircumference: m.bicepCircumference?.toString() || "",
      elbowCircumference: m.elbowCircumference?.toString() || "",
      wristCircumference: m.wristCircumference?.toString() || "",
      sleeveLength: m.sleeveLength?.toString() || "",
      upperBust: m.upperBust?.toString() || "",
      bustApexDistance: m.bustApexDistance?.toString() || "",
      shoulderToBustPoint: m.shoulderToBustPoint?.toString() || "",
      neckCircumference: m.neckCircumference?.toString() || "",
      trainLength: m.trainLength?.toString() || "",
      notes: m.notes || "",
    });
    setEditingMeasurementId(m.id);
  };

  if (loading) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-4 sm:p-6">
        <div className="h-8 w-32 rounded bg-muted animate-pulse" />
        <div className="h-32 rounded-2xl bg-muted animate-pulse" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-4 sm:p-6">
        <div className="text-center">
          <p className="text-muted-foreground">Customer not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-4 sm:p-6">
      {/* Header */}
      <div className="space-y-4">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to customers
        </button>

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-muted/60 rounded-lg p-2.5">
              <User className="size-5 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-[20px] font-semibold text-foreground">
                {customer.firstName} {customer.lastName}
              </h1>
              <p className="text-[13px] text-muted-foreground">{customer.email}</p>
            </div>
          </div>
          <Badge variant={customer.isActive ? "default" : "destructive"}>
            {customer.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="design">Design</TabsTrigger>
          <TabsTrigger value="measurements">Measurements</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="bg-card border border-border/50 rounded-2xl p-4">
              <p className="text-[11px] font-medium uppercase text-muted-foreground mb-2">Email</p>
              <p className="text-[13px] text-foreground">{customer.email}</p>
            </div>
            <div className="bg-card border border-border/50 rounded-2xl p-4">
              <p className="text-[11px] font-medium uppercase text-muted-foreground mb-2">Phone</p>
              <p className="text-[13px] text-foreground">{customer.phone || "Not provided"}</p>
            </div>
            <div className="bg-card border border-border/50 rounded-2xl p-4">
              <p className="text-[11px] font-medium uppercase text-muted-foreground mb-2">Status</p>
              <Badge variant={customer.isActive ? "default" : "destructive"}>
                {customer.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="bg-card border border-border/50 rounded-2xl p-4">
              <p className="text-[11px] font-medium uppercase text-muted-foreground mb-2">Joined</p>
              <p className="text-[13px] text-foreground">
                {new Date(customer.createdAt).toLocaleDateString("en-LK")}
              </p>
            </div>
          </div>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
            <div className="px-4 py-3.5 border-b border-border/50">
              <SectionLabel>Admin Notes</SectionLabel>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add notes about this customer..."
                className="w-full h-32 rounded-lg border border-input bg-background px-3 py-2 text-[13px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button onClick={saveProfile} disabled={saving} className="gap-2 h-9 text-[13px] rounded-lg">
                {saving && <Loader2 className="size-4 animate-spin" />}
                Save Notes
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Design Tab */}
        <TabsContent value="design" className="space-y-4">
          <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
            <div className="px-4 py-3.5 border-b border-border/50">
              <SectionLabel>Design Image URLs</SectionLabel>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newDesignUrl}
                  onChange={(e) => setNewDesignUrl(e.target.value)}
                  placeholder="Paste image URL..."
                  className="h-9 text-[13px] rounded-lg"
                />
                <Button onClick={addDesignUrl} className="h-9 text-[13px] rounded-lg">
                  Add
                </Button>
              </div>

              {designUrls.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {designUrls.map((url, idx) => (
                    <div key={idx} className="space-y-2">
                      <img src={url} alt="Design" className="w-full h-40 object-cover rounded-lg" />
                      <Button
                        variant="destructive"
                        onClick={() => removeDesignUrl(idx)}
                        className="w-full h-8 text-[12px] rounded-lg"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {designUrls.length === 0 && (
                <p className="text-[13px] text-muted-foreground text-center py-6">No design images added</p>
              )}

              <Button onClick={saveProfile} disabled={saving} className="gap-2 h-9 text-[13px] rounded-lg w-full">
                {saving && <Loader2 className="size-4 animate-spin" />}
                Save Design URLs
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Measurements Tab */}
        <TabsContent value="measurements" className="space-y-4">
          {/* Measurement Form */}
          <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
            <div className="px-4 py-3.5 border-b border-border/50">
              <SectionLabel>{editingMeasurementId ? "Edit Measurement" : "Add Measurement"}</SectionLabel>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  "heightWithShoes", "hollowToHem", "fullBust", "underBust", "naturalWaist",
                  "fullHip", "shoulderWidth", "torsoLength", "thighCircumference", "waistToKnee",
                  "waistToFloor", "armhole", "bicepCircumference", "elbowCircumference", "wristCircumference",
                  "sleeveLength", "upperBust", "bustApexDistance", "shoulderToBustPoint", "neckCircumference", "trainLength", "notes",
                ].map((field) => (
                  <Input
                    key={field}
                    type={field === "notes" ? "text" : "number"}
                    placeholder={field}
                    value={measurementDraft[field] || ""}
                    onChange={(e) => setMeasurementDraft({ ...measurementDraft, [field]: e.target.value })}
                    className="h-9 text-[13px] rounded-lg"
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <Button onClick={saveMeasurement} disabled={saving} className="gap-2 h-9 text-[13px] rounded-lg">
                  {saving && <Loader2 className="size-4 animate-spin" />}
                  {editingMeasurementId ? "Update" : "Add"} Measurement
                </Button>
                {editingMeasurementId && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setMeasurementDraft({});
                      setEditingMeasurementId(null);
                    }}
                    className="h-9 text-[13px] rounded-lg"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Measurement History */}
          {measurements.length > 0 && (
            <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
              <div className="px-4 py-3.5 border-b border-border/50">
                <SectionLabel>Measurement History</SectionLabel>
              </div>
              <div className="divide-y divide-border/50">
                {measurements.map((m, idx) => (
                  <div key={m.id} className="p-4 sm:p-6 space-y-2">
                    <div className="flex items-start justify-between">
                      <p className="text-[13px] font-medium text-foreground">
                        {new Date(m.measuredAt).toLocaleDateString("en-LK")} at {new Date(m.measuredAt).toLocaleTimeString("en-LK")}
                      </p>
                      {idx === 0 && <Badge variant="secondary">Latest</Badge>}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => loadMeasurementForEdit(m)}
                      className="h-8 text-[12px] rounded-lg"
                    >
                      Edit
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
