'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Printer as PrinterIcon, ArrowLeft, Download } from 'lucide-react';
import type { Printer as PrinterType } from '../../lib/printerApi';

type QuoteItem = PrinterType & {
  quoteQty: number;
  quotePrice: number;
};

export default function CotacaoPage() {
  const router = useRouter();
  const [items, setItems] = useState<QuoteItem[]>([]);
  
  // Informações da cotação
  const [dataCotacao, setDataCotacao] = useState('');
  const [condicoesPagamento, setCondicoesPagamento] = useState('');
  const [prazoGarantia, setPrazoGarantia] = useState('');
  const [prazoEntrega, setPrazoEntrega] = useState('');
  const [tipoFrete, setTipoFrete] = useState('');
  const [cotacaoAberta, setCotacaoAberta] = useState('');
  const [cotacaoFecha, setCotacaoFecha] = useState('');

  useEffect(() => {
    // Set current date
    const today = new Date();
    const formattedDate = today.toLocaleDateString('pt-BR');
    setDataCotacao(formattedDate);
    
    setCotacaoAberta(`${formattedDate} 08:30 horas`);
    setCotacaoFecha(`${formattedDate} 16:00 horas`);

    const stored = localStorage.getItem('cotacao_items');
    if (stored) {
      try {
        const parsed: PrinterType[] = JSON.parse(stored);
        setItems(parsed.map(p => ({
          ...p,
          quoteQty: 1, // Default 1
          quotePrice: p.preco_unitario || 0
        })));
      } catch {
        console.error("Erro ao ler items do localStorage");
      }
    }
  }, []);

  const handleQtyChange = (id: string, qty: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, quoteQty: Number(qty) || 0 } : item
    ));
  };

  const handlePriceChange = (id: string, price: string) => {
    // Allows typing decimals like "10.50"
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, quotePrice: Number(price) || 0 } : item
    ));
  };

  const handlePrint = () => {
    window.print();
  };

  const totalGeral = items.reduce((acc, item) => acc + (item.quoteQty * item.quotePrice), 0);

  // Formatter para moeda Brasileira
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white font-sans text-slate-900">
      {/* Botões de Ação - Escondidos na impressão */}
      <div className="max-w-[210mm] mx-auto pt-8 pb-4 px-8 flex items-center justify-between print:hidden">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl shadow-sm font-medium transition-all"
        >
          <PrinterIcon className="w-4 h-4" />
          Imprimir Cotação
        </button>
      </div>

      {/* Folha A4 */}
      <div className="max-w-[210mm] min-h-[297mm] mx-auto bg-white print:shadow-none shadow-xl mb-12 print:m-0 print:mb-0">
        <div className="p-10">
          
          {/* Cabeçalho da Cotação */}
          <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-600 text-white flex items-center justify-center font-bold text-2xl font-serif">
                EZ
              </div>
              <div>
                <h1 className="text-2xl font-bold text-blue-800 tracking-tight">estrutural</h1>
                <h2 className="text-xl font-black text-rose-600 -mt-1 tracking-wider uppercase">zortea</h2>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold border border-black px-4 py-1 mb-2 inline-block">COTAÇÃO PREÇOS - STI-26-004</h2>
              <div className="flex items-center justify-end gap-2 text-sm font-medium">
                <span className="bg-black text-white px-3 py-1">Data:</span>
                <input 
                  type="text" 
                  value={dataCotacao} 
                  onChange={(e) => setDataCotacao(e.target.value)}
                  className="w-24 text-right border-none outline-none font-bold p-0"
                />
              </div>
            </div>
          </div>

          {/* Info Empresa */}
          <div className="flex justify-between text-sm mb-6 leading-relaxed font-medium">
            <div>
              <p>Estrutural Zortea Indústria e Comércio Ltda</p>
              <p>Br 282 | Km 343 | Trevo Oeste</p>
              <p>Campos Novos - Santa Catarina | 89620-000</p>
            </div>
            <div className="text-right">
              <p>CNPJ: 00.368.885/0001-86</p>
              <p>I.E.: 253.022.576</p>
              <p>Telefone: +55 49-3541-3650</p>
            </div>
          </div>

          {/* Tabela de Itens */}
          <table className="w-full text-sm border-collapse mb-2">
            <thead>
              <tr className="bg-black text-white text-left">
                <th className="p-2 border border-black font-bold">Descrição</th>
                <th className="p-2 border border-black font-bold w-20 text-center">Qtde/Un</th>
                <th className="p-2 border border-black font-bold w-32 text-center">Valor Uni</th>
                <th className="p-2 border border-black font-bold w-32 text-center">Valor Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const total = item.quoteQty * item.quotePrice;
                return (
                  <tr key={item.id} className={index % 2 === 0 ? 'bg-slate-50 print:bg-white' : 'bg-white'}>
                    <td className="p-2 border border-black text-xs font-semibold">{item.nome}</td>
                    <td className="p-1 border border-black text-center align-middle relative">
                      {/* Decorative green triangle like in the image */}
                      <div className="absolute top-0 left-0 w-2 h-2 bg-green-600" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
                      <input 
                        type="number" 
                        value={item.quoteQty || ''} 
                        onChange={(e) => handleQtyChange(item.id, e.target.value)}
                        className="w-full text-center bg-transparent border-none outline-none focus:bg-yellow-50 p-1 font-bold"
                        min="0"
                      />
                    </td>
                    <td className="p-1 border border-black text-right align-middle">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-slate-500 mr-1">R$</span>
                        <input 
                          type="number" 
                          step="0.01"
                          value={item.quotePrice || ''} 
                          onChange={(e) => handlePriceChange(item.id, e.target.value)}
                          className="w-full text-right bg-transparent border-none outline-none focus:bg-yellow-50 p-1 font-mono"
                        />
                      </div>
                    </td>
                    <td className="p-2 border border-black text-right font-mono font-medium">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 mr-1">R$</span>
                        {total > 0 ? total.toFixed(2).replace('.', ',') : '-'}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {/* Linhas vazias para preencher o layout se tiver poucos itens */}
              {items.length < 5 && Array.from({ length: 5 - items.length }).map((_, i) => (
                 <tr key={`empty-${i}`}>
                   <td className="p-2 border border-black h-8"></td>
                   <td className="p-2 border border-black"></td>
                   <td className="p-2 border border-black">
                    <div className="flex items-center justify-between px-1">
                        <span className="text-slate-500">R$</span><span>-</span>
                      </div>
                   </td>
                   <td className="p-2 border border-black">
                     <div className="flex items-center justify-between">
                        <span className="text-slate-500">R$</span><span>-</span>
                      </div>
                   </td>
                 </tr>
              ))}
              {/* TOTAL ROW */}
              <tr>
                <td colSpan={3} className="p-2 border border-black text-right font-bold bg-white">TOTAL</td>
                <td className="p-2 border border-black text-right font-bold font-mono">
                  <div className="flex items-center justify-between">
                    <span className="mr-1">R$</span>
                    {totalGeral > 0 ? totalGeral.toFixed(2).replace('.', ',') : '-'}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Rodapé - Condições */}
          <div className="flex justify-end mt-4">
            <div className="w-[300px] text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold">Condições Pagamento:</span>
                <input type="text" value={condicoesPagamento} onChange={e => setCondicoesPagamento(e.target.value)} className="w-32 border-b border-black outline-none bg-transparent" />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold">Prazo Garantia:</span>
                <input type="text" value={prazoGarantia} onChange={e => setPrazoGarantia(e.target.value)} className="w-32 border-b border-black outline-none bg-transparent" />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold">Prazo Entrega:</span>
                <input type="text" value={prazoEntrega} onChange={e => setPrazoEntrega(e.target.value)} className="w-32 border-b border-black outline-none bg-transparent" />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold">Tipo Frete:</span>
                <input type="text" value={tipoFrete} onChange={e => setTipoFrete(e.target.value)} className="w-32 border-b border-black outline-none bg-transparent" />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold">Cotação aberta:</span>
                <input type="text" value={cotacaoAberta} onChange={e => setCotacaoAberta(e.target.value)} className="w-32 border-b border-black outline-none bg-transparent" />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold">Cotação fecha:</span>
                <input type="text" value={cotacaoFecha} onChange={e => setCotacaoFecha(e.target.value)} className="w-32 border-b border-black outline-none bg-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Estilos Globais de Impressão */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body {
            background-color: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          @page {
            size: A4;
            margin: 0;
          }
          /* Remove header/footer padrão do navegador se possível */
        }
      `}} />
    </div>
  );
}
