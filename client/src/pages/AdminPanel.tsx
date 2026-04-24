import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Plus, Edit2, Trash2, X } from "lucide-react";

const PRODUCTS = ["Keepit - 365", "Keepit - GWS", "Keepit - Jira", "Keepit - Zendesk", "Keepit - Salesforce"];
const TYPES = ["Ativação", "Renovação"];

export default function AdminPanel() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("vendas");

  // Queries
  const { data: executives, refetch: refetchExecutives } = trpc.executives.getAll.useQuery();
  const createExecutiveMutation = trpc.executives.create.useMutation();
  const updateExecutiveMutation = trpc.executives.update.useMutation();
  const createSaleMutation = trpc.sales.create.useMutation();
  const { refetch: refetchStats } = trpc.sales.getStats.useQuery();
  const { refetch: refetchExecutiveStats } = trpc.sales.getByExecutive.useQuery();

  // Form states
  const [saleForm, setSaleForm] = useState({
    empresa: "",
    executivo: "",
    data: new Date().toISOString().split("T")[0],
    produto: "",
    tipo: "",
    qtd: "",
    valor: "",
  });

  const [executiveForm, setExecutiveForm] = useState({
    nome: "",
    email: "",
  });

  const [editingExecutive, setEditingExecutive] = useState<string | null>(null);

  // Check if user is admin
  if (user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <p className="text-red-600 font-medium">Acesso negado. Apenas administradores podem acessar esta página.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handlers
  const handleSaleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSaleForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaleSelectChange = (name: string, value: string) => {
    setSaleForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleExecutiveInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setExecutiveForm((prev) => ({ ...prev, [name]: value }));
  };

  const calculateMonthlyAndTotal = (valor: string) => {
    const v = parseFloat(valor) || 0;
    const mensal = v / 12;
    return { mensal, total: v };
  };

  const handleSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!saleForm.empresa || !saleForm.executivo || !saleForm.produto || !saleForm.tipo || !saleForm.qtd || !saleForm.valor) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setIsSubmitting(true);

    try {
      const { mensal, total } = calculateMonthlyAndTotal(saleForm.valor);
      const month = saleForm.data.substring(0, 7);

      await createSaleMutation.mutateAsync({
        empresa: saleForm.empresa,
        executivo: saleForm.executivo,
        data: new Date(saleForm.data),
        produto: saleForm.produto,
        tipo: saleForm.tipo as "Ativação" | "Renovação",
        qtd: parseInt(saleForm.qtd),
        valor: saleForm.valor,
        mensal: mensal.toFixed(2),
        total: total.toFixed(2),
        month,
      });

      toast.success("Venda registrada com sucesso!");

      setSaleForm({
        empresa: "",
        executivo: "",
        data: new Date().toISOString().split("T")[0],
        produto: "",
        tipo: "",
        qtd: "",
        valor: "",
      });

      refetchStats();
      refetchExecutiveStats();
    } catch (error) {
      toast.error("Erro ao registrar venda. Tente novamente.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExecutiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!executiveForm.nome) {
      toast.error("Nome do vendedor é obrigatório");
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingExecutive) {
        await updateExecutiveMutation.mutateAsync({
          nome: editingExecutive,
          email: executiveForm.email || undefined,
        });
        toast.success("Vendedor atualizado com sucesso!");
        setEditingExecutive(null);
      } else {
        await createExecutiveMutation.mutateAsync({
          nome: executiveForm.nome,
          email: executiveForm.email || undefined,
          ativo: "sim",
        });
        toast.success("Vendedor cadastrado com sucesso!");
      }

      setExecutiveForm({ nome: "", email: "" });
      refetchExecutives();
    } catch (error: any) {
      if (error.message?.includes("duplicate")) {
        toast.error("Este vendedor já existe");
      } else {
        toast.error("Erro ao salvar vendedor. Tente novamente.");
      }
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditExecutive = (exec: any) => {
    setEditingExecutive(exec.nome);
    setExecutiveForm({ nome: exec.nome, email: exec.email || "" });
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-gray-900">Painel Administrativo</h1>
        <p className="text-gray-600">Gerencie vendas e vendedores</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="vendas">Registrar Venda</TabsTrigger>
          <TabsTrigger value="editar">Editar Vendas</TabsTrigger>
          <TabsTrigger value="vendedores">Vendedores</TabsTrigger>
        </TabsList>

        {/* Tab: Registrar Venda */}
        <TabsContent value="vendas" className="space-y-4">
          <Card className="border-0 shadow-sm max-w-2xl">
            <CardHeader>
              <CardTitle>Registrar Nova Venda</CardTitle>
              <CardDescription>Preencha os dados da venda para atualizar o sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaleSubmit} className="space-y-6">
                {/* Row 1: Empresa e Executivo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">Empresa *</label>
                    <Input
                      type="text"
                      name="empresa"
                      placeholder="Nome da empresa"
                      value={saleForm.empresa}
                      onChange={handleSaleInputChange}
                      className="border-gray-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">Executivo *</label>
                    <Select value={saleForm.executivo} onValueChange={(value) => handleSaleSelectChange("executivo", value)}>
                      <SelectTrigger className="border-gray-300">
                        <SelectValue placeholder="Selecione o executivo" />
                      </SelectTrigger>
                      <SelectContent>
                        {executives?.map((exec: any) => (
                          <SelectItem key={exec.nome} value={exec.nome}>
                            {exec.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Row 2: Data e Produto */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">Data *</label>
                    <Input
                      type="date"
                      name="data"
                      value={saleForm.data}
                      onChange={handleSaleInputChange}
                      className="border-gray-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">Produto *</label>
                    <Select value={saleForm.produto} onValueChange={(value) => handleSaleSelectChange("produto", value)}>
                      <SelectTrigger className="border-gray-300">
                        <SelectValue placeholder="Selecione o produto" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRODUCTS.map((product) => (
                          <SelectItem key={product} value={product}>
                            {product}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Row 3: Tipo e Quantidade */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">Tipo *</label>
                    <Select value={saleForm.tipo} onValueChange={(value) => handleSaleSelectChange("tipo", value)}>
                      <SelectTrigger className="border-gray-300">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">Quantidade *</label>
                    <Input
                      type="number"
                      name="qtd"
                      placeholder="0"
                      value={saleForm.qtd}
                      onChange={handleSaleInputChange}
                      className="border-gray-300"
                    />
                  </div>
                </div>

                {/* Row 4: Valor */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">Valor Total (ARR) em USD *</label>
                  <Input
                    type="number"
                    name="valor"
                    placeholder="0.00"
                    step="0.01"
                    value={saleForm.valor}
                    onChange={handleSaleInputChange}
                    className="border-gray-300"
                  />
                  {saleForm.valor && (
                    <p className="text-xs text-gray-600 mt-2">
                      Mensal: ${(parseFloat(saleForm.valor) / 12).toFixed(2)} | Total: ${parseFloat(saleForm.valor).toFixed(2)}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    "Registrar Venda"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-blue-50">
            <CardContent className="pt-6">
              <p className="text-sm text-blue-900">
                <strong>Nota:</strong> Após registrar uma venda, o dashboard será atualizado automaticamente com os novos dados.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Gerenciar Vendedores */}
        <TabsContent value="vendedores" className="space-y-4">
          <Card className="border-0 shadow-sm max-w-2xl">
            <CardHeader>
              <CardTitle>{editingExecutive ? "Editar Vendedor" : "Cadastrar Novo Vendedor"}</CardTitle>
              <CardDescription>
                {editingExecutive ? "Atualize as informações do vendedor" : "Adicione um novo vendedor à equipe"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleExecutiveSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">Nome do Vendedor *</label>
                  <Input
                    type="text"
                    name="nome"
                    placeholder="Ex: João Silva"
                    value={executiveForm.nome}
                    onChange={handleExecutiveInputChange}
                    disabled={editingExecutive !== null}
                    className="border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">Email</label>
                  <Input
                    type="email"
                    name="email"
                    placeholder="Ex: joao@empresa.com"
                    value={executiveForm.email}
                    onChange={handleExecutiveInputChange}
                    className="border-gray-300"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : editingExecutive ? (
                      <>
                        <Edit2 className="mr-2 h-4 w-4" />
                        Atualizar
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Cadastrar
                      </>
                    )}
                  </Button>
                  {editingExecutive && (
                    <Button
                      type="button"
                      onClick={() => {
                        setEditingExecutive(null);
                        setExecutiveForm({ nome: "", email: "" });
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Lista de Vendedores */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Vendedores Cadastrados</CardTitle>
              <CardDescription>Total: {executives?.length || 0} vendedores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {executives && executives.length > 0 ? (
                  executives.map((exec: any) => (
                    <div
                      key={exec.nome}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{exec.nome}</p>
                        {exec.email && <p className="text-sm text-gray-600">{exec.email}</p>}
                      </div>
                      <Button
                        onClick={() => handleEditExecutive(exec)}
                        variant="outline"
                        size="sm"
                        className="ml-2"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 text-center py-4">Nenhum vendedor cadastrado</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Editar Vendas */}
        <TabsContent value="editar" className="space-y-4">
          <div className="text-sm text-gray-600 mb-4">
            <p>Clique em "Editar" para modificar uma venda ou "Deletar" para remover.</p>
          </div>
          <SalesManagementContent />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Componente separado para gerenciamento de vendas
function SalesManagementContent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: sales, refetch: refetchSales } = trpc.sales.getAll.useQuery();
  const { data: executives } = trpc.executives.getAll.useQuery();
  const updateSaleMutation = trpc.sales.update.useMutation();
  const deleteSaleMutation = trpc.sales.delete.useMutation();
  const { refetch: refetchStats } = trpc.sales.getStats.useQuery();
  const { refetch: refetchExecutiveStats } = trpc.sales.getByExecutive.useQuery();

  const [editForm, setEditForm] = useState({
    empresa: "",
    executivo: "",
    data: "",
    produto: "",
    tipo: "",
    qtd: "",
    valor: "",
  });

  const handleEditClick = (sale: any) => {
    setEditingId(sale.id);
    setEditForm({
      empresa: sale.empresa,
      executivo: sale.executivo,
      data: new Date(sale.data).toISOString().split("T")[0],
      produto: sale.produto,
      tipo: sale.tipo,
      qtd: sale.qtd.toString(),
      valor: sale.total,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({
      empresa: "",
      executivo: "",
      data: "",
      produto: "",
      tipo: "",
      qtd: "",
      valor: "",
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const calculateMonthlyAndTotal = (valor: string) => {
    const v = parseFloat(valor) || 0;
    const mensal = v / 12;
    return { mensal, total: v };
  };

  const handleSaveEdit = async (saleId: number) => {
    if (!editForm.empresa || !editForm.executivo || !editForm.produto || !editForm.tipo || !editForm.qtd || !editForm.valor) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setIsSubmitting(true);

    try {
      const { mensal, total } = calculateMonthlyAndTotal(editForm.valor);
      const month = editForm.data.substring(0, 7);

      await updateSaleMutation.mutateAsync({
        id: saleId,
        empresa: editForm.empresa,
        executivo: editForm.executivo,
        data: new Date(editForm.data),
        produto: editForm.produto,
        tipo: editForm.tipo as "Ativação" | "Renovação",
        qtd: parseInt(editForm.qtd),
        valor: editForm.valor,
        mensal: mensal.toFixed(2),
        total: total.toFixed(2),
        month,
      });

      toast.success("Venda atualizada com sucesso!");
      setEditingId(null);
      refetchSales();
      refetchStats();
      refetchExecutiveStats();
    } catch (error) {
      toast.error("Erro ao atualizar venda. Tente novamente.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (saleId: number) => {
    if (!confirm("Tem certeza que deseja deletar esta venda?")) {
      return;
    }

    setIsSubmitting(true);

    try {
      await deleteSaleMutation.mutateAsync({ id: saleId });
      toast.success("Venda deletada com sucesso!");
      refetchSales();
      refetchStats();
      refetchExecutiveStats();
    } catch (error) {
      toast.error("Erro ao deletar venda. Tente novamente.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {sales && sales.length > 0 ? (
        sales.map((sale: any) => (
          <Card key={sale.id} className="border-0 shadow-sm">
            {editingId === sale.id ? (
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-900">Empresa</label>
                      <Input
                        type="text"
                        name="empresa"
                        value={editForm.empresa}
                        onChange={handleInputChange}
                        className="border-gray-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-900">Executivo</label>
                      <Select value={editForm.executivo} onValueChange={(value) => handleSelectChange("executivo", value)}>
                        <SelectTrigger className="border-gray-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {executives?.map((exec: any) => (
                            <SelectItem key={exec.nome} value={exec.nome}>
                              {exec.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-900">Data</label>
                      <Input
                        type="date"
                        name="data"
                        value={editForm.data}
                        onChange={handleInputChange}
                        className="border-gray-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-900">Produto</label>
                      <Select value={editForm.produto} onValueChange={(value) => handleSelectChange("produto", value)}>
                        <SelectTrigger className="border-gray-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PRODUCTS.map((product) => (
                            <SelectItem key={product} value={product}>
                              {product}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-900">Tipo</label>
                      <Select value={editForm.tipo} onValueChange={(value) => handleSelectChange("tipo", value)}>
                        <SelectTrigger className="border-gray-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-900">Quantidade</label>
                      <Input
                        type="number"
                        name="qtd"
                        value={editForm.qtd}
                        onChange={handleInputChange}
                        className="border-gray-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">Valor Total (ARR) em USD</label>
                    <Input
                      type="number"
                      name="valor"
                      placeholder="0.00"
                      step="0.01"
                      value={editForm.valor}
                      onChange={handleInputChange}
                      className="border-gray-300"
                    />
                    {editForm.valor && (
                      <p className="text-xs text-gray-600 mt-2">
                        Mensal: ${(parseFloat(editForm.valor) / 12).toFixed(2)} | Total: ${parseFloat(editForm.valor).toFixed(2)}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => handleSaveEdit(sale.id)}
                      disabled={isSubmitting}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        "Salvar Alterações"
                      )}
                    </Button>
                    <Button onClick={handleCancelEdit} variant="outline" className="flex-1">
                      <X className="mr-2 h-4 w-4" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              </CardContent>
            ) : (
              <>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{sale.empresa}</CardTitle>
                      <CardDescription>{sale.executivo} • {sale.produto}</CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">${parseFloat(sale.total).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      <p className="text-sm text-gray-600">{sale.qtd} licenças</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Data</p>
                      <p className="font-medium">{new Date(sale.data).toLocaleDateString("pt-BR")}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Tipo</p>
                      <p className="font-medium">{sale.tipo}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Mensal</p>
                      <p className="font-medium">${parseFloat(sale.mensal).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Período</p>
                      <p className="font-medium">{sale.month}</p>
                    </div>
                  </div>
                </CardContent>
                <div className="flex gap-2 px-6 pb-4">
                  <Button onClick={() => handleEditClick(sale)} variant="outline" className="flex-1">
                    <Edit2 className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                  <Button
                    onClick={() => handleDelete(sale.id)}
                    variant="destructive"
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Deletar
                  </Button>
                </div>
              </>
            )}
          </Card>
        ))
      ) : (
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <p className="text-gray-600 text-center py-8">Nenhuma venda registrada</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
