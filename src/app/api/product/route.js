import { getTenantContext } from "@/lib/tenant/helper";
import cloudinary from "@/lib/database/cloudinary";
import { pool } from "@/lib/database/pg";
import { NextResponse } from "next/server";
import slugify from "slugify";
import { isManager } from "@/lib/auth/middleware";

export async function GET(req) {
  try {
    const tenantCtx = await getTenantContext();
    if (!tenantCtx.success) return NextResponse.json(tenantCtx, { status: tenantCtx.status });
    const tenant_id = tenantCtx.payload.tenant_id;

    const { searchParams } = new URL(req.url);
    const category_id = searchParams.get("q");

    let query = "SELECT p.*, c.name as category_name, c.slug as category_slug FROM restaurant_items p LEFT JOIN restaurant_categories c ON p.category_id = c.id WHERE p.tenant_id = $1";
    let params = [tenant_id];

    if (category_id) {
      query += " AND p.category_id = $2";
      params.push(category_id);
    }

    query += " ORDER BY p.created_at DESC";

    const { rows: items } = await pool.query(query, params);

    // Fetch variants for all items
    const itemIds = items.map(i => i.id);
    let variantsMap = {};
    if (itemIds.length > 0) {
      const { rows: variants } = await pool.query(
        "SELECT * FROM restaurant_item_variants WHERE item_id = ANY($1) AND tenant_id = $2",
        [itemIds, tenant_id]
      );
      variants.forEach(v => {
        if (!variantsMap[v.item_id]) variantsMap[v.item_id] = [];
        variantsMap[v.item_id].push(v);
      });
    }

    const payload = items.map(item => ({
      ...item,
      variants: variantsMap[item.id] || []
    }));

    return NextResponse.json({
      success: true,
      message: "Products fetched successfully",
      payload: payload,
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Failed to fetch data",
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

    const formData = await req.formData();
    const title = formData.get("title");
    const description = formData.get("description");
    const category_id = formData.get("category_id");
    const price = Number(formData.get("price"));
    const discount = Number(formData.get("discount")) || 0;

    if (!title || !description || !category_id || !price) {
      return NextResponse.json({ success: false, message: "Please fill all required information" }, { status: 400 });
    }

    const imageFile = formData.get("image");
    if (!imageFile) {
      return NextResponse.json({ success: false, message: "Please add an image" }, { status: 400 });
    }

    const slug = slugify(title, { lower: true, strict: true });

    // Check if product exists
    const { rows: existingProduct } = await pool.query(
      "SELECT id FROM restaurant_items WHERE slug = $1 AND tenant_id = $2 LIMIT 1",
      [slug, tenant_id]
    );

    if (existingProduct.length > 0) {
      return NextResponse.json({ success: false, message: "Product already exists" }, { status: 400 });
    }

    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const cloudImage = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "res-items",
          public_id: slug,
          use_filename: true,
          unique_filename: false
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    const { rows: newProduct } = await pool.query(
      "INSERT INTO restaurant_items (tenant_id, category_id, title, slug, description, price, discount, image, image_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
      [tenant_id, category_id, title, slug, description, price, discount, cloudImage.secure_url, cloudImage.public_id]
    );

    const product = newProduct[0];

    // Handle variants if provided
    const variantsStr = formData.get("variants");
    if (variantsStr) {
      try {
        const variants = JSON.parse(variantsStr);
        if (Array.isArray(variants) && variants.length > 0) {
          for (const variant of variants) {
            await pool.query(
              "INSERT INTO restaurant_item_variants (tenant_id, item_id, name, value, price_adjustment, is_default) VALUES ($1, $2, $3, $4, $5, $6)",
              [tenant_id, product.id, variant.name, variant.value, Number(variant.price_adjustment) || 0, variant.is_default || false]
            );
          }
        }
      } catch (e) {
        console.error("Failed to parse variants", e);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Successfully added new product",
      payload: product,
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Failed to add product",
      error: error.message,
    }, { status: 500 });
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
      "SELECT * FROM restaurant_items WHERE id = $1 AND tenant_id = $2 LIMIT 1",
      [id, tenant_id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }

    const product = rows[0];

    if (product.image_id) {
      await cloudinary.uploader.destroy(product.image_id);
    }

    await pool.query("DELETE FROM restaurant_items WHERE id = $1 AND tenant_id = $2", [id, tenant_id]);

    return NextResponse.json({
      success: true,
      message: "Successfully deleted product",
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Failed to delete product",
      error: error.message,
    }, { status: 500 });
  }
}
