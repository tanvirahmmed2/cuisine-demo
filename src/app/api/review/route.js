import { getTenantContext } from "@/lib/tenant/helper";
import { pool } from "@/lib/database/pg";
import { NextResponse } from "next/server";
import { isManager } from "@/lib/auth/middleware";

export async function GET(req) {
  try {
    const tenantCtx = await getTenantContext();
    if (!tenantCtx.success) return NextResponse.json(tenantCtx, { status: tenantCtx.status });
    const tenant_id = tenantCtx.payload.tenant_id;

    const { rows } = await pool.query(
      "SELECT * FROM restaurant_reviews WHERE tenant_id = $1 ORDER BY id DESC",
      [tenant_id]
    );

    return NextResponse.json({
      success: true,
      message: "Successfully fetched data",
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

    const { name, email, comment, rating } = await req.json();
    if (!name || !email || !comment || !rating) {
      return NextResponse.json({ success: false, message: "Please provide all information" }, { status: 400 });
    }

    // Enforce one review per email
    const { rows: existing } = await pool.query(
      "SELECT id FROM restaurant_reviews WHERE email = $1 AND tenant_id = $2 LIMIT 1",
      [email, tenant_id]
    );

    if (existing.length > 0) {
      return NextResponse.json({ success: false, message: "Review already submitted with this email" }, { status: 400 });
    }

    const { rows: newReview } = await pool.query(
      "INSERT INTO restaurant_reviews (tenant_id, name, email, comment, rating) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [tenant_id, name, email, comment, rating]
    );

    return NextResponse.json({
      success: true,
      message: "Successfully submitted review",
      payload: newReview[0],
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
      "SELECT id FROM restaurant_reviews WHERE id = $1 AND tenant_id = $2 LIMIT 1",
      [id, tenant_id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: "Review not found" }, { status: 404 });
    }

    await pool.query("DELETE FROM restaurant_reviews WHERE id = $1 AND tenant_id = $2", [id, tenant_id]);

    return NextResponse.json({
      success: true,
      message: "Successfully deleted review",
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
