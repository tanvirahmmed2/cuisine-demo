import { pool } from "@/lib/database/pg";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const queries = [
      'CREATE INDEX IF NOT EXISTS idx_restaurant_items_tenant ON restaurant_items(tenant_id);',
      'CREATE INDEX IF NOT EXISTS idx_restaurant_categories_tenant ON restaurant_categories(tenant_id);',
      'CREATE INDEX IF NOT EXISTS idx_restaurant_orders_tenant ON restaurant_orders(tenant_id);',
      'CREATE INDEX IF NOT EXISTS idx_restaurant_reviews_tenant ON restaurant_reviews(tenant_id);',
      'CREATE INDEX IF NOT EXISTS idx_restaurant_offers_tenant ON restaurant_offers(tenant_id);',
      'CREATE INDEX IF NOT EXISTS idx_restaurant_users_tenant ON restaurant_users(tenant_id);',
      'CREATE INDEX IF NOT EXISTS idx_restaurant_customers_tenant ON restaurant_customers(tenant_id);',
      'CREATE INDEX IF NOT EXISTS idx_restaurant_support_tickets_tenant ON restaurant_support_tickets(tenant_id);',
      'CREATE INDEX IF NOT EXISTS idx_restaurant_contact_tickets_tenant ON restaurant_contact_tickets(tenant_id);'
    ];

    for (const query of queries) {
      await pool.query(query);
    }
    
    return NextResponse.json({ success: true, message: "Indexes added successfully" });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message });
  }
}
