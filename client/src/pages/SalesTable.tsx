import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ChevronUp, ChevronDown } from "lucide-react";

const PRODUCTS = ["Keepit - 365", "Keepit - GWS", "Keepit - Jira", "Keepit - Zendesk", "Keepit - Salesforce"];
const EXECUTIVES = ["Rebeca Alves", "Dominique Marques", "Alysson Pereira"];
const TYPES = ["Ativação", "Renovação"];

type SortField = "empresa" | "executivo" | "data" | "produto" | "tipo" | "qtd" | "total" | "mensal";
type SortOrder = "asc" | "desc";

export default function SalesTable() {
  const { data: sales, isLoading } = trpc.sales.getAll.useQuery();

  const [filters, setFilters] = useState({
    empresa: "",
    executivo: "",
    produto: "",
    tipo: "",
    month: "",
  });

  const [sort, setSort] = useState<{ field: SortField; order: SortOrder }>({
    field: "data",
    order: "desc",
  });

  const filteredAndSorted = useMemo(() => {
    if (!sales) return [];

    let filtered = sales.filter((sale: any) => {
      if (filters.empresa && !sale.empresa.toLowerCase().includes(filters.empresa.toLowerCase())) return false;
      if (filters.executivo && sale.executivo !== filters.executivo) return false;
      if (filters.produto && sale.produto !== filters.produto) return false;
      if (filters.tipo && sale.tipo !== filters.tipo) return false;
      if (filters.month && sale.month !== filters.month) return false;
      return true;
    });

    // Sort
    filtered.sort((a: any, b: any) => {
      let aVal = a[sort.field];
      let bVal = b[sort.field];

      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = (bVal as string).toLowerCase();
      }

      if (aVal < bVal) return sort.order === "asc" ? -1 : 1;
      if (aVal > bVal) return sort.order === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [sales, filters, sort]);

  const handleSort = (field: SortField) => {
    if (sort.field === field) {
      setSort({ field, order: sort.order === "asc" ? "desc" : "asc" });
    } else {
      setSort({ field, order: "asc" });
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sort.field !== field) return null;
    return sort.order === "asc" ? (
      <ChevronUp className="w-4 h-4 inline ml-1" />
    ) : (
      <ChevronDown className="w-4 h-4 inline ml-1" />
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-gray-900">Tabela de Vendas</h1>
        <p className="text-gray-600">Visualize e filtre todas as vendas registradas</p>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Empresa</label>
              <Input
                placeholder="Buscar empresa..."
                value={filters.empresa}
                onChange={(e) => setFilters({ ...filters, empresa: e.target.value })}
                className="border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Executivo</label>
              <Select value={filters.executivo} onValueChange={(value) => setFilters({ ...filters, executivo: value })}>
                <SelectTrigger className="border-gray-300">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {EXECUTIVES.map((exec) => (
                    <SelectItem key={exec} value={exec}>
                      {exec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Produto</label>
              <Select value={filters.produto} onValueChange={(value) => setFilters({ ...filters, produto: value })}>
                <SelectTrigger className="border-gray-300">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {PRODUCTS.map((product) => (
                    <SelectItem key={product} value={product}>
                      {product}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Tipo</label>
              <Select value={filters.tipo} onValueChange={(value) => setFilters({ ...filters, tipo: value })}>
                <SelectTrigger className="border-gray-300">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Mês</label>
              <Select value={filters.month} onValueChange={(value) => setFilters({ ...filters, month: value })}>
                <SelectTrigger className="border-gray-300">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="2025-10">Out 2025</SelectItem>
                  <SelectItem value="2025-11">Nov 2025</SelectItem>
                  <SelectItem value="2025-12">Dez 2025</SelectItem>
                  <SelectItem value="2026-01">Jan 2026</SelectItem>
                  <SelectItem value="2026-02">Fev 2026</SelectItem>
                  <SelectItem value="2026-03">Mar 2026</SelectItem>
                  <SelectItem value="2026-04">Abr 2026</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Resultados</CardTitle>
          <CardDescription>{filteredAndSorted.length} vendas encontradas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th
                    className="text-left py-3 px-4 font-semibold text-gray-900 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("empresa")}
                  >
                    Empresa <SortIcon field="empresa" />
                  </th>
                  <th
                    className="text-left py-3 px-4 font-semibold text-gray-900 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("executivo")}
                  >
                    Executivo <SortIcon field="executivo" />
                  </th>
                  <th
                    className="text-left py-3 px-4 font-semibold text-gray-900 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("data")}
                  >
                    Data <SortIcon field="data" />
                  </th>
                  <th
                    className="text-left py-3 px-4 font-semibold text-gray-900 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("produto")}
                  >
                    Produto <SortIcon field="produto" />
                  </th>
                  <th
                    className="text-left py-3 px-4 font-semibold text-gray-900 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("tipo")}
                  >
                    Tipo <SortIcon field="tipo" />
                  </th>
                  <th
                    className="text-right py-3 px-4 font-semibold text-gray-900 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("qtd")}
                  >
                    Qtd <SortIcon field="qtd" />
                  </th>
                  <th
                    className="text-right py-3 px-4 font-semibold text-gray-900 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("mensal")}
                  >
                    Mensal <SortIcon field="mensal" />
                  </th>
                  <th
                    className="text-right py-3 px-4 font-semibold text-gray-900 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("total")}
                  >
                    Total <SortIcon field="total" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSorted.map((sale: any, idx: number) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-gray-900 font-medium">{sale.empresa}</td>
                    <td className="py-3 px-4 text-gray-600">{sale.executivo}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(sale.data).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{sale.produto}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          sale.tipo === "Ativação"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {sale.tipo}
                      </span>
                    </td>
                    <td className="text-right py-3 px-4 text-gray-900 font-medium">{sale.qtd.toLocaleString()}</td>
                    <td className="text-right py-3 px-4 text-gray-600">
                      ${Number(sale.mensal).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}
                    </td>
                    <td className="text-right py-3 px-4 text-gray-900 font-semibold text-blue-600">
                      ${Number(sale.total).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}
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
