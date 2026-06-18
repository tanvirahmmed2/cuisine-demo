import { getTenantContext } from "@/lib/tenant/helper";
import { pool } from "@/lib/database/pg";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const tenantCtx = await getTenantContext();
    if (!tenantCtx.success) return NextResponse.json(tenantCtx, { status: tenantCtx.status });
    const tenant_id = tenantCtx.payload.tenant_id;

    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ success: false, message: "Token and new password are required" }, { status: 400 });
    }

    const { rows } = await pool.query(
      "SELECT id, reset_token_expires FROM restaurant_users WHERE reset_token = $1 AND tenant_id = $2 LIMIT 1",
      [token, tenant_id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: "Invalid reset token" }, { status: 400 });
    }

    const user = rows[0];

    if (new Date() > new Date(user.reset_token_expires)) {
      return NextResponse.json({ success: false, message: "Reset token has expired" }, { status: 400 });
    }

    const hashedPass = await bcrypt.hash(password, 10);

    await pool.query(
      "UPDATE restaurant_users SET password = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2 AND tenant_id = $3",
      [hashedPass, user.id, tenant_id]
    );

    return NextResponse.json({ success: true, message: "Password has been successfully reset" }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to reset password", error: error.message }, { status: 500 });
  }
}
