import { getTenantContext } from "@/lib/tenant/helper";
import { pool } from "@/lib/database/pg";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const tenantCtx = await getTenantContext();
    if (!tenantCtx.success) return NextResponse.json(tenantCtx, { status: tenantCtx.status });
    const tenant_id = tenantCtx.payload.tenant_id;

    const q = req.nextUrl.searchParams.get("q") || "";
    const cleanQuery = q.trim();

    if (!cleanQuery) {
      return NextResponse.json({ success: false, message: "Search query is required" }, { status: 400 });
    }

    let queryStr = "SELECT id, name, phone, delivery_method, table_no, sub_total, total_discount, total_price, payment_method, status, payment_status, created_at FROM restaurant_orders WHERE tenant_id = $1 AND (phone = $2";
    const params = [tenant_id, cleanQuery];

    const parsedId = parseInt(cleanQuery, 10);
    if (!isNaN(parsedId) && parsedId.toString() === cleanQuery) {
      queryStr += " OR id = $3";
      params.push(parsedId);
    }
    queryStr += ") ORDER BY created_at DESC";

    const { rows: orders } = await pool.query(queryStr, params);

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
      message: "Orders retrieved successfully",
      payload: orders,
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Failed to query orders",
      error: error.message,
    }, { status: 500 });
  }
}
