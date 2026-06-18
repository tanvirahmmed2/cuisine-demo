import { getTenantContext } from "@/lib/tenant/helper";
import { pool } from "@/lib/database/pg";
import { NextResponse } from "next/server";
import { isManager } from "@/lib/auth/middleware";

export async function GET(req) {
  try {
    const tenantCtx = await getTenantContext();
    if (!tenantCtx.success) return NextResponse.json(tenantCtx, { status: tenantCtx.status });
    const tenant_id = tenantCtx.payload.tenant_id;

    const auth = await isManager();
    if (!auth.success) {
      return NextResponse.json({ success: false, message: auth.message }, { status: 401 });
    }

    const { rows } = await pool.query(
      "SELECT * FROM restaurant_support_tickets WHERE tenant_id = $1 ORDER BY created_at DESC",
      [tenant_id]
    );

    return NextResponse.json({
      success: true,
      message: "Successfully fetched support data",
      payload: rows,
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const tenantCtx = await getTenantContext();
    if (!tenantCtx.success) return NextResponse.json(tenantCtx, { status: tenantCtx.status });
    const tenant_id = tenantCtx.payload.tenant_id;

    const { name, email, subject, message } = await req.json();
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ success: false, message: "Please fill all information" }, { status: 400 });
    }

    const { rows: newSupport } = await pool.query(
      "INSERT INTO restaurant_support_tickets (tenant_id, name, email, subject, message) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [tenant_id, name, email, subject, message]
    );

    return NextResponse.json({
      success: true,
      message: "Placed support message. Wait for response",
      payload: newSupport[0],
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
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
      "SELECT id FROM restaurant_support_tickets WHERE id = $1 AND tenant_id = $2 LIMIT 1",
      [id, tenant_id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: "Support data not found" }, { status: 404 });
    }

    await pool.query("DELETE FROM restaurant_support_tickets WHERE id = $1 AND tenant_id = $2", [id, tenant_id]);

    return NextResponse.json({
      success: true,
      message: "Successfully deleted support data",
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}