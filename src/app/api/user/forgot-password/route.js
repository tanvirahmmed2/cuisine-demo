import { getTenantContext, getBaseUrl } from "@/lib/tenant/helper";
import { pool } from "@/lib/database/pg";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { sendEmail } from "@/lib/email";

export async function POST(req) {
  try {
    const tenantCtx = await getTenantContext();
    if (!tenantCtx.success) return NextResponse.json(tenantCtx, { status: tenantCtx.status });
    const tenant_id = tenantCtx.payload.tenant_id;

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 });
    }

    const { rows } = await pool.query(
      "SELECT id, name FROM restaurant_users WHERE email = $1 AND tenant_id = $2 LIMIT 1",
      [email, tenant_id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ success: true, message: "If an account exists with this email, a reset link will be sent." }, { status: 200 });
    }

    const user = rows[0];
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await pool.query(
      "UPDATE restaurant_users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3 AND tenant_id = $4",
      [resetToken, expires, user.id, tenant_id]
    );

    const baseUrl = await getBaseUrl();
    const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;
    
    await sendEmail({
      to: email,
      subject: "Password Reset Request",
      htmlContent: `<p>Hello ${user.name},</p><p>You requested a password reset. Click the link below to set a new password:</p><p><a href="${resetLink}">${resetLink}</a></p><p>This link will expire in 1 hour.</p><p>If you did not request this, please ignore this email.</p>`
    });

    return NextResponse.json({ success: true, message: "If an account exists with this email, a reset link will be sent." }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to process request", error: error.message }, { status: 500 });
  }
}
