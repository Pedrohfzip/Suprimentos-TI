'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Printer,
  Search,
  Plus,
  Filter,
  AlertCircle,
  Package,
  Hash,
  Edit2,
  Trash2,
  X,
  Loader2,
  Network,
  ExternalLink,
  MapPin
} from 'lucide-react';
import {
  getPrinters,
  createPrinter,
  updateStock,
  updateName,
  type Printer as PrinterType,
  getActivePrinters,
  createActivePrinter,
  deleteActivePrinter,
  type ActivePrinter
} from '../lib/printerApi';

type Tab = 'stock' | 'active';

const emptyStockForm = { nome: '', marca: '', codigo_ref: '', quantidade_estoque: 0, nivel_estoque: 'normal', preco_unitario: 0, dias_encomenda: 0, quantidade_encomenda: 0 };
const emptyActiveForm = { estacao: '', ip: '', local: '', usuario_rede: '', modelo: '', patrimonio: '', n_serie: '', fabricante: '' };

export default function SuppliesPage() {
  const router = useRouter();
  
  // Tabs
  const [activeTab, setActiveTab] = useState<Tab>('stock');
  
  // Data
  const [supplies, setSupplies] = useState<PrinterType[]>([]);
  const [activePrinters, setActivePrinters] = useState<ActivePrinter[]>([]);
  
  // Loading & Error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals Stock
  const [showStockModal, setShowStockModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [stockForm, setStockForm] = useState(emptyStockForm);
  const [pendingStock, setPendingStock] = useState<{ id: string; newQty: number } | null>(null);
  const [deleteStockId, setDeleteStockId] = useState<string | null>(null);
  
  // Modals Active
  const [showActiveModal, setShowActiveModal] = useState(false);
  const [activeForm, setActiveForm] = useState(emptyActiveForm);
  const [deleteActiveId, setDeleteActiveId] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);

  // ── Data Fetching ──────────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [stockData, activeData] = await Promise.all([
        getPrinters(),
        getActivePrinters()
      ]);
      setSupplies(stockData);
      setActivePrinters(activeData);
    } catch {
      setError('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Computations: Stock ─────────────────────────────────────────
  const filteredStock = supplies.filter(
    (s) =>
      s.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.codigo_ref.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalStock = supplies.reduce((a, b) => a + b.quantidade_estoque, 0);
  const lowStock = supplies.filter((s) => s.quantidade_estoque > 0 && s.quantidade_estoque <= 3).length;
  const outOfStock = supplies.filter((s) => s.quantidade_estoque === 0).length;

  // ── Computations: Active ────────────────────────────────────────
  const filteredActive = activePrinters.filter(
    (p) =>
      (p.modelo || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.ip || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.local || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.estacao || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedActive = useMemo(() => {
    return filteredActive.reduce((acc, printer) => {
      const loc = printer.local || 'Sem Setor';
      if (!acc[loc]) acc[loc] = [];
      acc[loc].push(printer);
      return acc;
    }, {} as Record<string, ActivePrinter[]>);
  }, [filteredActive]);

  // ── Actions: Stock ──────────────────────────────────────────────
  function openNewStock() {
    setEditingId(null);
    setStockForm(emptyStockForm);
    setShowStockModal(true);
  }

  function openEditStock(s: PrinterType) {
    setEditingId(s.id);
    setStockForm({
      nome: s.nome,
      marca: s.marca,
      codigo_ref: s.codigo_ref,
      quantidade_estoque: s.quantidade_estoque,
      nivel_estoque: s.nivel_estoque,
      preco_unitario: s.preco_unitario || 0,
      dias_encomenda: s.dias_encomenda || 0,
      quantidade_encomenda: s.quantidade_encomenda || 0
    });
    setShowStockModal(true);
  }

  async function saveStockForm() {
    if (!stockForm.nome.trim() || !stockForm.codigo_ref.trim()) return;
    try {
      setSaving(true);
      if (editingId) {
        const updated = await updateName(editingId, stockForm.nome);
        setSupplies((prev) => prev.map((s) => (s.id === editingId ? updated : s)));
      } else {
        const created = await createPrinter(stockForm);
        setSupplies((prev) => [...prev, created]);
      }
      setShowStockModal(false);
    } catch {
      alert('Erro ao salvar impressora. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  function requestAdjustStock(id: string, delta: number) {
    const current = supplies.find((s) => s.id === id);
    if (!current) return;
    const initial = Math.max(0, current.quantidade_estoque + delta);
    setPendingStock({ id, newQty: initial });
  }

  async function confirmAdjustStock() {
    if (!pendingStock) return;
    const { id, newQty } = pendingStock;
    const current = supplies.find((s) => s.id === id);
    if (!current) return;
    setPendingStock(null);
    setSupplies((prev) =>
      prev.map((s) => (s.id === id ? { ...s, quantidade_estoque: newQty } : s))
    );
    try {
      await updateStock(id, newQty);
    } catch {
      setSupplies((prev) =>
        prev.map((s) => (s.id === id ? { ...s, quantidade_estoque: current.quantidade_estoque } : s))
      );
      alert('Erro ao atualizar estoque.');
    }
  }

  function confirmDeleteStock() {
    if (!deleteStockId) return;
    setSupplies((prev) => prev.filter((s) => s.id !== deleteStockId));
    setDeleteStockId(null);
  }

  // ── Actions: Active ─────────────────────────────────────────────
  function openNewActive() {
    setActiveForm(emptyActiveForm);
    setShowActiveModal(true);
  }

  async function saveActiveForm() {
    if (!activeForm.modelo.trim() || !activeForm.ip.trim()) {
      alert('Modelo e IP são obrigatórios');
      return;
    }
    try {
      setSaving(true);
      const created = await createActivePrinter(activeForm);
      setActivePrinters((prev) => [...prev, created]);
      setShowActiveModal(false);
    } catch {
      alert('Erro ao cadastrar impressora ativa.');
    } finally {
      setSaving(false);
    }
  }

  async function confirmDeleteActive() {
    if (!deleteActiveId) return;
    try {
      await deleteActivePrinter(deleteActiveId);
      setActivePrinters((prev) => prev.filter((p) => p.id !== deleteActiveId));
    } catch {
      alert('Erro ao excluir impressora ativa.');
    } finally {
      setDeleteActiveId(null);
    }
  }

  // ── Helpers ─────────────────────────────────────────────────────
  const stockColor = (n: number) =>
    n === 0 ? 'text-rose-600 dark:text-rose-400' : n <= 3 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-slate-100';

  const dotColor = (n: number) =>
    n === 0 ? 'bg-rose-500' : n <= 3 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans relative">
      <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <Printer className="w-8 h-8 text-indigo-500" />
              Gestão de Impressoras
            </h1>
            <p className="mt-1 text-slate-500 dark:text-slate-400 text-sm">
              Gerencie o estoque de suprimentos e as impressoras ativas na rede.
            </p>
          </div>
          <button
            onClick={activeTab === 'stock' ? openNewStock : openNewActive}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl font-medium text-sm shadow shadow-indigo-600/30 transition-all group"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
            {activeTab === 'stock' ? 'Novo Suprimento' : 'Nova Impressora Ativa'}
          </button>
        </div>

        {/* ── Tabs ── */}
        <div className="flex space-x-1 bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl mb-8 w-max">
          <button
            onClick={() => setActiveTab('stock')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'stock'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            Estoque de Suprimentos
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'active'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Network className="w-4 h-4" />
            Impressoras na Rede
          </button>
        </div>

        {/* ── Content: Stock ── */}
        {activeTab === 'stock' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
              {[
                { label: 'Total em Estoque', value: `${totalStock} unids`, icon: Package, color: 'indigo' },
                { label: 'Estoque Baixo', value: String(lowStock), icon: AlertCircle, color: 'amber' },
                { label: 'Sem Estoque', value: String(outOfStock), icon: AlertCircle, color: 'rose' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{label}</p>
                    <p className={`text-3xl font-bold mt-1 ${color === 'indigo' ? 'text-slate-900 dark:text-white' : color === 'amber' ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${color === 'indigo' ? 'bg-indigo-50 dark:bg-indigo-500/10' : color === 'amber' ? 'bg-amber-50 dark:bg-amber-500/10' : 'bg-rose-50 dark:bg-rose-500/10'}`}>
                    <Icon className={`w-6 h-6 ${color === 'indigo' ? 'text-indigo-600 dark:text-indigo-400' : color === 'amber' ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`} />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-50/60 dark:bg-slate-900/60">
                <div className="relative w-full sm:w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar suprimento..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center gap-3 py-20 text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin" /><span>Carregando...</span>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                  <AlertCircle className="w-8 h-8 text-rose-500" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">{error}</p>
                  <button onClick={loadData} className="px-4 py-2 mt-2 text-white bg-indigo-600 rounded-xl">Tentar novamente</button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 text-slate-500">
                      <tr>
                        <th className="px-6 py-4 font-medium"><span className="flex items-center gap-1.5"><Hash className="w-3.5 h-3.5" /> ID</span></th>
                        <th className="px-6 py-4 font-medium">Nome do Suprimento</th>
                        <th className="px-6 py-4 font-medium">Preço Un.</th>
                        <th className="px-6 py-4 font-medium">Quantidade</th>
                        <th className="px-6 py-4 font-medium">Valor de Estoque</th>
                        <th className="px-6 py-4 font-medium">Prox. Encomenda</th>
                        <th className="px-6 py-4 font-medium text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredStock.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 group">
                          <td className="px-6 py-4 text-slate-400 font-mono text-xs">#{String(item.id).padStart(4, '0')}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center"><Package className="w-4 h-4 text-indigo-500" /></div>
                              <span className="font-medium text-slate-900 dark:text-slate-100">{item.nome}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                            R$ {Number(item.preco_unitario || 0).toFixed(2).replace('.', ',')}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <span className={`w-2 h-2 rounded-full ${dotColor(item.quantidade_estoque)}`} />
                              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl px-1 py-0.5">
                                <button onClick={() => requestAdjustStock(item.id, -1)} disabled={item.quantidade_estoque === 0} className="w-7 h-7 text-slate-500 hover:bg-white disabled:opacity-30">−</button>
                                <span className={`min-w-[2.5rem] text-center font-semibold tabular-nums ${stockColor(item.quantidade_estoque)}`}>{item.quantidade_estoque}</span>
                                <button onClick={() => requestAdjustStock(item.id, 1)} className="w-7 h-7 text-slate-500 hover:bg-white">+</button>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                            R$ {Number((item.preco_unitario || 0) * item.quantidade_estoque).toFixed(2).replace('.', ',')}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex flex-col gap-1">
                              <span className="text-slate-600 dark:text-slate-300">Em <strong>{item.dias_encomenda || 0}</strong> dias</span>
                              <span className="text-xs text-slate-500 font-mono">Qtd: {item.quantidade_encomenda || 0}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => openEditStock(item)} className="p-2 text-slate-400 hover:text-indigo-600"><Edit2 className="w-4 h-4" /></button>
                              <button onClick={() => setDeleteStockId(item.id)} className="p-2 text-slate-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredStock.length === 0 && (
                        <tr><td colSpan={7} className="px-6 py-16 text-center text-slate-400">Nenhum suprimento encontrado.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Content: Active Printers ── */}
        {activeTab === 'active' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-50/60 dark:bg-slate-900/60">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por IP, Local, Modelo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center gap-3 py-20 text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin" /><span>Carregando impressoras na rede...</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                <AlertCircle className="w-8 h-8 text-rose-500" />
                <p className="text-sm text-slate-600 dark:text-slate-400">{error}</p>
                <button onClick={loadData} className="px-4 py-2 mt-2 text-white bg-indigo-600 rounded-xl">Tentar novamente</button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 text-slate-500">
                    <tr>
                      <th className="px-6 py-4 font-medium">Estação / Usuário</th>
                      <th className="px-6 py-4 font-medium">Modelo / Fab.</th>
                      <th className="px-6 py-4 font-medium">IP</th>
                      <th className="px-6 py-4 font-medium">Patrimônio / Série</th>
                      <th className="px-6 py-4 font-medium text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {Object.entries(groupedActive).map(([local, printers]) => (
                      <React.Fragment key={local}>
                        {/* Header do Setor */}
                        <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                          <td colSpan={5} className="px-6 py-3 font-semibold text-slate-700 dark:text-slate-300 text-xs tracking-wider uppercase flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                            {local}
                          </td>
                        </tr>
                        {/* Linhas das impressoras */}
                        {printers.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 group">
                            <td className="px-6 py-3">
                              <div className="font-medium text-slate-900 dark:text-slate-100">{item.estacao || '-'}</div>
                              <div className="text-xs text-slate-500">{item.usuario_rede || 'N/A'}</div>
                            </td>
                            <td className="px-6 py-3">
                              <div className="font-medium text-slate-900 dark:text-slate-100">{item.modelo || '-'}</div>
                              <div className="text-xs text-slate-500">{item.fabricante || 'N/A'}</div>
                            </td>
                            <td className="px-6 py-3">
                              {item.ip && item.ip.toLowerCase() !== 'local' ? (
                                <a
                                  href={`http://${item.ip}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20 transition-colors"
                                  title={`Acessar painel: ${item.ip}`}
                                >
                                  {item.ip}
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              ) : (
                                <span className="text-xs text-slate-400 font-mono">{item.ip || 'Local'}</span>
                              )}
                            </td>
                            <td className="px-6 py-3">
                              <div className="text-sm text-slate-700 dark:text-slate-300">{item.patrimonio || '-'}</div>
                              <div className="text-xs text-slate-500 font-mono mt-0.5">{item.n_serie || '-'}</div>
                            </td>
                            <td className="px-6 py-3 text-right">
                              <button onClick={() => setDeleteActiveId(item.id)} className="p-2 text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                    {filteredActive.length === 0 && (
                      <tr><td colSpan={5} className="px-6 py-16 text-center text-slate-400">Nenhuma impressora na rede encontrada.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Modals Stock ── */}
      {showStockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{editingId ? 'Editar Suprimento' : 'Novo Suprimento'}</h2>
              <button onClick={() => setShowStockModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { label: 'Nome', key: 'nome', type: 'text' },
                { label: 'Marca', key: 'marca', type: 'text' },
                { label: 'Código de Referência', key: 'codigo_ref', type: 'text' },
                { label: 'Quantidade Inicial', key: 'quantidade_estoque', type: 'number' },
                { label: 'Preço Unitário (R$)', key: 'preco_unitario', type: 'number', step: '0.01' },
                { label: 'Encomenda em (dias)', key: 'dias_encomenda', type: 'number' },
                { label: 'Quantidade a Encomendar', key: 'quantidade_encomenda', type: 'number' },
              ].map(({ label, key, type, step }) => (
                <div key={key} className={key === 'nome' ? 'col-span-2' : ''}>
                  <label className="block text-sm font-medium mb-1.5">{label}</label>
                  <input
                    type={type}
                    step={step}
                    value={(stockForm as any)[key]}
                    onChange={(e) => setStockForm((f) => ({ ...f, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border rounded-xl"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowStockModal(false)} className="px-4 py-2 bg-slate-100 rounded-xl">Cancelar</button>
              <button onClick={saveStockForm} disabled={saving} className="px-4 py-2 bg-indigo-600 text-white rounded-xl flex items-center gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Stock Confirm / Adjust Modals (simplificado) ── */}
      {pendingStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">Atualizar Estoque</h2>
            <input
              type="number" value={pendingStock.newQty}
              onChange={(e) => setPendingStock(p => p ? { ...p, newQty: Number(e.target.value) } : p)}
              className="w-full px-4 py-2 border rounded-xl mb-4"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setPendingStock(null)} className="px-4 py-2 bg-slate-100 rounded-xl">Cancelar</button>
              <button onClick={confirmAdjustStock} className="px-4 py-2 bg-indigo-600 text-white rounded-xl">Confirmar</button>
            </div>
          </div>
        </div>
      )}
      
      {deleteStockId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-sm text-center">
            <Trash2 className="w-8 h-8 text-rose-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-4">Excluir suprimento?</h2>
            <div className="flex justify-center gap-3">
              <button onClick={() => setDeleteStockId(null)} className="px-4 py-2 bg-slate-100 rounded-xl">Cancelar</button>
              <button onClick={confirmDeleteStock} className="px-4 py-2 bg-rose-600 text-white rounded-xl">Excluir</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modals Active ── */}
      {showActiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Network className="w-5 h-5 text-indigo-500" />
                Adicionar Impressora na Rede
              </h2>
              <button onClick={() => setShowActiveModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { label: 'Local (Setor)', key: 'local', type: 'text', placeholder: 'Ex: RH, Engenharia' },
                { label: 'Estação', key: 'estacao', type: 'text', placeholder: 'Ex: EZ-LP 012' },
                { label: 'IP (Obrigatório)', key: 'ip', type: 'text', placeholder: 'Ex: 192.168.0.12' },
                { label: 'Usuário Rede', key: 'usuario_rede', type: 'text', placeholder: 'Ex: Admin / 1111' },
                { label: 'Fabricante', key: 'fabricante', type: 'text', placeholder: 'Ex: Epson' },
                { label: 'Modelo (Obrigatório)', key: 'modelo', type: 'text', placeholder: 'Ex: EcoTank L4160' },
                { label: 'Patrimônio', key: 'patrimonio', type: 'text', placeholder: 'Ex: 3100373' },
                { label: 'Nº Série', key: 'n_serie', type: 'text', placeholder: '' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key} className={key === 'local' || key === 'modelo' ? 'col-span-2' : ''}>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={(activeForm as any)[key]}
                    onChange={(e) => setActiveForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button onClick={() => setShowActiveModal(false)} className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-medium">Cancelar</button>
              <button onClick={saveActiveForm} disabled={saving} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium flex items-center gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Cadastrar Impressora
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteActiveId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-sm text-center">
            <Trash2 className="w-8 h-8 text-rose-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Remover impressora?</h2>
            <p className="text-sm text-slate-500 mb-6">Ela será removida da lista de impressoras ativas.</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setDeleteActiveId(null)} className="px-4 py-2 bg-slate-100 rounded-xl">Cancelar</button>
              <button onClick={confirmDeleteActive} className="px-4 py-2 bg-rose-600 text-white rounded-xl flex items-center gap-2">
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
