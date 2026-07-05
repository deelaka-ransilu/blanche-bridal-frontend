export interface CustomerMeasurement {
  id: string;
  publicId: string;
  customerId: string;
  heightWithShoes: number | null;
  hollowToHem: number | null;
  fullBust: number | null;
  underBust: number | null;
  naturalWaist: number | null;
  fullHip: number | null;
  shoulderWidth: number | null;
  torsoLength: number | null;
  thighCircumference: number | null;
  waistToKnee: number | null;
  waistToFloor: number | null;
  armhole: number | null;
  bicepCircumference: number | null;
  elbowCircumference: number | null;
  wristCircumference: number | null;
  sleeveLength: number | null;
  upperBust: number | null;
  bustApexDistance: number | null;
  shoulderToBustPoint: number | null;
  neckCircumference: number | null;
  trainLength: number | null;
  notes: string | null;
  measuredAt: string; // LocalDateTime → ISO string
}

export interface CustomerDetail {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  active: boolean; // @JsonProperty("active") — do NOT type as isActive, same trap as AdminUser
  createdAt: string;
  adminNotes: string | null;
  designImageUrls: string[];
  measurements: CustomerMeasurement[];
}

// Field labels for rendering the measurement form/table — keeps display logic
// out of the component and in one place if you need to reorder/relabel later.
export const MEASUREMENT_FIELDS: { key: keyof CustomerMeasurement; label: string }[] = [
  { key: "heightWithShoes", label: "Height (with shoes)" },
  { key: "hollowToHem", label: "Hollow to hem" },
  { key: "fullBust", label: "Full bust" },
  { key: "underBust", label: "Under bust" },
  { key: "naturalWaist", label: "Natural waist" },
  { key: "fullHip", label: "Full hip" },
  { key: "shoulderWidth", label: "Shoulder width" },
  { key: "torsoLength", label: "Torso length" },
  { key: "thighCircumference", label: "Thigh circumference" },
  { key: "waistToKnee", label: "Waist to knee" },
  { key: "waistToFloor", label: "Waist to floor" },
  { key: "armhole", label: "Armhole" },
  { key: "bicepCircumference", label: "Bicep circumference" },
  { key: "elbowCircumference", label: "Elbow circumference" },
  { key: "wristCircumference", label: "Wrist circumference" },
  { key: "sleeveLength", label: "Sleeve length" },
  { key: "upperBust", label: "Upper bust" },
  { key: "bustApexDistance", label: "Bust apex distance" },
  { key: "shoulderToBustPoint", label: "Shoulder to bust point" },
  { key: "neckCircumference", label: "Neck circumference" },
  { key: "trainLength", label: "Train length" },
];