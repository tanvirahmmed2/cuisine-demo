import { getTenantContext } from "@/lib/tenant/helper";
import { pool } from "@/lib/database/pg";
import { isAdmin } from "@/lib/auth/middleware";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const tenantCtx = await getTenantContext();
    if (!tenantCtx.success) return NextResponse.json(tenantCtx, { status: tenantCtx.status });
    const tenant_id = tenantCtx.payload.tenant_id;

    const auth = await isAdmin();
    if (!auth.success) {
      return NextResponse.json({ message: auth.message }, { status: 401 });
    }

    const { rows } = await pool.query(
      `
      SELECT 
        c.id, 
        c.name, 
        c.phone,
        COUNT(o.id)::int as total_orders,
        COALESCE(SUM(o.total_price), 0)::float as total_spent
      FROM restaurant_customers c
      LEFT JOIN restaurant_orders o ON c.phone = o.phone AND o.tenant_id = c.tenant_id
      WHERE c.tenant_id = $1
      GROUP BY c.id, c.name, c.phone
      ORDER BY c.id DESC
      `,
      [tenant_id]
    );

    return NextResponse.json({ payload: rows });
  } catch (error) {
    console.error("Fetch customers error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
