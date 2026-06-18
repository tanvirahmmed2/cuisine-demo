import { getTenantContext } from "@/lib/tenant/helper";
import { pool } from "@/lib/database/pg";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const tenantCtx = await getTenantContext();
    if (!tenantCtx.success) return NextResponse.json(tenantCtx, { status: tenantCtx.status });
    const tenant_id = tenantCtx.payload.tenant_id;

    const { rows: orders } = await pool.query(
      "SELECT * FROM restaurant_orders WHERE status = 'pending' AND tenant_id = $1 ORDER BY created_at DESC",
      [tenant_id]
    );

    if (orders.length > 0) {
      const orderIds = orders.map(o => o.id);
      const { rows: itemRows } = await pool.query(
        "SELECT * FROM restaurant_order_items WHERE order_id = ANY($1) AND tenant_id = $2",
        [orderIds, tenant_id]
      );
      
      orders.forEach(order => {
        order.items = itemRows.filter(item => item.order_id === order.id);
      });
    }

    return NextResponse.json({
      success: true,
      message: "Successfully fetched pending orders",
      payload: orders,
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Failed to fetch pending orders",
      error: error.message,
    }, { status: 500 });
  }
}
