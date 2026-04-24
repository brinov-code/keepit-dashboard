import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getAllSales,
  getSalesStats,
  getSalesByExecutive,
  getSalesByMonth_Stats,
  createSale,
  getAllCustomers,
  getCustomerStats,
  getAllExecutives,
  createExecutive,
  updateExecutive,
} from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Sales routers
  sales: router({
    getAll: publicProcedure.query(() => getAllSales()),
    getStats: publicProcedure.query(() => getSalesStats()),
    getByExecutive: publicProcedure.query(() => getSalesByExecutive()),
    getByMonth: publicProcedure.query(() => getSalesByMonth_Stats()),
    create: protectedProcedure
      .input(
        z.object({
          empresa: z.string(),
          executivo: z.string(),
          data: z.date(),
          produto: z.string(),
          tipo: z.enum(["Ativação", "Renovação"]),
          qtd: z.number().int(),
          valor: z.string(),
          mensal: z.string(),
          total: z.string(),
          month: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Unauthorized");
        }
        return createSale(input);
      }),
  }),

  // Customers routers
  customers: router({
    getAll: publicProcedure.query(() => getAllCustomers()),
    getStats: publicProcedure.query(() => getCustomerStats()),
  }),

  // Executives routers
  executives: router({
    getAll: publicProcedure.query(() => getAllExecutives()),
    create: protectedProcedure
      .input(
        z.object({
          nome: z.string().min(1),
          email: z.string().email().optional(),
          ativo: z.enum(["sim", "não"]).default("sim"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Unauthorized");
        }
        return createExecutive(input);
      }),
    update: protectedProcedure
      .input(
        z.object({
          nome: z.string(),
          email: z.string().email().optional(),
          ativo: z.enum(["sim", "não"]).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Unauthorized");
        }
        const { nome, ...data } = input;
        return updateExecutive(nome, data);
      }),
  }),
});

export type AppRouter = typeof appRouter;
