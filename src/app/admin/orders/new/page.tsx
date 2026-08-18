import { getAllProductsAdmin } from "@/lib/api/catalog/products";
import { getCustomers } from "@/lib/api/people/customers";
import { CreateOrderForm } from "@/components/orders/create-order-form";

export default async function NewOrderPage() {
  const [productsResult, customersResult] = await Promise.all([
    getAllProductsAdmin(0, 200),
    getCustomers(),
  ]);

  const products = productsResult.success ? productsResult.data : [];
  const customers = customersResult.success ? customersResult.data : [];

  return (
    <div>
      <h1 className="font-heading mb-4 text-xl font-medium text-foreground">New Order</h1>
      <CreateOrderForm products={products} customers={customers} />
    </div>
  );
}