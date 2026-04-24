import { execSync } from "child_process";
import { getDb, createSale, upsertCustomer } from "./db";
import { InsertSale, InsertCustomer, sales } from "../drizzle/schema";

async function readExcelData() {
  const pythonScript = `
import pandas as pd
import json

file_path = '/home/ubuntu/upload/Dashboard_Executivo_Keepit__v2.xlsx'
df = pd.read_excel(file_path, sheet_name='Raw Data')

data = []
for _, row in df.iterrows():
    data.append({
        'empresa': str(row['Empresa']),
        'executivo': str(row['Executivo']),
        'data': row['Data'].isoformat(),
        'produto': str(row['Produto']),
        'tipo': str(row['Tipo']),
        'qtd': int(row['Qtd']),
        'valor': float(row['Valor']),
        'mensal': float(row['Mensal']),
        'total': float(row['Total']),
        'month': str(row['Month']),
    })

print(json.dumps(data))
`;

  try {
    const result = execSync(`python3 -c "${pythonScript.replace(/"/g, '\\"')}"`, {
      encoding: "utf-8",
    });
    return JSON.parse(result);
  } catch (error) {
    console.error("[Initialize] Error reading Excel:", error);
    return [];
  }
}

export async function initializeDataIfEmpty() {
  console.log("[Initialize] Checking if data needs to be imported...");

  try {
    const db = await getDb();
    if (!db) {
      console.log("[Initialize] Database not available, skipping data import");
      return;
    }

    // Check if sales table is empty
    const existingSales = await db.select().from(sales).limit(1);

    if (existingSales && existingSales.length > 0) {
      console.log("[Initialize] Data already exists, skipping import");
      return;
    }

    console.log("[Initialize] Starting data import from Excel...");

    const data = await readExcelData();

    if (!data || data.length === 0) {
      console.log("[Initialize] No data found in Excel file");
      return;
    }

    console.log(`[Initialize] Found ${data.length} records to import`);

    const customerMap = new Map<string, { totalArr: number; totalQty: number; lastDate: Date }>();

    // Import sales
    for (const record of data) {
      const saleData: InsertSale = {
        empresa: record.empresa,
        executivo: record.executivo,
        data: new Date(record.data),
        produto: record.produto,
        tipo: record.tipo as "Ativação" | "Renovação",
        qtd: record.qtd,
        valor: record.valor.toString(),
        mensal: record.mensal.toString(),
        total: record.total.toString(),
        month: record.month,
      };

      await createSale(saleData);

      if (!customerMap.has(record.empresa)) {
        customerMap.set(record.empresa, {
          totalArr: 0,
          totalQty: 0,
          lastDate: new Date(record.data),
        });
      }

      const customer = customerMap.get(record.empresa)!;
      customer.totalArr += parseFloat(record.total);
      customer.totalQty += record.qtd;
      if (new Date(record.data) > customer.lastDate) {
        customer.lastDate = new Date(record.data);
      }
    }

    // Import customers
    const entries = Array.from(customerMap.entries());
    for (const [empresa, custData] of entries) {
      const customerData: InsertCustomer = {
        empresa,
        totalArr: custData.totalArr.toFixed(2).toString(),
        totalQty: custData.totalQty,
        lastSaleDate: custData.lastDate,
      };

      await upsertCustomer(customerData);
    }

    console.log(`[Initialize] Successfully imported ${data.length} sales records and ${customerMap.size} customers`);
  } catch (error) {
    console.error("[Initialize] Error during import:", error);
  }
}
