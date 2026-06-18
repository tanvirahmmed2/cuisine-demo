import { getTenantContext } from "@/lib/tenant/helper";
import { pool } from "@/lib/database/pg";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const tenantCtx = await getTenantContext();
    if (!tenantCtx.success) return NextResponse.json(tenantCtx, { status: tenantCtx.status });
    const tenant_id = tenantCtx.payload.tenant_id;

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, message: "Order ID is required" }, { status: 400 });
    }

    // Fetch order details
    const { rows: orderRows } = await pool.query(
      "SELECT * FROM restaurant_orders WHERE id = $1 AND tenant_id = $2 LIMIT 1",
      [id, tenant_id]
    );

    if (orderRows.length === 0) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    const order = orderRows[0];

    // Fetch order items
    const { rows: itemRows } = await pool.query(
      "SELECT * FROM restaurant_order_items WHERE order_id = $1 AND tenant_id = $2",
      [id, tenant_id]
    );

    // Fetch variants for all items in this order
    const itemIds = itemRows.map(item => item.id);
    let variantsMap = {};
    
    if (itemIds.length > 0) {
      const { rows: variantRows } = await pool.query(
        "SELECT * FROM restaurant_order_item_variants WHERE order_item_id = ANY($1) AND tenant_id = $2",
        [itemIds, tenant_id]
      );
      
      variantRows.forEach(v => {
        if (!variantsMap[v.order_item_id]) variantsMap[v.order_item_id] = [];
        variantsMap[v.order_item_id].push(v);
      });
    }

    order.items = itemRows.map(item => ({
      ...item,
      variants: variantsMap[item.id] || []
    }));

    return NextResponse.json({
      success: true,
      message: "Successfully fetched order details",
      payload: order,
    }, { status: 200 });

  } catch (error) {
    console.error("Order detail error:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch order details",
      error: error.message,
    }, { status: 500 });
  }
}