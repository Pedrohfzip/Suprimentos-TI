'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
} from 'lucide-react';
import {
  getPrinters,
  createPrinter,
  updateStock,
  updateName,
  type Printer as PrinterType,
} from '../lib/printerApi';

// Formulário de criação (sem id)
const emptyForm = { nome: '', marca: '', codigo_ref: '', quantidade_estoque: 0, nivel_estoque: 'normal' };

export default function SuppliesPage() {
  const router = useRouter();
  const [supplies, setSupplies] = useState<PrinterType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // ── Carregar impressoras do backend ──────────────────────────────
  const loadPrinters = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPrinters();
      setSupplies(data);
    } catch {
      setError('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPrinters();
  }, [loadPrinters]);

  // ── Filtros e métricas ────────────────────────────────────────────
  const filtered = supplies.filter(
    (s) =>
      s.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.codigo_ref.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalStock = supplies.reduce((a, b) => a + b.quantidade_estoque, 0);
  const lowStock = supplies.filter((s) => s.quantidade_estoque > 0 && s.quantidade_estoque <= 3).length;
  const outOfStock = supplies.filter((s) => s.quantidade_estoque === 0).length;

  // ── Abrir modal ───────────────────────────────────────────────────
  function openNew() {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEdit(s: PrinterType) {
    setEditingId(s.id);
    setForm({
      nome: s.nome,
      marca: s.marca,
      codigo_ref: s.codigo_ref,
      quantidade_estoque: s.quantidade_estoque,
      nivel_estoque: s.nivel_estoque,
    });
    setShowModal(true);
  }

  // ── Salvar (criar) ────────────────────────────────────────────────
  async function saveForm() {
    if (!form.nome.trim() || !form.codigo_ref.trim()) return;
    try {
      setSaving(true);
      if (editingId) {
        // Editar nome via endpoint dedicado
        const updated = await updateName(editingId, form.nome);
        setSupplies((prev) => prev.map((s) => (s.id === editingId ? updated : s)));
      } else {
        const created = await createPrinter(form);
        setSupplies((prev) => [...prev, created]);
      }
      setShowModal(false);
    } catch {
      alert('Erro ao salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  // ── Ajustar estoque (+/-) ─────────────────────────────────────────
  async function adjustStock(id: string, delta: number) {
    const current = supplies.find((s) => s.id === id);
    if (!current) return;
    const novaQtd = Math.max(0, current.quantidade_estoque + delta);
    // Atualização otimista
    setSupplies((prev) =>
      prev.map((s) => (s.id === id ? { ...s, quantidade_estoque: novaQtd } : s))
    );
    try {
      await updateStock(id, novaQtd);
    } catch {
      // Reverter em caso de erro
      setSupplies((prev) =>
        prev.map((s) => (s.id === id ? { ...s, quantidade_estoque: current.quantidade_estoque } : s))
      );
      alert('Erro ao atualizar estoque.');
    }
  }

  // ── Excluir (apenas local por enquanto) ───────────────────────────
  function confirmDelete() {
    if (!deleteId) return;
    setSupplies((prev) => prev.filter((s) => s.id !== deleteId));
    setDeleteId(null);
  }

  // ── Helpers visuais ───────────────────────────────────────────────
  const stockColor = (n: number) =>
    n === 0
      ? 'text-rose-600 dark:text-rose-400'
      : n <= 3
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-slate-900 dark:text-slate-100';

  const dotColor = (n: number) =>
    n === 0 ? 'bg-rose-500' : n <= 3 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans relative">
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <Printer className="w-8 h-8 text-indigo-500" />
              Suprimentos de Impressoras
            </h1>
            <p className="mt-1 text-slate-500 dark:text-slate-400 text-sm">
              Gerencie o estoque e referências dos suprimentos da empresa.
            </p>
          </div>
          <button
            id="btn-novo-suprimento"
            onClick={() => router.push('/cadastrar')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl font-medium text-sm shadow shadow-indigo-600/30 transition-all group"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
            Nova Impressora
          </button>
        </div>

        {/* ── Metric Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          {[
            { label: 'Total em Estoque', value: `${totalStock} unids`, icon: Package, color: 'indigo' },
            { label: 'Estoque Baixo', value: String(lowStock), icon: AlertCircle, color: 'amber' },
            { label: 'Sem Estoque', value: String(outOfStock), icon: AlertCircle, color: 'rose' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between"
            >
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

        {/* ── Table Card ── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-50/60 dark:bg-slate-900/60 backdrop-blur-sm">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="input-busca"
                type="text"
                placeholder="Buscar por nome ou código..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-colors dark:text-slate-200 placeholder:text-slate-400"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors w-full sm:w-auto justify-center">
              <Filter className="w-4 h-4" />
              Filtros
            </button>
          </div>

          {/* Estados: loading / erro / tabela */}
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-20 text-slate-400 dark:text-slate-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Carregando impressoras...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center px-6">
              <AlertCircle className="w-8 h-8 text-rose-500" />
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm">{error}</p>
              <button
                onClick={loadPrinters}
                className="mt-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
              >
                Tentar novamente
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-6 py-4 font-medium">
                      <span className="flex items-center gap-1.5"><Hash className="w-3.5 h-3.5" /> ID</span>
                    </th>
                    <th className="px-6 py-4 font-medium">Nome da Impressora</th>
                    <th className="px-6 py-4 font-medium">Código Ref.</th>
                    <th className="px-6 py-4 font-medium">Quantidade</th>
                    <th className="px-6 py-4 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group">
                      <td className="px-6 py-4 text-slate-400 dark:text-slate-500 font-mono text-xs">
                        #{String(item.id).padStart(4, '0')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                            <Printer className="w-4 h-4 text-indigo-500" />
                          </div>
                          <span className="font-medium text-slate-900 dark:text-slate-100">{item.nome}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {item.codigo_ref}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor(item.quantidade_estoque)}`} />
                          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl px-1 py-0.5">
                            <button
                              onClick={() => adjustStock(item.id, -1)}
                              disabled={item.quantidade_estoque === 0}
                              title="Diminuir"
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all text-base font-bold leading-none"
                            >
                              −
                            </button>
                            <span className={`min-w-[2.5rem] text-center text-sm font-semibold tabular-nums ${stockColor(item.quantidade_estoque)}`}>
                              {item.quantidade_estoque}
                            </span>
                            <button
                              onClick={() => adjustStock(item.id, 1)}
                              title="Aumentar"
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-all text-base font-bold leading-none"
                            >
                              +
                            </button>
                          </div>
                          <span className="text-xs text-slate-400 dark:text-slate-500">unids</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEdit(item)}
                            title="Editar"
                            className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(item.id)}
                            title="Excluir"
                            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center text-slate-400 dark:text-slate-500">
                        {searchQuery ? `Nenhuma impressora encontrada para "${searchQuery}".` : 'Nenhuma impressora cadastrada.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {editingId ? 'Editar Impressora' : 'Nova Impressora'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              {editingId ? (
                // Edição: só permite alterar o nome
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Nome da Impressora
                  </label>
                  <input
                    id="input-nome"
                    type="text"
                    placeholder="Ex: HP LaserJet Pro M404n"
                    value={form.nome}
                    onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-colors dark:text-slate-200 placeholder:text-slate-400"
                  />
                </div>
              ) : (
                // Criação: todos os campos
                [
                  { label: 'Nome da Impressora', key: 'nome', type: 'text', placeholder: 'Ex: HP LaserJet Pro M404n' },
                  { label: 'Marca', key: 'marca', type: 'text', placeholder: 'Ex: HP' },
                  { label: 'Código de Referência', key: 'codigo_ref', type: 'text', placeholder: 'Ex: CF258A' },
                  { label: 'Quantidade em Estoque', key: 'quantidade_estoque', type: 'number', placeholder: '0' },
                  { label: 'Nível de Estoque', key: 'nivel_estoque', type: 'text', placeholder: 'normal' },
                ].map(({ label, key, type, placeholder }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      {label}
                    </label>
                    <input
                      id={`input-${key}`}
                      type={type}
                      min={type === 'number' ? 0 : undefined}
                      placeholder={placeholder}
                      value={(form as Record<string, string | number>)[key]}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          [key]: type === 'number' ? Number(e.target.value) : e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-colors dark:text-slate-200 placeholder:text-slate-400"
                    />
                  </div>
                ))
              )}
            </div>
            <div className="flex items-center justify-end gap-3 px-6 pb-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                id="btn-salvar"
                onClick={saveForm}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl transition-all shadow shadow-indigo-600/20 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingId ? 'Salvar alterações' : 'Adicionar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm border border-slate-200 dark:border-slate-800 p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-500/10 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Excluir impressora?</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                id="btn-confirmar-exclusao"
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 active:scale-95 rounded-xl transition-all"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
