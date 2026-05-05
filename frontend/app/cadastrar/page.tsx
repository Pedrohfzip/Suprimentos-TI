'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Printer,
  ArrowLeft,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { createPrinter } from '../../lib/printerApi';

const nivelOptions = [
  { value: 'normal', label: 'Normal' },
  { value: 'baixo', label: 'Baixo' },
  { value: 'critico', label: 'Crítico' },
];

const emptyForm = {
  nome: '',
  marca: '',
  codigo_ref: '',
  quantidade_estoque: 0,
  nivel_estoque: 'normal',
};

type FormState = typeof emptyForm;
type FieldError = Partial<Record<keyof FormState, string>>;

function validate(form: FormState): FieldError {
  const errors: FieldError = {};
  if (!form.nome.trim()) errors.nome = 'Nome é obrigatório.';
  if (!form.marca.trim()) errors.marca = 'Marca é obrigatória.';
  if (!form.codigo_ref.trim()) errors.codigo_ref = 'Código de referência é obrigatório.';
  if (form.quantidade_estoque < 0) errors.quantidade_estoque = 'Quantidade não pode ser negativa.';
  return errors;
}

export default function CadastrarImpressoraPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<FieldError>({});
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  function handleChange(key: keyof FormState, value: string | number) {
    setForm((f) => ({ ...f, [key]: value }));
    // Limpa o erro do campo ao editar
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fieldErrors = validate(form);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }
    try {
      setStatus('saving');
      await createPrinter(form);
      setStatus('success');
      // Volta para a listagem após 1.5s
      setTimeout(() => router.push('/'), 1500);
    } catch {
      setStatus('error');
    }
  }

  const isLoading = status === 'saving';
  const isSuccess = status === 'success';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans relative">
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Voltar para listagem
          </button>

          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Printer className="w-8 h-8 text-indigo-500" />
            Cadastrar Impressora
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400 text-sm">
            Preencha os dados abaixo para adicionar uma nova impressora ao sistema.
          </p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
        >
          <div className="p-6 sm:p-8 flex flex-col gap-6">

            {/* Nome */}
            <div>
              <label htmlFor="field-nome" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Nome da Impressora <span className="text-rose-500">*</span>
              </label>
              <input
                id="field-nome"
                type="text"
                placeholder="Ex: HP LaserJet Pro M404n"
                value={form.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-colors dark:text-slate-200 placeholder:text-slate-400 ${
                  errors.nome
                    ? 'border-rose-400 focus:ring-rose-500/30 focus:border-rose-500'
                    : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500/40 focus:border-indigo-500'
                }`}
              />
              {errors.nome && (
                <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.nome}
                </p>
              )}
            </div>

            {/* Marca */}
            <div>
              <label htmlFor="field-marca" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Marca <span className="text-rose-500">*</span>
              </label>
              <input
                id="field-marca"
                type="text"
                placeholder="Ex: HP, Epson, Brother, Canon..."
                value={form.marca}
                onChange={(e) => handleChange('marca', e.target.value)}
                className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-colors dark:text-slate-200 placeholder:text-slate-400 ${
                  errors.marca
                    ? 'border-rose-400 focus:ring-rose-500/30 focus:border-rose-500'
                    : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500/40 focus:border-indigo-500'
                }`}
              />
              {errors.marca && (
                <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.marca}
                </p>
              )}
            </div>

            {/* Código de Referência */}
            <div>
              <label htmlFor="field-codigo" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Código de Referência <span className="text-rose-500">*</span>
              </label>
              <input
                id="field-codigo"
                type="text"
                placeholder="Ex: CF258A"
                value={form.codigo_ref}
                onChange={(e) => handleChange('codigo_ref', e.target.value.toUpperCase())}
                className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 transition-colors dark:text-slate-200 placeholder:text-slate-400 ${
                  errors.codigo_ref
                    ? 'border-rose-400 focus:ring-rose-500/30 focus:border-rose-500'
                    : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500/40 focus:border-indigo-500'
                }`}
              />
              {errors.codigo_ref && (
                <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.codigo_ref}
                </p>
              )}
            </div>

            {/* Quantidade + Nível — side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="field-qtd" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Quantidade em Estoque
                </label>
                <input
                  id="field-qtd"
                  type="number"
                  min={0}
                  value={form.quantidade_estoque}
                  onChange={(e) => handleChange('quantidade_estoque', Number(e.target.value))}
                  className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-colors dark:text-slate-200 ${
                    errors.quantidade_estoque
                      ? 'border-rose-400 focus:ring-rose-500/30 focus:border-rose-500'
                      : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500/40 focus:border-indigo-500'
                  }`}
                />
                {errors.quantidade_estoque && (
                  <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.quantidade_estoque}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="field-nivel" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Nível de Estoque
                </label>
                <select
                  id="field-nivel"
                  value={form.nivel_estoque}
                  onChange={(e) => handleChange('nivel_estoque', e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-colors dark:text-slate-200"
                >
                  {nivelOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Erro geral de API */}
            {status === 'error' && (
              <div className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl text-sm text-rose-700 dark:text-rose-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                Erro ao cadastrar. Verifique se o backend está rodando e tente novamente.
              </div>
            )}

            {/* Sucesso */}
            {isSuccess && (
              <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl text-sm text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                Impressora cadastrada com sucesso! Redirecionando...
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 sm:px-8 py-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              id="btn-salvar-impressora"
              type="submit"
              disabled={isLoading || isSuccess}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl transition-all shadow shadow-indigo-600/20 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
              ) : isSuccess ? (
                <><CheckCircle2 className="w-4 h-4" /> Salvo!</>
              ) : (
                <><Save className="w-4 h-4" /> Salvar Impressora</>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
