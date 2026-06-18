import { getTenantContext } from "@/lib/tenant/helper";
import { pool } from "@/lib/database/pg";
import { NextResponse } from "next/server";
import { isLogin } from "@/lib/auth/middleware";

export async function GET(req) {
  try {
    const tenantCtx = await getTenantContext();
    if (!tenantCtx.success) return NextResponse.json(tenantCtx, { status: tenantCtx.status });
    const tenant_id = tenantCtx.payload.tenant_id;

    const auth = await isLogin();
    if (!auth.success) {
      return NextResponse.json({ success: false, message: auth.message }, { status: 401 });
    }

    const user = auth.payload;

    const { rows: orders } = await pool.query(
      "SELECT * FROM restaurant_orders WHERE phone = $1 AND tenant_id = $2 ORDER BY created_at DESC",
      [user.phone, tenant_id]
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
      message: "Successfully fetched user orders",
      payload: orders,
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    }, { status: 500 });
  }
}
