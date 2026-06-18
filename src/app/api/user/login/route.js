import { getTenantContext } from "@/lib/tenant/helper";
import { pool } from "@/lib/database/pg";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET, NODE_ENV } from "@/lib/database/secret";

export async function POST(req) {
  try {
    const tenantCtx = await getTenantContext();
    if (!tenantCtx.success) return NextResponse.json(tenantCtx, { status: tenantCtx.status });
    const tenant_id = tenantCtx.payload.tenant_id;

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: "Please provide email and password",
      }, { status: 400 });
    }

    const { rows } = await pool.query(
      "SELECT * FROM restaurant_users WHERE email = $1 AND tenant_id = $2 LIMIT 1",
      [email, tenant_id]
    );

    if (rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No account found with this email",
      }, { status: 400 });
    }

    const user = rows[0];

    if (user.is_banned) {
      return NextResponse.json({
        success: false,
        message: "User is banned",
      }, { status: 400 });
    }

    if (!user.is_verified) {
      return NextResponse.json({
        success: false,
        message: "Please verify your email address to access your account.",
      }, { status: 401 });
    }

    const isMatchPassword = await bcrypt.compare(password, user.password);

    if (!isMatchPassword) {
      return NextResponse.json({
        success: false,
        message: "Incorrect password",
      }, { status: 400 });
    }

    const payload = { id: user.id, email: user.email, role: user.role };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

    const response = NextResponse.json(
      {
        success: true,
        message: "Successfully logged in",
        payload: { id: user.id, name: user.name, email: user.email, role: user.role },
      },
      { status: 200 }
    );

    response.cookies.set("restaurant_token", token, {
      httpOnly: true,
      secure: NODE_ENV,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Failed to login",
      error: error.message,
    }, { status: 500 });
  }
}