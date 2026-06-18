import { getTenantContext, getBaseUrl } from "@/lib/tenant/helper";
import { pool } from "@/lib/database/pg";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { isLogin } from "@/lib/auth/middleware";
import crypto from "crypto";
import { sendEmail } from "@/lib/email";

export async function POST(req) {
  try {
    const tenantCtx = await getTenantContext();
    if (!tenantCtx.success) return NextResponse.json(tenantCtx, { status: tenantCtx.status });
    const tenant_id = tenantCtx.payload.tenant_id;

    const { name, email, password, phone } = await req.json();
    if (!name || !email || !password || !phone) {
      return NextResponse.json({ success: false, message: "Please fill all information" }, { status: 400 });
    }

    if (phone.length !== 11) {
      return NextResponse.json({ success: false, message: "Please enter a valid phone number" }, { status: 400 });
    }

    // Check if user exists
    const { rows: existingUser } = await pool.query(
      "SELECT * FROM restaurant_users WHERE (email = $1 OR phone = $2) AND tenant_id = $3 LIMIT 1",
      [email, phone, tenant_id]
    );

    if (existingUser.length > 0) {
      return NextResponse.json({ success: false, message: "User already exists with this email/phone" }, { status: 400 });
    }

    const hashedPass = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const { rows: newUser } = await pool.query(
      "INSERT INTO restaurant_users (tenant_id, name, email, password, phone, is_verified, verification_token, verification_token_expires) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, name, email, phone, role",
      [tenant_id, name, email, hashedPass, phone, false, verificationToken, verificationExpires]
    );

    const baseUrl = await getBaseUrl();
    const verificationLink = `${baseUrl}/verify?token=${verificationToken}`;
    
    await sendEmail({
      to: email,
      subject: "Verify your account",
      htmlContent: `<p>Hello ${name},</p><p>Please verify your account by clicking the link below:</p><p><a href="${verificationLink}">${verificationLink}</a></p><p>This link will expire in 24 hours.</p>`
    });

    return NextResponse.json({
      success: true,
      message: "Successfully created user. Please check your email to verify your account.",
      payload: newUser[0],
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Failed to create user",
      error: error.message,
    }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const tenantCtx = await getTenantContext();
    if (!tenantCtx.success) return NextResponse.json(tenantCtx, { status: tenantCtx.status });
    const tenant_id = tenantCtx.payload.tenant_id;

    const auth = await isLogin();
    if (!auth.success) {
      return NextResponse.json({ success: false, message: auth.message }, { status: 401 });
    }

    return NextResponse.json({ success: true, message: "Successfully verified user", payload: auth.payload }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to authenticate user", error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const tenantCtx = await getTenantContext();
    if (!tenantCtx.success) return NextResponse.json(tenantCtx, { status: tenantCtx.status });
    const tenant_id = tenantCtx.payload.tenant_id;

    const auth = await isLogin();
    if (!auth.success) {
      return NextResponse.json({ success: false, message: auth.message }, { status: 401 });
    }

    const authenticatedUser = auth.payload;
    const { name, email, password } = await req.json();

    if (!name && !email && !password) {
      return NextResponse.json({ success: false, message: "Please provide data to update" }, { status: 400 });
    }

    const { rows: currentUserRows } = await pool.query(
      "SELECT * FROM restaurant_users WHERE id = $1 AND tenant_id = $2 LIMIT 1",
      [authenticatedUser.id, tenant_id]
    );

    if (currentUserRows.length === 0) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const currentUser = currentUserRows[0];
    const newName = name || currentUser.name;
    const newEmail = email || currentUser.email;

    const isNameChanged = newName !== currentUser.name;
    const isEmailChanged = newEmail !== currentUser.email;

    if (isEmailChanged) {
      const { rows: emailCheck } = await pool.query(
        "SELECT id FROM restaurant_users WHERE email = $1 AND tenant_id = $2 LIMIT 1",
        [newEmail, tenant_id]
      );
      if (emailCheck.length > 0) {
        return NextResponse.json({ success: false, message: "Email is already in use by another account" }, { status: 400 });
      }
    }

    let isPasswordChanged = false;
    if (password && password.trim() !== "") {
      const isMatching = await bcrypt.compare(password, currentUser.password);
      if (!isMatching) {
        isPasswordChanged = true;
      }
    }

    if (!isNameChanged && !isEmailChanged && !isPasswordChanged) {
      return NextResponse.json({ success: false, message: "No changes detected" }, { status: 200 });
    }

    let finalPassword = currentUser.password;
    if (isPasswordChanged) {
      finalPassword = await bcrypt.hash(password, 10);
    }

    const { rows: updatedUser } = await pool.query(
      "UPDATE restaurant_users SET name = $1, email = $2, password = $3 WHERE id = $4 AND tenant_id = $5 RETURNING id, name, email, phone, role",
      [newName, newEmail, finalPassword, authenticatedUser.id, tenant_id]
    );

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
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

    const auth = await isLogin();
    if (!auth.success) {
      return NextResponse.json({ success: false, message: auth.message }, { status: 401 });
    }

    const user = auth.payload;

    if (user.role === "admin") {
      const { rows: adminRows } = await pool.query(
        "SELECT id FROM restaurant_users WHERE role = 'admin' AND tenant_id = $1",
        [tenant_id]
      );

      if (adminRows.length === 1) {
        return NextResponse.json({
          success: false,
          message: "This account can't be removed (last admin)",
        }, { status: 400 });
      }
    }

    await pool.query("DELETE FROM restaurant_users WHERE id = $1 AND tenant_id = $2", [user.id, tenant_id]);

    const res = NextResponse.json({
      success: true,
      message: "Successfully deleted account",
    }, { status: 200 });

    res.cookies.set("restaurant_token", "", {
      httpOnly: true,
      expires: new Date(0),
      path: "/",
    });

    return res;

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error.message,
    }, { status: 500 });
  }
}