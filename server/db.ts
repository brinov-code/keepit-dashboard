import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, sales, customers, InsertSale, Sale, Customer, InsertCustomer, executives, InsertExecutive, Executive } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Sales queries
export async function getAllSales() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sales).orderBy(desc(sales.data));
}

export async function getSalesByMonth(month: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sales).where(eq(sales.month, month)).orderBy(desc(sales.data));
}

export async function getSalesStats() {
  const db = await getDb();
  if (!db) return { totalArr: 0, totalQty: 0, totalMonthly: 0, recordCount: 0 };
  
  const result = await db.select({
    totalArr: sql<number>`CAST(SUM(${sales.total}) AS DECIMAL(10,2))`,
    totalQty: sql<number>`SUM(${sales.qtd})`,
    totalMonthly: sql<number>`CAST(SUM(${sales.mensal}) AS DECIMAL(10,2))`,
    recordCount: sql<number>`COUNT(*)`,
  }).from(sales);
  
  return result[0] || { totalArr: 0, totalQty: 0, totalMonthly: 0, recordCount: 0 };
}

export async function getSalesByExecutive() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select({
    executivo: sales.executivo,
    totalArr: sql<number>`CAST(SUM(${sales.total}) AS DECIMAL(10,2))`,
    totalQty: sql<number>`SUM(${sales.qtd})`,
    totalMonthly: sql<number>`CAST(SUM(${sales.mensal}) AS DECIMAL(10,2))`,
    recordCount: sql<number>`COUNT(*)`,
  }).from(sales).groupBy(sales.executivo).orderBy(desc(sql`SUM(${sales.total})`));
}

export async function getSalesByMonth_Stats() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select({
    month: sales.month,
    totalArr: sql<number>`CAST(SUM(${sales.total}) AS DECIMAL(10,2))`,
    totalQty: sql<number>`SUM(${sales.qtd})`,
    totalMonthly: sql<number>`CAST(SUM(${sales.mensal}) AS DECIMAL(10,2))`,
    recordCount: sql<number>`COUNT(*)`,
  }).from(sales).groupBy(sales.month).orderBy(sales.month);
}

export async function createSale(data: InsertSale): Promise<Sale | null> {
  const db = await getDb();
  if (!db) return null;
  
  try {
    await db.insert(sales).values(data);
    const allSales = await db.select().from(sales).orderBy(desc(sales.id)).limit(1);
    return allSales[0] || null;
  } catch (error) {
    console.error("[Database] Failed to create sale:", error);
    return null;
  }
}

export async function updateSale(id: number, data: Partial<InsertSale>): Promise<Sale | null> {
  const db = await getDb();
  if (!db) return null;
  
  try {
    await db.update(sales).set(data).where(eq(sales.id, id));
    const result = await db.select().from(sales).where(eq(sales.id, id)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to update sale:", error);
    return null;
  }
}

export async function deleteSale(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  try {
    await db.delete(sales).where(eq(sales.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete sale:", error);
    return false;
  }
}

export async function getSaleById(id: number): Promise<Sale | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(sales).where(eq(sales.id, id)).limit(1);
  return result[0] || null;
}

// Customers queries
export async function getAllCustomers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(customers).orderBy(desc(customers.totalArr));
}

export async function getCustomerStats() {
  const db = await getDb();
  if (!db) return { totalCustomers: 0, totalArr: 0, totalQty: 0 };
  
  const result = await db.select({
    totalCustomers: sql<number>`COUNT(*)`,
    totalArr: sql<number>`CAST(SUM(${customers.totalArr}) AS DECIMAL(10,2))`,
    totalQty: sql<number>`SUM(${customers.totalQty})`,
  }).from(customers);
  
  return result[0] || { totalCustomers: 0, totalArr: 0, totalQty: 0 };
}

export async function upsertCustomer(data: InsertCustomer): Promise<Customer | null> {
  const db = await getDb();
  if (!db) return null;
  
  try {
    await db.insert(customers).values(data).onDuplicateKeyUpdate({
      set: {
        totalArr: data.totalArr,
        totalQty: data.totalQty,
        lastSaleDate: data.lastSaleDate,
      },
    });
    
    const result = await db.select().from(customers).where(eq(customers.empresa, data.empresa)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to upsert customer:", error);
    return null;
  }
}

// System config queries - placeholder for future use
export async function getSystemConfig(key: string) {
  // TODO: Implement when needed
  return null;
}

export async function setSystemConfig(key: string, value: string) {
  // TODO: Implement when needed
  return false;
}

// Executives queries
export async function getAllExecutives() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(executives).where(eq(executives.ativo, "sim")).orderBy(executives.nome);
}

export async function getExecutiveByName(nome: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(executives).where(eq(executives.nome, nome)).limit(1);
  return result[0] || null;
}

export async function createExecutive(data: InsertExecutive): Promise<Executive | null> {
  const db = await getDb();
  if (!db) return null;
  
  try {
    await db.insert(executives).values(data);
    const result = await db.select().from(executives).where(eq(executives.nome, data.nome)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to create executive:", error);
    return null;
  }
}

export async function updateExecutive(nome: string, data: Partial<InsertExecutive>): Promise<Executive | null> {
  const db = await getDb();
  if (!db) return null;
  
  try {
    await db.update(executives).set(data).where(eq(executives.nome, nome));
    const result = await db.select().from(executives).where(eq(executives.nome, nome)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to update executive:", error);
    return null;
  }
}
