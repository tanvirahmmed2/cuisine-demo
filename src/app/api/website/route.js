import { getTenantContext } from "@/lib/tenant/helper";
import { pool } from "@/lib/database/pg";
import { NextResponse } from "next/server";
import { isManager } from "@/lib/auth/middleware";

export async function GET(req) {
  try {
    const tenantCtx = await getTenantContext();
    if (!tenantCtx.success) return NextResponse.json(tenantCtx, { status: tenantCtx.status });
    const tenant_id = tenantCtx.payload.tenant_id;

    const query = `
      SELECT 
        w.*,
        t.status as tenant_status,
        s.status as subscription_status,
        s.end_date as current_period_end,
        p.name as package_name,
        p.slug as package_slug
      FROM ress_tenants t
      LEFT JOIN restaurant_websites w ON t.tenant_id = w.tenant_id
      LEFT JOIN (
        SELECT * FROM ress_subscriptions 
        WHERE tenant_id = $1 
        ORDER BY created_at DESC LIMIT 1
      ) s ON t.tenant_id = s.tenant_id
      LEFT JOIN ress_packages p ON s.package_id = p.package_id
      WHERE t.tenant_id = $1
    `;

    const { rows } = await pool.query(query, [tenant_id]);

    if (rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: "Tenant not found",
        payload: null,
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Website details fetched successfully",
      payload: rows[0],
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Failed to fetch website details",
      error: error.message,
    }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const tenantCtx = await getTenantContext();
    if (!tenantCtx.success) return NextResponse.json(tenantCtx, { status: tenantCtx.status });
    const tenant_id = tenantCtx.payload.tenant_id;

    const auth = await isManager();
    if (!auth.success) {
      return NextResponse.json({ success: false, message: auth.message }, { status: 401 });
    }

    const body = await req.json();

    const allowedFields = [
      'logo_url', 'theme_color', 'hero_title', 'hero_subtitle',
      'name', 'address', 'tagline', 'sociallink', 'email', 'phone'
    ];

    const updates = {};
    Object.keys(body).forEach(key => {
      if (allowedFields.includes(key)) {
        updates[key] = body[key];
      }
    });

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, message: "No valid fields provided for update" }, { status: 400 });
    }

    const { rows: existing } = await pool.query("SELECT website_id FROM restaurant_websites WHERE tenant_id = $1 LIMIT 1", [tenant_id]);

    if (existing.length === 0) {
      // Insert new row if none exists
      const columns = Object.keys(updates);
      const values = Object.values(updates);
      
      const insertCols = ['tenant_id', ...columns].join(", ");
      const insertPlaceholders = ['$1', ...columns.map((_, i) => `$${i + 2}`)].join(", ");
      
      const insertQuery = `INSERT INTO restaurant_websites (${insertCols}) VALUES (${insertPlaceholders}) RETURNING *`;
      const { rows } = await pool.query(insertQuery, [tenant_id, ...values]);
      
      return NextResponse.json({
        success: true,
        message: "Website details initialized successfully",
        payload: rows[0],
      }, { status: 201 });
    }

    // Update existing row
    const columns = Object.keys(updates);
    const setClause = columns.map((col, idx) => `${col} = $${idx + 2}`).join(", ");
    const values = Object.values(updates);
    const query = `UPDATE restaurant_websites SET ${setClause}, updated_at = NOW() WHERE tenant_id = $1 RETURNING *`;
    const { rows } = await pool.query(query, [tenant_id, ...values]);

    return NextResponse.json({
      success: true,
      message: "Website details updated successfully",
      payload: rows[0],
    }, { status: 200 });

  } catch (error) {
    console.error("Website Update Error:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to update website details",
      error: error.message,
    }, { status: 500 });
  }
}