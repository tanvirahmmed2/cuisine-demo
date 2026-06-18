import { getTenantContext } from "@/lib/tenant/helper";
import { pool } from "@/lib/database/pg";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const tenantCtx = await getTenantContext();
    if (!tenantCtx.success) return NextResponse.json(tenantCtx, { status: tenantCtx.status });
    const tenant_id = tenantCtx.payload.tenant_id;

    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ success: false, message: "Token is required" }, { status: 400 });
    }

    // Find user with this token
    const { rows } = await pool.query(
      "SELECT id, verification_token_expires FROM restaurant_users WHERE verification_token = $1 AND tenant_id = $2 LIMIT 1",
      [token, tenant_id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: "Invalid verification token" }, { status: 400 });
    }

    const user = rows[0];

    if (new Date() > new Date(user.verification_token_expires)) {
      return NextResponse.json({ success: false, message: "Verification token has expired" }, { status: 400 });
    }

    await pool.query(
      "UPDATE restaurant_users SET is_verified = TRUE, verification_token = NULL, verification_token_expires = NULL WHERE id = $1 AND tenant_id = $2",
      [user.id, tenant_id]
    );

    return NextResponse.json({ success: true, message: "Account successfully verified" }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ success: false, message: "Verification failed", error: error.message }, { status: 500 });
  }
}
