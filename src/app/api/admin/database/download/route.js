import { getTenantContext } from "@/lib/tenant/helper";
import { pool } from "@/lib/database/pg";
import { isLogin } from "@/lib/auth/middleware";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const tenantCtx = await getTenantContext();
    if (!tenantCtx.success) return NextResponse.json(tenantCtx, { status: tenantCtx.status });
    const tenant_id = tenantCtx.payload.tenant_id;

    const auth = await isLogin();
    
    if (!auth.success || auth.payload.role !== 'admin') {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const tables = [
      "restaurant_users",
      "restaurant_customers",
      "restaurant_categories",
      "restaurant_items",
      "restaurant_item_variants",
      "restaurant_orders",
      "restaurant_order_items",
      "restaurant_order_item_variants",
      "restaurant_payments",
      "restaurant_expenses",
      "restaurant_reservations",
      "restaurant_support_tickets",
      "restaurant_reviews",
      "restaurant_websites"
    ];

    const databaseExport = {
      exported_at: new Date().toISOString(),
      data: {}
    };

    for (const table of tables) {
      const { rows } = await pool.query(`SELECT * FROM ${table} WHERE tenant_id = $1`, [tenant_id]);
      databaseExport.data[table] = rows;
    }

    const jsonString = JSON.stringify(databaseExport, null, 2);
    
    return new Response(jsonString, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename=restaurant_db_export_${new Date().getTime()}.json`,
      },
    });

  } catch (error) {
    console.error("Database export error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
