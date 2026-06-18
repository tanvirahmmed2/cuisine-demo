import { getTenantContext } from "@/lib/tenant/helper";
import { pool } from "@/lib/database/pg";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
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

    const { name, email, password, role, phone } = await req.json();
    if (!name || !email || !role || !password) {
      return NextResponse.json({ success: false, message: "Please fill all required information" }, { status: 400 });
    }

    if (password.trim().length < 6) {
      return NextResponse.json({ success: false, message: "Enter at least 6 digit password" }, { status: 400 });
    }

    // Check if email already exists
    const { rows: existing } = await pool.query(
      "SELECT id FROM restaurant_users WHERE email = $1 AND tenant_id = $2 LIMIT 1",
      [email, tenant_id]
    );

    if (existing.length > 0) {
      return NextResponse.json({ success: false, message: "User already exists with this email" }, { status: 400 });
    }

    const hashedPass = await bcrypt.hash(password, 10);
    const userPhone = phone || "01900000000";

    const { rows: newUser } = await pool.query(
      "INSERT INTO restaurant_users (tenant_id, name, email, password, phone, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, phone, role",
      [tenant_id, name, email, hashedPass, userPhone, role]
    );

    return NextResponse.json({
      success: true,
      message: "Successfully created user",
      payload: newUser[0],
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const tenantCtx = await getTenantContext();
    if (!tenantCtx.success) return NextResponse.json(tenantCtx, { status: tenantCtx.status });
    const tenant_id = tenantCtx.payload.tenant_id;

    const auth = await isAdmin();
    if (!auth.success) {
      return NextResponse.json({ success: false, message: auth.message }, { status: 401 });
    }

    const { id, email, role } = await req.json();
    if ((!id && !email) || !role) {
      return NextResponse.json({ success: false, message: "Missing id/email or role" }, { status: 400 });
    }

    let userId = id;

    // If email is provided instead of id, look up the user
    if (!userId && email) {
      const { rows: emailSearch } = await pool.query(
        "SELECT id FROM restaurant_users WHERE email = $1 AND tenant_id = $2 LIMIT 1",
        [email, tenant_id]
      );
      if (emailSearch.length === 0) {
        return NextResponse.json({ success: false, message: "User with this email not found" }, { status: 404 });
      }
      userId = emailSearch[0].id;
    }

    const validRoles = ['admin', 'manager', 'sales', 'user'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ success: false, message: "Invalid role specified" }, { status: 400 });
    }

    // Check if updating the last admin
    if (role !== 'admin') {
      const { rows: staffRows } = await pool.query(
        "SELECT role FROM restaurant_users WHERE id = $1 AND tenant_id = $2 LIMIT 1",
        [userId, tenant_id]
      );

      if (staffRows.length > 0 && staffRows[0].role === 'admin') {
        const { rows: adminRows } = await pool.query(
          "SELECT id FROM restaurant_users WHERE role = 'admin' AND tenant_id = $1",
          [tenant_id]
        );
        if (adminRows.length <= 1) {
          return NextResponse.json({ success: false, message: "Cannot demote the last admin" }, { status: 400 });
        }
      }
    }

    const { rows: updatedUser } = await pool.query(
      "UPDATE restaurant_users SET role = $1 WHERE id = $2 AND tenant_id = $3 RETURNING id, name, email, role",
      [role, userId, tenant_id]
    );

    if (updatedUser.length === 0) {
      return NextResponse.json({ success: false, message: "User not found or update failed" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Role updated successfully",
      payload: updatedUser[0],
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
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
      return NextResponse.json({ success: false, message: "User id not found" }, { status: 400 });
    }

    const { rows: userRows } = await pool.query(
      "SELECT id, role FROM restaurant_users WHERE id = $1 AND tenant_id = $2 LIMIT 1",
      [id, tenant_id]
    );

    if (userRows.length === 0) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const user = userRows[0];

    // Ensure at least one admin remains
    const { rows: adminRows } = await pool.query(
      "SELECT id FROM restaurant_users WHERE role = 'admin' AND tenant_id = $1",
      [tenant_id]
    );

    if (adminRows.length === 1 && user.role === "admin") {
      return NextResponse.json({ success: false, message: "This account can't be removed (last admin)" }, { status: 400 });
    }

    await pool.query("DELETE FROM restaurant_users WHERE id = $1 AND tenant_id = $2", [id, tenant_id]);

    return NextResponse.json({
      success: true,
      message: "User has been deleted",
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
