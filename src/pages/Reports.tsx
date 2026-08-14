import React, { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { FileDown, BarChart3 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { useAuth } from '@/context/AuthContext';
import { useBills } from '@/context/BillContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Brand from '@/components/navbar/Brand';
import NavLinks from '@/components/navbar/NavLinks';
import UserMenu from '@/components/navbar/UserMenu';
import ThemeToggle from '@/components/ThemeToggle';
import MobileMenuButton from '@/components/navbar/MobileMenuButton';
import MobileMenu from '@/components/navbar/MobileMenu';

type Tipo = 'pagar' | 'receber';
type DateBasis = 'dueDate' | 'datapagamento';
type StatusFilter = 'all' | 'paid' | 'unpaid';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatDateBR = (iso: string) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return d ? `${d}/${m}/${y}` : iso;
};

const monthKey = (iso: string) => iso.slice(0, 7); // YYYY-MM

const monthLabel = (key: string) => {
  const [y, m] = key.split('-');
  const names = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  return `${names[Number(m) - 1]}/${y.slice(2)}`;
};

const Reports: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading, user, logout } = useAuth();
  const { bills, isLoading } = useBills();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [tipo, setTipo] = useState<Tipo>('pagar');
  const [dateBasis, setDateBasis] = useState<DateBasis>('dueDate');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const report = useMemo(() => {
    const filtered = bills.filter((bill) => {
      if (bill.tipo !== tipo) return false;
      if (status !== 'all' && bill.status !== status) return false;

      const ref = dateBasis === 'dueDate' ? bill.dueDate : bill.datapagamento;
      if (!ref) return false;
      const refKey = ref.slice(0, 10);
      if (startDate && refKey < startDate) return false;
      if (endDate && refKey > endDate) return false;
      return true;
    });

    const monthSet = new Set<string>();
    const byCategory = new Map<string, Map<string, number>>();

    filtered.forEach((bill) => {
      const ref = (dateBasis === 'dueDate' ? bill.dueDate : bill.datapagamento) as string;
      const mk = monthKey(ref.slice(0, 10));
      monthSet.add(mk);

      const category = bill.category?.trim() || 'Sem categoria';
      if (!byCategory.has(category)) byCategory.set(category, new Map());
      const row = byCategory.get(category)!;
      row.set(mk, (row.get(mk) || 0) + bill.amount);
    });

    const months = Array.from(monthSet).sort();
    const rows = Array.from(byCategory.entries())
      .map(([category, monthMap]) => {
        const values = months.map((m) => monthMap.get(m) || 0);
        const total = values.reduce((a, b) => a + b, 0);
        return { category, values, total };
      })
      .sort((a, b) => b.total - a.total);

    const monthTotals = months.map((_, i) => rows.reduce((sum, r) => sum + r.values[i], 0));
    const grandTotal = rows.reduce((sum, r) => sum + r.total, 0);

    return { months, rows, monthTotals, grandTotal, count: filtered.length };
  }, [bills, tipo, dateBasis, status, startDate, endDate]);

  const exportToPDF = () => {
    const doc = new jsPDF(report.months.length > 6 ? 'landscape' : 'portrait');
    const title = tipo === 'pagar' ? 'Relatório de Gastos por Categoria' : 'Relatório de Receitas por Categoria';

    doc.setFontSize(16);
    doc.text(title, 14, 18);

    doc.setFontSize(10);
    const basisText = dateBasis === 'dueDate' ? 'Data de vencimento' : 'Data de pagamento';
    const statusText = status === 'all' ? 'Todos' : status === 'paid' ? 'Pagas' : 'Pendentes';
    const periodText =
      startDate || endDate
        ? `${startDate ? formatDateBR(startDate) : '...'} a ${endDate ? formatDateBR(endDate) : '...'}`
        : 'Todo o período';
    doc.text(`Base: ${basisText} | Período: ${periodText} | Status: ${statusText}`, 14, 25);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 31);

    const head = [['Categoria', ...report.months.map(monthLabel), 'Total']];
    const body = report.rows.map((r) => [
      r.category,
      ...r.values.map((v) => formatCurrency(v)),
      formatCurrency(r.total),
    ]);
    body.push([
      'TOTAL GERAL',
      ...report.monthTotals.map((v) => formatCurrency(v)),
      formatCurrency(report.grandTotal),
    ]);

    autoTable(doc, {
      head,
      body,
      startY: 38,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [68, 114, 196], textColor: [255, 255, 255], fontStyle: 'bold' },
      didParseCell: (data) => {
        if (data.section === 'body' && data.row.index === body.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [235, 240, 250];
        }
      },
    });

    doc.save(`relatorio-categorias-${tipo}.pdf`);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-pulse space-y-2 flex flex-col items-center">
          <div className="h-10 w-36 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full bg-white dark:bg-gray-900 py-2 px-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Brand />
            <div className="hidden md:flex ml-6">
              <NavLinks />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="hidden md:block">
              <UserMenu user={user} logout={logout} isAuthenticated={isAuthenticated} />
            </div>
            <MobileMenuButton isOpen={isMenuOpen} toggleMenu={() => setIsMenuOpen(!isMenuOpen)} />
          </div>
        </div>
        <MobileMenu
          isOpen={isMenuOpen}
          closeMenu={() => setIsMenuOpen(false)}
          isAuthenticated={isAuthenticated}
          user={user}
          logout={logout}
        />
      </div>

      <main className="container mx-auto px-4 pt-6 pb-12 animate-fade-in">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <BarChart3 className="h-7 w-7" />
                Relatórios
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Gastos mensais por categoria com totais por mês e total geral
              </p>
            </div>
            <Button variant="outline" onClick={exportToPDF} disabled={report.rows.length === 0}>
              <FileDown className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-1">
              <Label>Tipo</Label>
              <Select value={tipo} onValueChange={(v) => setTipo(v as Tipo)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pagar">Contas a Pagar</SelectItem>
                  <SelectItem value="receber">Contas a Receber</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Filtrar por</Label>
              <Select value={dateBasis} onValueChange={(v) => setDateBasis(v as DateBasis)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="dueDate">Data de vencimento</SelectItem>
                  <SelectItem value="datapagamento">Data de pagamento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as StatusFilter)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="paid">Pagas</SelectItem>
                  <SelectItem value="unpaid">Pendentes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="start">Data inicial</Label>
              <Input id="start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="end">Data final</Label>
              <Input id="end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm overflow-hidden">
            {report.rows.length === 0 ? (
              <div className="p-10 text-center text-gray-500 dark:text-gray-400">
                Nenhum lançamento encontrado para os filtros selecionados.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold sticky left-0 bg-gray-50 dark:bg-gray-800">Categoria</th>
                      {report.months.map((m) => (
                        <th key={m} className="text-right px-4 py-3 font-semibold whitespace-nowrap">
                          {monthLabel(m)}
                        </th>
                      ))}
                      <th className="text-right px-4 py-3 font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.rows.map((r) => (
                      <tr key={r.category} className="border-t border-gray-100 dark:border-gray-800">
                        <td className="px-4 py-2 max-w-[220px] truncate sticky left-0 bg-white dark:bg-gray-900" title={r.category}>
                          {r.category}
                        </td>
                        {r.values.map((v, i) => (
                          <td key={i} className="px-4 py-2 text-right whitespace-nowrap">
                            {v ? formatCurrency(v) : '-'}
                          </td>
                        ))}
                        <td className="px-4 py-2 text-right font-semibold whitespace-nowrap">
                          {formatCurrency(r.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-bold">
                      <td className="px-4 py-3 sticky left-0 bg-gray-50 dark:bg-gray-800">TOTAL GERAL</td>
                      {report.monthTotals.map((v, i) => (
                        <td key={i} className="px-4 py-3 text-right whitespace-nowrap">{formatCurrency(v)}</td>
                      ))}
                      <td className="px-4 py-3 text-right whitespace-nowrap">{formatCurrency(report.grandTotal)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {report.rows.length > 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
              {report.count} lançamento(s) · {report.rows.length} categoria(s) · {report.months.length} mês(es)
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Reports;
