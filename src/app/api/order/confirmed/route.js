import { getTenantContext } from "@/lib/tenant/helper";
import { pool } from "@/lib/database/pg";
import { NextResponse } from "next/server";
import { isSales } from "@/lib/auth/middleware";

export async function POST(req) {
  try {
    const tenantCtx = await getTenantContext();
    if (!tenantCtx.success) return NextResponse.json(tenantCtx, { status: tenantCtx.status });
    const tenant_id = tenantCtx.payload.tenant_id;

    const auth = await isSales();
    if (!auth.success) {
      return NextResponse.json({ success: false, message: auth.message }, { status: 401 });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ success: false, message: "ID not found" }, { status: 400 });
    }

    const { rowCount } = await pool.query(
      "UPDATE restaurant_orders SET status = 'cooking' WHERE id = $1 AND tenant_id = $2",
      [id, tenant_id]
    );

    if (rowCount === 0) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Successfully confirmed order" }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Failed to confirm order",
      error: error.message,
    }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const tenantCtx = await getTenantContext();
    if (!tenantCtx.success) return NextResponse.json(tenantCtx, { status: tenantCtx.status });
    const tenant_id = tenantCtx.payload.tenant_id;

    const { rows: orders } = await pool.query(
      "SELECT * FROM restaurant_orders WHERE status = 'confirmed' AND tenant_id = $1 ORDER BY created_at DESC",
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
      message: "Successfully fetched confirmed orders",
      payload: orders,
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Failed to fetch confirmed orders",
      error: error.message,
    }, { status: 500 });
  }
}
