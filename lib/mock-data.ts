import type {
  User,
  Category,
  Product,
  Order,
  Rental,
  Appointment,
  Inquiry,
  CartItem,
} from "@/types";

// ── Users ──────────────────────────────────────────────────────
export const mockUsers: User[] = [
  {
    id: "u1",
    email: "customer@example.com",
    role: "CUSTOMER",
    firstName: "Ayesha",
    lastName: "Perera",
    phone: "+94771234567",
    createdAt: "2024-01-15T08:00:00Z",
  },
  {
    id: "u2",
    email: "admin@example.com",
    role: "ADMIN",
    firstName: "Nimali",
    lastName: "Silva",
    phone: "+94779876543",
    createdAt: "2024-01-01T08:00:00Z",
  },
];

// ── Categories ─────────────────────────────────────────────────
export const mockCategories: Category[] = [
  { id: "c1", name: "Wedding Dresses", slug: "wedding-dresses" },
  { id: "c2", name: "Evening Gowns", slug: "evening-gowns" },
  { id: "c3", name: "Bridesmaid Dresses", slug: "bridesmaid-dresses" },
  { id: "c4", name: "Veils", slug: "veils", parentId: "c1" },
  { id: "c5", name: "Jewelry", slug: "jewelry" },
  { id: "c6", name: "Shoes", slug: "shoes" },
];

// ── Products ───────────────────────────────────────────────────
export const mockProducts: Product[] = [
  {
    id: "p1",
    name: "Ivory Lace Ballgown",
    slug: "ivory-lace-ballgown",
    description:
      "A stunning ivory ballgown with intricate lace detailing and a cathedral train.",
    type: "DRESS",
    categoryId: "c1",
    rentalPrice: 15000,
    purchasePrice: 85000,
    stock: 3,
    sizes: ["XS", "S", "M", "L"],
    images: ["/images/placeholder-dress-1.jpg"],
    isAvailable: true,
    createdAt: "2024-02-01T08:00:00Z",
  },
  {
    id: "p2",
    name: "Blush Mermaid Gown",
    slug: "blush-mermaid-gown",
    description: "Elegant blush-toned mermaid silhouette with beaded bodice.",
    type: "DRESS",
    categoryId: "c1",
    rentalPrice: 18000,
    purchasePrice: 95000,
    stock: 2,
    sizes: ["S", "M", "L"],
    images: ["/images/placeholder-dress-2.jpg"],
    isAvailable: true,
    createdAt: "2024-02-05T08:00:00Z",
  },
  {
    id: "p3",
    name: "Pearl Drop Earrings",
    slug: "pearl-drop-earrings",
    description:
      "Delicate freshwater pearl drop earrings with gold vermeil setting.",
    type: "ACCESSORY",
    categoryId: "c5",
    rentalPrice: 1500,
    purchasePrice: 8500,
    stock: 10,
    sizes: [],
    images: ["/images/placeholder-accessory-1.jpg"],
    isAvailable: true,
    createdAt: "2024-02-10T08:00:00Z",
  },
  {
    id: "p4",
    name: "Cathedral Veil",
    slug: "cathedral-veil",
    description: "Three-tier cathedral length veil with scalloped lace edge.",
    type: "ACCESSORY",
    categoryId: "c4",
    rentalPrice: 3500,
    purchasePrice: 12000,
    stock: 5,
    sizes: [],
    images: ["/images/placeholder-accessory-2.jpg"],
    isAvailable: true,
    createdAt: "2024-02-12T08:00:00Z",
  },
  {
    id: "p5",
    name: "Sage Bridesmaid Dress",
    slug: "sage-bridesmaid-dress",
    description:
      "Flowy chiffon bridesmaid dress in sage green, adjustable tie back.",
    type: "DRESS",
    categoryId: "c3",
    rentalPrice: 6000,
    purchasePrice: 22000,
    stock: 8,
    sizes: ["XS", "S", "M", "L", "XL"],
    images: ["/images/placeholder-dress-3.jpg"],
    isAvailable: true,
    createdAt: "2024-02-15T08:00:00Z",
  },
];

// ── Orders ─────────────────────────────────────────────────────
export const mockOrders: Order[] = [
  {
    id: "o1",
    userId: "u1",
    status: "CONFIRMED",
    totalAmount: 18000,
    items: [
      {
        id: "oi1",
        orderId: "o1",
        productId: "p2",
        quantity: 1,
        unitPrice: 18000,
        size: "M",
        product: {
          name: "Blush Mermaid Gown",
          images: ["/images/placeholder-dress-2.jpg"],
        },
      },
    ],
    createdAt: "2024-03-10T10:00:00Z",
  },
];

// ── Rentals ────────────────────────────────────────────────────
export const mockRentals: Rental[] = [
  {
    id: "r1",
    userId: "u1",
    productId: "p1",
    orderId: "o1",
    rentalStart: "2024-04-01T00:00:00Z",
    rentalEnd: "2024-04-07T00:00:00Z",
    status: "ACTIVE",
    depositAmount: 5000,
    balanceDue: 10000,
  },
];

// ── Appointments ───────────────────────────────────────────────
export const mockAppointments: Appointment[] = [
  {
    id: "a1",
    userId: "u1",
    productId: "p1",
    appointmentDate: "2024-04-15",
    timeSlot: "10:00",
    status: "CONFIRMED",
    notes: "First fitting for wedding dress.",
  },
];

// ── Inquiries ──────────────────────────────────────────────────
export const mockInquiries: Inquiry[] = [
  {
    id: "inq1",
    name: "Sachini Fernando",
    email: "sachini@example.com",
    phone: "+94762345678",
    message: "Do you have custom sizing for plus-size wedding dresses?",
    imageUrls: [],
    status: "OPEN",
    createdAt: "2024-03-20T09:00:00Z",
  },
];
