import { getTenantContext } from "@/lib/tenant/helper";
import { pool } from "@/lib/database/pg";
import { NextResponse } from "next/server";
import { isManager } from "@/lib/auth/middleware";

export async function POST(req) {
  try {
    const tenantCtx = await getTenantContext();
    if (!tenantCtx.success) return NextResponse.json(tenantCtx, { status: tenantCtx.status });
    const tenant_id = tenantCtx.payload.tenant_id;

    const auth = await isManager();
    if (!auth.success) {
      return NextResponse.json({ success: false, message: auth.message }, { status: 401 });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ success: false, message: "Id not found" }, { status: 400 });
    }

    const { rows } = await pool.query(
      "SELECT id, is_available FROM restaurant_items WHERE id = $1 AND tenant_id = $2",
      [id, tenant_id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }

    const currentStatus = rows[0].is_available;
    const newStatus = !currentStatus;

    await pool.query(
      "UPDATE restaurant_items SET is_available = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND tenant_id = $3",
      [newStatus, id, tenant_id]
    );

    return NextResponse.json({
      success: true,
      message: newStatus ? "Product is available now" : "Product is unavailable now",
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Failed to change status",
      error: error.message,
    }, { status: 500 });
  }
}