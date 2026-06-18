import { getTenantContext } from "@/lib/tenant/helper";
import { pool } from "@/lib/database/pg";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const tenantCtx = await getTenantContext();
    if (!tenantCtx.success) return NextResponse.json(tenantCtx, { status: tenantCtx.status });
    const tenant_id = tenantCtx.payload.tenant_id;

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ success: false, message: "ID not found" }, { status: 400 });
    }

    const { rowCount } = await pool.query(
      "UPDATE restaurant_orders SET status = 'cancelled', payment_status = 'unpaid' WHERE id = $1 AND tenant_id = $2",
      [id, tenant_id]
    );

    if (rowCount === 0) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Successfully cancelled order" }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Failed to cancel order",
      error: error.message,
    }, { status: 500 });
  }
}