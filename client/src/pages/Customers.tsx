import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function Customers() {
  const { data: customers, isLoading } = trpc.customers.getAll.useQuery();
  const { data: stats } = trpc.customers.getStats.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-gray-900">Clientes Keepit</h1>
        <p className="text-gray-600">Listagem completa de clientes e suas métricas</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats?.totalCustomers || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Empresas cadastradas</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">ARR Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              ${Number(stats?.totalArr || 0).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
            </div>
            <p className="text-xs text-gray-500 mt-1">Receita anual recorrente</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Licenças Totais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats?.totalQty?.toLocaleString() || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Unidades vendidas</p>
          </CardContent>
        </Card>
      </div>

      {/* Customers Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Listagem de Clientes</CardTitle>
          <CardDescription>Clientes ordenados por ARR (maior para menor)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Empresa</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">ARR</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">Licenças</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Última Venda</th>
                </tr>
              </thead>
              <tbody>
                {(customers || []).map((customer: any, idx: number) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-gray-900 font-medium">{customer.empresa}</td>
                    <td className="text-right py-3 px-4 font-semibold text-blue-600">
                      ${Number(customer.totalArr).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                    </td>
                    <td className="text-right py-3 px-4 text-gray-600">{customer.totalQty?.toLocaleString() || 0}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {customer.lastSaleDate
                        ? new Date(customer.lastSaleDate).toLocaleDateString("pt-BR")
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
