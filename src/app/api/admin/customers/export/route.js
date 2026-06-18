import { getTenantContext } from "@/lib/tenant/helper";
import { pool } from "@/lib/database/pg";
import { isAdmin } from "@/lib/auth/middleware";
import { NextResponse } from "next/server";
import * as XLSX from 'xlsx';

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
        c.id as "Customer ID", 
        c.name as "Name", 
        c.phone as "Phone",
        COUNT(o.id)::int as "Total Orders",
        COALESCE(SUM(o.total_price), 0)::float as "Total Spent (BDT)"
      FROM restaurant_customers c
      LEFT JOIN restaurant_orders o ON c.phone = o.phone AND o.tenant_id = c.tenant_id
      WHERE c.tenant_id = $1
      GROUP BY c.id, c.name, c.phone
      ORDER BY c.id DESC
      `,
      [tenant_id]
    );

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customers Report");

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new Response(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename=customers_report_${new Date().getTime()}.xlsx`,
      },
    });

  } catch (error) {
    console.error("Customer export error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
