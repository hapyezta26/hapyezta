import postgres from "postgres";
import { products as initialProducts } from "./products";
import { base64Assets } from "./base64-assets";
import { getServerConfig } from "./config.server";

let sqlClient: ReturnType<typeof postgres> | null = null;

export function getSql() {
  if (!sqlClient) {
    const config = getServerConfig();
    const dbUrl = config.databaseUrl;
    if (!dbUrl) {
      throw new Error("DATABASE_URL environment variable is missing!");
    }
    sqlClient = postgres(dbUrl, {
      ssl: "require",
      max: 10,
      idle_timeout: 20,
    });
  }
  return sqlClient;
}

export async function initializeDatabase() {
  const sql = getSql();

  // 1. Create categories table
  await sql`
    CREATE TABLE IF NOT EXISTS categories (
      name TEXT PRIMARY KEY,
      img TEXT NOT NULL,
      color TEXT NOT NULL
    )
  `;

  // 2. Create products table
  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price TEXT NOT NULL,
      old_price TEXT,
      img TEXT NOT NULL,
      tag TEXT,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      stock_status TEXT NOT NULL,
      colors TEXT[] NOT NULL,
      details TEXT[] NOT NULL,
      weight INTEGER NOT NULL DEFAULT 500
    )
  `;

  // 3. Create orders table
  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      items JSONB NOT NULL,
      cart_total INTEGER NOT NULL,
      shipping_address JSONB NOT NULL,
      shipping_cost NUMERIC NOT NULL,
      grand_total NUMERIC NOT NULL,
      payment_method TEXT NOT NULL,
      screenshot TEXT,
      status TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      delivery_estimate TEXT
    )
  `;

  // 4. Create hero_images table
  await sql`
    CREATE TABLE IF NOT EXISTS hero_images (
      id SERIAL PRIMARY KEY,
      url TEXT NOT NULL,
      display_order INTEGER NOT NULL DEFAULT 0
    )
  `;

  // Check if categories are empty and seed them
  try {
    const catCountResult = await sql`SELECT COUNT(*)::integer FROM categories`;
    if (catCountResult[0].count === 0) {
      const initialCategories = [
        { name: "Cute Stationery", img: "c1", color: "var(--teal)" },
        { name: "Pencil Cases", img: "c2", color: "var(--coral)" },
        { name: "Journal Supplies", img: "c3", color: "var(--yellow)" },
        { name: "Sling & School Bags", img: "c4", color: "var(--purple)" },
        { name: "Bottles & Tumblers", img: "c5", color: "var(--orange)" },
        { name: "Lunch Box", img: "c6", color: "var(--coral)" },
        { name: "Gift Sets", img: "c7", color: "var(--teal)" },
        { name: "Makeup Pouches", img: "c8", color: "var(--purple)" },
      ];
      for (const cat of initialCategories) {
        await sql`
          INSERT INTO categories (name, img, color)
          VALUES (${cat.name}, ${cat.img}, ${cat.color})
          ON CONFLICT (name) DO NOTHING
        `;
      }
    }
  } catch (err) {
    console.error("Failed to seed categories:", err);
  }

  // Check if products are empty and seed them
  try {
    const prodCountResult = await sql`SELECT COUNT(*)::integer FROM products`;
    if (prodCountResult[0].count === 0) {
      for (const p of initialProducts) {
        await sql`
          INSERT INTO products (id, name, price, old_price, img, tag, category, description, stock_status, colors, details, weight)
          VALUES (
            ${p.id},
            ${p.name},
            ${p.price},
            ${p.oldPrice || null},
            ${p.img},
            ${p.tag || null},
            ${p.category},
            ${p.description},
            ${p.stockStatus},
            ${p.colors},
            ${p.details},
            ${p.weight || 500}
          )
          ON CONFLICT (id) DO NOTHING
        `;
      }
    }
  } catch (err) {
    console.error("Failed to seed products:", err);
  }

  // Check if hero images are empty and seed them
  try {
    const heroCountResult = await sql`SELECT COUNT(*)::integer FROM hero_images`;
    if (heroCountResult[0].count === 0) {
      const initialHeroImages = [
        "hero",
        "hero_slide_1",
        "hero_slide_2",
        "hero_slide_3",
      ];
      for (let i = 0; i < initialHeroImages.length; i++) {
        await sql`
          INSERT INTO hero_images (url, display_order)
          VALUES (${initialHeroImages[i]}, ${i})
        `;
      }
    }
  } catch (err) {
    console.error("Failed to seed hero images:", err);
  }
}
