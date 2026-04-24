import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Tabela de vendas (Sales)
export const sales = mysqlTable("sales", {
  id: int("id").autoincrement().primaryKey(),
  empresa: varchar("empresa", { length: 255 }).notNull(),
  executivo: varchar("executivo", { length: 255 }).notNull(),
  data: timestamp("data").notNull(),
  produto: varchar("produto", { length: 255 }).notNull(),
  tipo: mysqlEnum("tipo", ["Ativação", "Renovação"]).notNull(),
  qtd: int("qtd").notNull(),
  valor: decimal("valor", { precision: 10, scale: 2 }).notNull(),
  mensal: decimal("mensal", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  month: varchar("month", { length: 7 }).notNull(), // YYYY-MM format
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Sale = typeof sales.$inferSelect;
export type InsertSale = typeof sales.$inferInsert;

// Tabela de clientes (Customers)
export const customers = mysqlTable("customers", {
  id: int("id").autoincrement().primaryKey(),
  empresa: varchar("empresa", { length: 255 }).notNull().unique(),
  totalArr: decimal("totalArr", { precision: 10, scale: 2 }).default("0"),
  totalQty: int("totalQty").default(0),
  lastSaleDate: timestamp("lastSaleDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

// Tabela de configurações do sistema
export const systemConfig = mysqlTable("systemConfig", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 255 }).notNull().unique(),
  value: text("value"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SystemConfig = typeof systemConfig.$inferSelect;
export type InsertSystemConfig = typeof systemConfig.$inferInsert;

// Tabela de vendedores (Executives)
export const executives = mysqlTable("executives", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 320 }),
  ativo: mysqlEnum("ativo", ["sim", "não"]).default("sim").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Executive = typeof executives.$inferSelect;
export type InsertExecutive = typeof executives.$inferInsert;