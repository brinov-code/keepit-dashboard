import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Plus, Edit2 } from "lucide-react";

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
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="vendas">Registrar Venda</TabsTrigger>
          <TabsTrigger value="vendedores">Gerenciar Vendedores</TabsTrigger>
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
      </Tabs>
    </div>
  );
}
