import { createOrderAction } from "@/lib/actions/orders";
import type { AdminUser } from "@/types/user";
import type { DiscountType } from "@/types/order";
import type { OrderLine } from "../types";

interface SubmitPurchaseOrderArgs {
  selectedCustomer: AdminUser;
  orderItems: OrderLine[];
  fulfillmentMethod: string;
  paymentMethod: string;
  orderNotes: string;
  discountType: DiscountType | "";
  discountValue: string;
  discountReason: string;
}

type SubmitPurchaseOrderResult =
  | { success: true; orderId: string | null }
  | { success: false; message: string };

/**
 * Leaving the order step: create the real order via createOrderAction.
 * PURCHASE only — CUSTOM has nothing to submit yet, and RENTAL already
 * created its Order+Rental pair when leaving measurements (see
 * rental-booking-submit.ts).
 *
 * Extracted from WalkInSalePanel.goNext() verbatim — same itemsJson
 * shape, same discount-fields-only-when-set behavior.
 */
export async function submitPurchaseOrder(args: SubmitPurchaseOrderArgs): Promise<SubmitPurchaseOrderResult> {
  const {
    selectedCustomer,
    orderItems,
    fulfillmentMethod,
    paymentMethod,
    orderNotes,
    discountType,
    discountValue,
    discountReason,
  } = args;

  const formData = new FormData();
  formData.set(
    "itemsJson",
    JSON.stringify(
      orderItems.map((i) => ({
        productId: i.product.id,
        quantity: i.quantity,
        ...(i.size ? { size: i.size } : {}),
      })),
    ),
  );
  formData.set("customerId", selectedCustomer.id);
  formData.set("orderMode", "WALK_IN");
  formData.set("fulfillmentMethod", fulfillmentMethod);
  formData.set("paymentMethod", paymentMethod);
  formData.set("notes", orderNotes);
  formData.set("customerPhone", selectedCustomer.phone ?? "");
  if (discountType) {
    formData.set("discountType", discountType);
    formData.set("discountValue", discountValue);
    formData.set("discountReason", discountReason);
  }

  const result = await createOrderAction(null, formData);

  if (!result?.success) {
    return { success: false, message: result?.message || "Could not create the order. Try again before continuing." };
  }
  return { success: true, orderId: result.orderId ?? null };
}
