import { getTenantContext } from "@/lib/tenant/helper";
import { pool } from "@/lib/database/pg";
import { NextResponse } from "next/server";
import { isSales } from "@/lib/auth/middleware";

export async function POST(req) {
  let tenant_id;
  try {
    const tenantCtx = await getTenantContext();
    if (!tenantCtx.success) return NextResponse.json(tenantCtx, { status: tenantCtx.status });
    tenant_id = tenantCtx.payload.tenant_id;
  } catch(e) {
    return NextResponse.json({ success: false, message: "Context Error" }, { status: 500 });
  }

  const client = await pool.connect();
  try {
    const auth = await isSales();
    if (!auth.success) {
      return NextResponse.json({ success: false, message: auth.message }, { status: 401 });
    }

    const { order_id, amount, method, transaction_id } = await req.json();

    if (!order_id || !amount) {
      return NextResponse.json({ success: false, message: "Order ID and amount are required" }, { status: 400 });
    }

    await client.query("BEGIN");

    // 1. Verify order exists
    const { rows: orderRows } = await client.query(
      "SELECT id FROM restaurant_orders WHERE id = $1 AND tenant_id = $2 LIMIT 1",
      [order_id, tenant_id]
    );

    if (orderRows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    // 2. Insert Payment
    const { rows: paymentRows } = await client.query(
      `INSERT INTO restaurant_payments (tenant_id, order_id, amount, method, transaction_id, status) 
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [tenant_id, order_id, amount, method || "cash", transaction_id || "", "completed"]
    );

    // 3. Update Order Status
    await client.query(
      "UPDATE restaurant_orders SET payment_status = $1, status = $2 WHERE id = $3 AND tenant_id = $4",
      ["paid", "accepted", order_id, tenant_id]
    );

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      message: "Payment recorded successfully",
      payload: paymentRows[0],
    }, { status: 201 });

  } catch (error) {
    await client.query("ROLLBACK");
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function GET(req) {
  try {
    const tenantCtx = await getTenantContext();
    if (!tenantCtx.success) return NextResponse.json(tenantCtx, { status: tenantCtx.status });
    const tenant_id = tenantCtx.payload.tenant_id;

    const auth = await isSales();
    if (!auth.success) {
      return NextResponse.json({ success: false, message: auth.message }, { status: 401 });
    }

    const { rows } = await pool.query(
      "SELECT p.*, o.name as customer_name FROM restaurant_payments p LEFT JOIN restaurant_orders o ON p.order_id = o.id WHERE p.tenant_id = $1 ORDER BY p.created_at DESC",
      [tenant_id]
    );

    return NextResponse.json({
      success: true,
      message: "Successfully fetched payments",
      payload: rows,
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
