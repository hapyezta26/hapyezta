import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql, initializeDatabase } from "../db.server";
import { Product } from "../products";

const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.string(),
  oldPrice: z.string().optional(),
  img: z.string(),
  tag: z.string().optional(),
  category: z.string(),
  description: z.string(),
  stockStatus: z.enum(["in_stock", "low_stock", "sold_out"]),
  colors: z.array(z.string()),
  details: z.array(z.string()),
  weight: z.number().optional(),
});

const NewProductSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  price: z.string(),
  oldPrice: z.string().optional(),
  img: z.string(),
  tag: z.string().optional(),
  category: z.string(),
  description: z.string(),
  stockStatus: z.enum(["in_stock", "low_stock", "sold_out"]),
  colors: z.array(z.string()),
  details: z.array(z.string()),
  weight: z.number().optional(),
});

const CategorySchema = z.object({
  name: z.string(),
  img: z.string(),
  color: z.string(),
});

const OrderSchema = z.object({
  id: z.string(),
  customerName: z.string(),
  customerEmail: z.string(),
  customerPhone: z.string(),
  items: z.any(),
  cartTotal: z.number(),
  shippingAddress: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    pincode: z.string(),
  }),
  shippingCost: z.number(),
  grandTotal: z.number(),
  paymentMethod: z.string(),
  screenshot: z.string().optional(),
  status: z.string(),
  createdAt: z.string(),
  deliveryEstimate: z.string().optional(),
});

const mapDbProduct = (p: any): Product => ({
  id: p.id,
  name: p.name,
  price: p.price,
  oldPrice: p.old_price || undefined,
  img: p.img,
  tag: p.tag || undefined,
  category: p.category,
  description: p.description,
  stockStatus: p.stock_status as any,
  colors: p.colors || [],
  details: p.details || [],
  weight: p.weight,
});

const mapDbOrder = (o: any) => {
  const items = typeof o.items === "string" ? JSON.parse(o.items) : o.items;
  const shippingAddress = typeof o.shipping_address === "string" ? JSON.parse(o.shipping_address) : o.shipping_address;
  const shippingCost = parseFloat(o.shipping_cost);
  const grandTotal = parseFloat(o.grand_total);

  return {
    id: o.id,
    customerName: o.customer_name,
    customerEmail: o.customer_email,
    customerPhone: o.customer_phone,
    items,
    cartTotal: o.cart_total,
    shippingAddress,
    shippingCost,
    grandTotal,
    totalAmount: grandTotal,
    paymentMethod: o.payment_method,
    screenshot: o.screenshot || undefined,
    customerImage: o.screenshot || undefined,
    status: o.status,
    createdAt: o.created_at,
    date: o.created_at,
    deliveryEstimate: o.delivery_estimate || undefined,
  };
};

// 1. Fetch store data (runs DB migrations first)
export const getStoreData = createServerFn({ method: "POST" })
  .handler(async () => {
    await initializeDatabase();
    const sql = getSql();

    const dbProducts = await sql`SELECT * FROM products ORDER BY name ASC`;
    const dbCategories = await sql`SELECT * FROM categories ORDER BY name ASC`;
    const dbHeroImages = await sql`SELECT * FROM hero_images ORDER BY display_order ASC`;

    return {
      products: dbProducts.map(mapDbProduct),
      categories: dbCategories.map((c: any) => ({
        name: c.name,
        img: c.img,
        color: c.color,
      })),
      heroImages: dbHeroImages.map((h: any) => h.url),
    };
  });

// 2. Products CRUD
export const addProductFn = createServerFn({ method: "POST" })
  .inputValidator(NewProductSchema)
  .handler(async ({ data: input }) => {
    const sql = getSql();
    const id = input.id || input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    await sql`
      INSERT INTO products (id, name, price, old_price, img, tag, category, description, stock_status, colors, details, weight)
      VALUES (
        ${id},
        ${input.name},
        ${input.price},
        ${input.oldPrice || null},
        ${input.img},
        ${input.tag || null},
        ${input.category},
        ${input.description},
        ${input.stockStatus},
        ${input.colors},
        ${input.details},
        ${input.weight ?? 500}
      )
    `;

    return { success: true, id };
  });

export const updateProductFn = createServerFn({ method: "POST" })
  .inputValidator(ProductSchema)
  .handler(async ({ data: input }) => {
    const sql = getSql();

    await sql`
      UPDATE products 
      SET name = ${input.name}, price = ${input.price}, old_price = ${input.oldPrice || null}, img = ${input.img}, tag = ${input.tag || null}, category = ${input.category}, description = ${input.description}, stock_status = ${input.stockStatus}, colors = ${input.colors}, details = ${input.details}, weight = ${input.weight ?? 500}
      WHERE id = ${input.id}
    `;

    return { success: true };
  });

