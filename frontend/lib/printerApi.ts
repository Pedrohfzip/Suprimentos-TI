// URL base da API - defina NEXT_PUBLIC_API_URL no seu .env.local
// Exemplo: NEXT_PUBLIC_API_URL=http://localhost:3001
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export type Printer = {
  id: string;
  nome: string;
  marca: string;
  codigo_ref: string;
  quantidade_estoque: number;
  nivel_estoque: string;
};

export type CreatePrinterPayload = Omit<Printer, 'id'>;

// ── Buscar todas as impressoras ──────────────────────────────────────────────
export async function getPrinters(): Promise<Printer[]> {
  const res = await fetch(`${API_URL}/printers`);
  if (!res.ok) throw new Error('Erro ao buscar impressoras');
  return res.json();
}

// ── Cadastrar nova impressora ────────────────────────────────────────────────
export async function createPrinter(data: CreatePrinterPayload): Promise<Printer> {
  const res = await fetch(`${API_URL}/printers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao cadastrar impressora');
  return res.json();
}

// ── Atualizar quantidade de estoque ─────────────────────────────────────────
export async function updateStock(id: string, quantidade_estoque: number): Promise<Printer> {
  const res = await fetch(`${API_URL}/printers/${id}/stock`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantidade_estoque }),
  });
  if (!res.ok) throw new Error('Erro ao atualizar estoque');
  return res.json();
}

// ── Atualizar nome da impressora ─────────────────────────────────────────────
export async function updateName(id: string, nome: string): Promise<Printer> {
  const res = await fetch(`${API_URL}/printers/${id}/name`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome }),
  });
  if (!res.ok) throw new Error('Erro ao atualizar nome');
  return res.json();
}
