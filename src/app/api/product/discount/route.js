import { getTenantContext } from "@/lib/tenant/helper";
import { pool } from "@/lib/database/pg";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const tenantCtx = await getTenantContext();
    if (!tenantCtx.success) return NextResponse.json(tenantCtx, { status: tenantCtx.status });
    const tenant_id = tenantCtx.payload.tenant_id;

    const { rows } = await pool.query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug 
       FROM restaurant_items p 
       LEFT JOIN restaurant_categories c ON p.category_id = c.id 
       WHERE p.discount > 0 AND p.tenant_id = $1
       ORDER BY p.created_at DESC`,
      [tenant_id]
    );

    return NextResponse.json({
      success: true,
      message: "Successfully fetched data",
      payload: rows,
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Failed to fetch data",
      error: error.message,
    }, { status: 500 });
  }
}