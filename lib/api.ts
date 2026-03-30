// lib/api.ts
// When NEXT_PUBLIC_API_URL is set → calls real Spring Boot backend
// When not set → returns mock data with simulated delay

const USE_MOCK = !process.env.NEXT_PUBLIC_API_URL;

function simulateDelay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Products ───────────────────────────────────────────────────
export async function getProducts() {
  if (USE_MOCK) {
    await simulateDelay();
    const { mockProducts } = await import("./mock-data");
    return mockProducts;
  }
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export async function getProductById(id: string) {
  if (USE_MOCK) {
    await simulateDelay();
    const { mockProducts } = await import("./mock-data");
    return mockProducts.find((p) => p.id === id) ?? null;
  }
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`,
  );
  if (!res.ok) throw new Error("Failed to fetch product");
  return res.json();
}

// ── Categories ─────────────────────────────────────────────────
export async function getCategories() {
  if (USE_MOCK) {
    await simulateDelay();
    const { mockCategories } = await import("./mock-data");
    return mockCategories;
  }
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

// ── Orders ─────────────────────────────────────────────────────
export async function getOrdersByUser(userId: string) {
  if (USE_MOCK) {
    await simulateDelay();
    const { mockOrders } = await import("./mock-data");
    return mockOrders.filter((o) => o.userId === userId);
  }
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/orders?userId=${userId}`,
  );
  if (!res.ok) throw new Error("Failed to fetch orders");
  return res.json();
}

// ── Rentals ────────────────────────────────────────────────────
export async function getRentalsByUser(userId: string) {
  if (USE_MOCK) {
    await simulateDelay();
    const { mockRentals } = await import("./mock-data");
    return mockRentals.filter((r) => r.userId === userId);
  }
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/rentals?userId=${userId}`,
  );
  if (!res.ok) throw new Error("Failed to fetch rentals");
  return res.json();
}

// ── Appointments ───────────────────────────────────────────────
export async function getAppointmentsByUser(userId: string) {
  if (USE_MOCK) {
    await simulateDelay();
    const { mockAppointments } = await import("./mock-data");
    return mockAppointments.filter((a) => a.userId === userId);
  }
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/appointments?userId=${userId}`,
  );
  if (!res.ok) throw new Error("Failed to fetch appointments");
  return res.json();
}

// ── Inquiries ──────────────────────────────────────────────────
export async function getInquiries() {
  if (USE_MOCK) {
    await simulateDelay();
    const { mockInquiries } = await import("./mock-data");
    return mockInquiries;
  }
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/inquiries`);
  if (!res.ok) throw new Error("Failed to fetch inquiries");
  return res.json();
}
