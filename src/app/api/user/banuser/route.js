import { getTenantContext } from "@/lib/tenant/helper";
import { pool } from "@/lib/database/pg";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth/middleware";

export async function POST(req) {
  try {
    const tenantCtx = await getTenantContext();
    if (!tenantCtx.success) return NextResponse.json(tenantCtx, { status: tenantCtx.status });
    const tenant_id = tenantCtx.payload.tenant_id;

    const auth = await isAdmin();
    if (!auth.success) {
      return NextResponse.json({ success: false, message: auth.message }, { status: 401 });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ success: false, message: "Id not found" }, { status: 400 });
    }

    const { rows: users } = await pool.query(
      "SELECT id, role, is_banned FROM restaurant_users WHERE id = $1 AND tenant_id = $2 LIMIT 1",
      [id, tenant_id]
    );

    if (users.length === 0) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const user = users[0];

    if (user.role === "manager" || user.role === "admin") {
      return NextResponse.json({
        success: false,
        message: "Management staff cannot be banned via this API",
      }, { status: 403 });
    }

    const newBanStatus = !user.is_banned;

    await pool.query(
      "UPDATE restaurant_users SET is_banned = $1 WHERE id = $2 AND tenant_id = $3",
      [newBanStatus, id, tenant_id]
    );

    return NextResponse.json({
      success: true,
      message: `User is ${newBanStatus ? "banned" : "unbanned"} successfully`,
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}