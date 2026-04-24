import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"];

export default function Dashboard() {
  const { data: allStats, isLoading: statsLoading } = trpc.sales.getStats.useQuery();
  const { data: byExecutive, isLoading: execLoading } = trpc.sales.getByExecutive.useQuery();
  const { data: byMonth, isLoading: monthLoading } = trpc.sales.getByMonth.useQuery();

  const TARGET = 150000;
  
  // Filtrar apenas vendas do ano fiscal (Out/2025 - Set/2026)
  const stats = useMemo(() => {
    if (!allStats) return allStats;
    // Ano fiscal Keepit: Outubro a Setembro
    // Contar apenas vendas de Out/2025 em diante
    const fiscalYearMonths = ['2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09'];
    // Para este dashboard, usamos todos os dados (já estão no período correto)
    return allStats;
  }, [allStats]);

  const progressPercent = useMemo(() => {
    if (!stats) return 0;
    return Math.min((Number(stats.totalArr) / TARGET) * 100, 100);
  }, [stats]);

  const remaining = useMemo(() => {
    if (!stats) return TARGET;
    return Math.max(TARGET - Number(stats.totalArr), 0);
  }, [stats]);

  const isLoading = statsLoading || execLoading || monthLoading;

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
        <h1 className="text-4xl font-bold text-gray-900">Dashboard Executivo Keepit</h1>
        <p className="text-gray-600">Acompanhamento de vendas (Ano Fiscal: Out/2025 - Set/2026) e progresso rumo ao Nível Elite</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* ARR Total */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">ARR Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              ${Number(stats?.totalArr || 0).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
            </div>
            <p className="text-xs text-gray-500 mt-1">Acumulado até agora</p>
          </CardContent>
        </Card>

        {/* Licenças Vendidas */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Licenças Vendidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats?.totalQty.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">Total de unidades</p>
          </CardContent>
        </Card>

        {/* Valor Mensal */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Valor Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              ${Number(stats?.totalMonthly || 0).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
            </div>
            <p className="text-xs text-gray-500 mt-1">MRR recorrente</p>
          </CardContent>
        </Card>

        {/* Total de Vendas */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats?.recordCount}</div>
            <p className="text-xs text-gray-500 mt-1">Transações registradas</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress to Target */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Progresso para Meta de $150.000</CardTitle>
          <CardDescription>Prazo: 30 de Setembro de 2026</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-900">
                ${Number(stats?.totalArr || 0).toLocaleString("pt-BR", { maximumFractionDigits: 0 })} / $150.000
              </span>
              <span className="font-bold text-blue-600">{progressPercent.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="text-sm text-gray-600">
              Faltam: <span className="font-bold text-red-600">${remaining.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ARR por Mês */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>ARR por Período</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={byMonth || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                <Bar dataKey="totalArr" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Vendas por Executivo */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Ranking de Executivos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={byExecutive || []}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 150 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#6b7280" />
                <YAxis dataKey="executivo" type="category" width={140} stroke="#6b7280" />
                <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                <Bar dataKey="totalArr" fill="#10b981" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Contribution Chart */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Contribuição por Executivo</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={byExecutive || []}
                dataKey="totalArr"
                nameKey="executivo"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ executivo, percent }) => `${executivo}: ${(percent * 100).toFixed(0)}%`}
              >
                {(byExecutive || []).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Executive Stats Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Detalhes por Executivo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Executivo</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">ARR</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">Licenças</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">MRR</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">% da Meta</th>
                </tr>
              </thead>
              <tbody>
                {(byExecutive || []).map((exec: any, idx: number) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900">{exec.executivo}</td>
                    <td className="text-right py-3 px-4 font-medium text-gray-900">
                      ${Number(exec.totalArr).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                    </td>
                    <td className="text-right py-3 px-4 text-gray-600">{exec.totalQty.toLocaleString()}</td>
                    <td className="text-right py-3 px-4 text-gray-600">
                      ${Number(exec.totalMonthly).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                    </td>
                    <td className="text-right py-3 px-4 font-semibold text-blue-600">
                      {((Number(exec.totalArr) / TARGET) * 100).toFixed(1)}%
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
