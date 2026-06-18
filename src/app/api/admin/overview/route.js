import { getTenantContext } from "@/lib/tenant/helper";
import { pool } from "@/lib/database/pg";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth/middleware";

export async function GET(req) {
  try {
    const tenantCtx = await getTenantContext();
    if (!tenantCtx.success) return NextResponse.json(tenantCtx, { status: tenantCtx.status });
    const tenant_id = tenantCtx.payload.tenant_id;

    const auth = await isAdmin();
    if (!auth.success) {
      return NextResponse.json({ success: false, message: auth.message }, { status: 401 });
    }

    const { rows: orderStats } = await pool.query(
      `SELECT COUNT(id) as total_orders, COALESCE(SUM(total_price), 0) as total_revenue 
       FROM restaurant_orders 
       WHERE status != 'canceled' AND tenant_id = $1`,
       [tenant_id]
    );

    // 2. Pending Orders
    const { rows: pendingStats } = await pool.query(
      `SELECT COUNT(id) as pending_orders 
       FROM restaurant_orders 
       WHERE status = 'pending' AND tenant_id = $1`,
       [tenant_id]
    );

    // 3. Total Customers
    const { rows: customerStats } = await pool.query(
      `SELECT COUNT(id) as total_customers 
       FROM restaurant_customers WHERE tenant_id = $1`,
       [tenant_id]
    );

    // 4. Total Items
    const { rows: itemStats } = await pool.query(
      `SELECT COUNT(id) as total_items 
       FROM restaurant_items WHERE tenant_id = $1`,
       [tenant_id]
    );

    const payload = {
      totalOrders: parseInt(orderStats[0].total_orders) || 0,
      totalRevenue: parseFloat(orderStats[0].total_revenue) || 0,
      pendingOrders: parseInt(pendingStats[0].pending_orders) || 0,
      totalCustomers: parseInt(customerStats[0].total_customers) || 0,
      totalItems: parseInt(itemStats[0].total_items) || 0,
    };

    return NextResponse.json({
      success: true,
      message: "Successfully fetched overview",
      payload,
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Failed to fetch overview",
      error: error.message,
    }, { status: 500 });
  }
}