export const deleteProductFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data: input }) => {
    const sql = getSql();
    await sql`DELETE FROM products WHERE id = ${input.id}`;
    return { success: true };
  });

// 3. Categories CRUD
export const addCategoryFn = createServerFn({ method: "POST" })
  .inputValidator(CategorySchema)
  .handler(async ({ data: input }) => {
    const sql = getSql();
    await sql`
      INSERT INTO categories (name, img, color)
      VALUES (${input.name}, ${input.img}, ${input.color})
      ON CONFLICT (name) DO NOTHING
    `;
    return { success: true };
  });

export const deleteCategoryFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ name: z.string() }))
  .handler(async ({ data: input }) => {
    const sql = getSql();
    // 1. Delete category
    await sql`DELETE FROM categories WHERE name = ${input.name}`;

    // 2. Fetch remaining categories to get a default fallback
    const remaining = await sql`SELECT name FROM categories LIMIT 1`;
    const defaultCat = remaining[0]?.name || "Cute Stationery";

    // 3. Reassign products belonging to deleted category
    await sql`UPDATE products SET category = ${defaultCat} WHERE category = ${input.name}`;

    return { success: true };
  });

export const updateCategoryFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ oldName: z.string(), updatedCategory: CategorySchema }))
  .handler(async ({ data: input }) => {
    const sql = getSql();

    // 1. Update category
    await sql`
      UPDATE categories SET name = ${input.updatedCategory.name}, img = ${input.updatedCategory.img}, color = ${input.updatedCategory.color}
      WHERE name = ${input.oldName}
    `;

    // 2. Update products mapping
    await sql`UPDATE products SET category = ${input.updatedCategory.name} WHERE category = ${input.oldName}`;

    return { success: true };
  });

// 4. Hero Banner Images CRUD
export const updateHeroImagesFn = createServerFn({ method: "POST" })
  .inputValidator(z.array(z.string()))
  .handler(async ({ data: input }) => {
    const sql = getSql();

    // Truncate existing hero images
    await sql`TRUNCATE TABLE hero_images`;

    // Insert new images
    for (let i = 0; i < input.length; i++) {
      await sql`
        INSERT INTO hero_images (url, display_order)
        VALUES (${input[i]}, ${i})
      `;
    }

    return { success: true };
  });

// 5. Orders CRUD
export const getOrdersFn = createServerFn({ method: "POST" })
  .handler(async () => {
    const sql = getSql();
    const dbOrders = await sql`SELECT * FROM orders ORDER BY created_at DESC`;
    return dbOrders.map(mapDbOrder);
  });

export const createOrderFn = createServerFn({ method: "POST" })
  .inputValidator(OrderSchema)
  .handler(async ({ data: input }) => {
    await initializeDatabase();
    const sql = getSql();

    await sql`
      INSERT INTO orders (id, customer_name, customer_email, customer_phone, items, cart_total, shipping_address, shipping_cost, grand_total, payment_method, screenshot, status, created_at, delivery_estimate)
      VALUES (
        ${input.id},
        ${input.customerName},
        ${input.customerEmail},
        ${input.customerPhone},
        ${JSON.stringify(input.items)},
        ${input.cartTotal},
        ${JSON.stringify(input.shippingAddress)},
        ${input.shippingCost},
        ${input.grandTotal},
        ${input.paymentMethod},
        ${input.screenshot || null},
        ${input.status},
        ${input.createdAt},
        ${input.deliveryEstimate || null}
      )
    `;

    return { success: true };
  });

export const updateOrderStatusFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string(), status: z.string() }))
  .handler(async ({ data: input }) => {
    const sql = getSql();
    await sql`UPDATE orders SET status = ${input.status} WHERE id = ${input.id}`;
    return { success: true };
  });

export const getUserOrdersFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ phone: z.string() }))
  .handler(async ({ data: input }) => {
    const sql = getSql();
    const cleanPhone = input.phone.replace(/\D/g, "");
    
    // Search orders matching cleaner phone string
    const dbOrders = await sql`
      SELECT * FROM orders WHERE REPLACE(customer_phone, ' ', '') LIKE ${`%${cleanPhone}%`} ORDER BY created_at DESC
    `;

    return dbOrders.map(mapDbOrder);
  });
