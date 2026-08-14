import React, { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { FileDown, BarChart3, Check } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { useAuth } from '@/context/AuthContext';
import { useBills } from '@/context/BillContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
type FilterMode = 'periodo' | 'meses';
type ViewMode = 'detalhado' | 'resumo';

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

const monthLabelLong = (key: string) => {
  const [y, m] = key.split('-');
  const names = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];
  return `${names[Number(m) - 1]}/${y}`;
};

const Reports: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading, user, logout } = useAuth();
  const { bills, isLoading } = useBills();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [tipo, setTipo] = useState<Tipo>('pagar');
  const [dateBasis, setDateBasis] = useState<DateBasis>('dueDate');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [filterMode, setFilterMode] = useState<FilterMode>('periodo');
  const [viewMode, setViewMode] = useState<ViewMode>('detalhado');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [monthsOpen, setMonthsOpen] = useState(false);

  // Meses disponíveis conforme tipo + base de data
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    bills.forEach((bill) => {
      if (bill.tipo !== tipo) return;
      const ref = dateBasis === 'dueDate' ? bill.dueDate : bill.datapagamento;
      if (!ref) return;
      set.add(monthKey(ref.slice(0, 10)));
    });
    return Array.from(set).sort().reverse();
  }, [bills, tipo, dateBasis]);

  const toggleMonth = (m: string) =>
    setSelectedMonths((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));

  const report = useMemo(() => {
    const filtered = bills.filter((bill) => {
      if (bill.tipo !== tipo) return false;
      if (status !== 'all' && bill.status !== status) return false;

      const ref = dateBasis === 'dueDate' ? bill.dueDate : bill.datapagamento;
      if (!ref) return false;
      const refKey = ref.slice(0, 10);

      if (filterMode === 'meses') {
        if (selectedMonths.length === 0) return false;
        if (!selectedMonths.includes(monthKey(refKey))) return false;
      } else {
        if (startDate && refKey < startDate) return false;
        if (endDate && refKey > endDate) return false;
      }
      return true;
    });

    const monthSet = new Set<string>();
    const byCategory = new Map<
      string,
      { total: number; months: Map<string, number>; items: typeof filtered }
    >();

    filtered.forEach((bill) => {
      const ref = (dateBasis === 'dueDate' ? bill.dueDate : bill.datapagamento) as string;
      const mk = monthKey(ref.slice(0, 10));
      monthSet.add(mk);

      const category = bill.category?.trim() || 'Sem categoria';
      if (!byCategory.has(category)) {
        byCategory.set(category, { total: 0, months: new Map(), items: [] });
      }
      const entry = byCategory.get(category)!;
      entry.total += bill.amount;
      entry.months.set(mk, (entry.months.get(mk) || 0) + bill.amount);
      entry.items.push(bill);
    });

    const months = Array.from(monthSet).sort();

    const groups = Array.from(byCategory.entries())
      .map(([category, entry]) => ({
        category,
        total: entry.total,
        values: months.map((m) => entry.months.get(m) || 0),
        items: [...entry.items].sort((a, b) => {
          const ra = (dateBasis === 'dueDate' ? a.dueDate : a.datapagamento) || '';
          const rb = (dateBasis === 'dueDate' ? b.dueDate : b.datapagamento) || '';
          return ra.localeCompare(rb);
        }),
      }))
      .sort((a, b) => b.total - a.total);

    const monthTotals = months.map((_, i) => groups.reduce((sum, g) => sum + g.values[i], 0));
    const grandTotal = groups.reduce((sum, g) => sum + g.total, 0);

    return { months, groups, monthTotals, grandTotal, count: filtered.length };
  }, [bills, tipo, dateBasis, status, filterMode, selectedMonths, startDate, endDate]);

  const periodText = useMemo(() => {
    if (filterMode === 'meses') {
      if (selectedMonths.length === 0) return 'Nenhum mês selecionado';
      return [...selectedMonths].sort().map(monthLabelLong).join(', ');
    }
    return startDate || endDate
      ? `${startDate ? formatDateBR(startDate) : '...'} a ${endDate ? formatDateBR(endDate) : '...'}`
      : 'Todo o período';
  }, [filterMode, selectedMonths, startDate, endDate]);

  const exportToPDF = () => {
    const landscape = viewMode === 'detalhado' || report.months.length > 6;
    const doc = new jsPDF(landscape ? 'landscape' : 'portrait');
    const title =
      tipo === 'pagar' ? 'Relatório de Despesas por Categoria' : 'Relatório de Receitas por Categoria';

    doc.setFontSize(16);
    doc.text(title, 14, 18);

    doc.setFontSize(10);
    const basisText = dateBasis === 'dueDate' ? 'Data de vencimento' : 'Data de pagamento';
    const statusText = status === 'all' ? 'Todos' : status === 'paid' ? 'Pagas' : 'Pendentes';
    doc.text(`Base: ${basisText} | Status: ${statusText}`, 14, 25);
    doc.text(doc.splitTextToSize(`Período: ${periodText}`, 260), 14, 31);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 37);

    if (viewMode === 'resumo') {
      const head = [['Categoria', ...report.months.map(monthLabel), 'Total']];
      const body: string[][] = report.groups.map((g) => [
        g.category,
        ...g.values.map((v) => formatCurrency(v)),
        formatCurrency(g.total),
      ]);
      body.push([
        'TOTAL GERAL',
        ...report.monthTotals.map((v) => formatCurrency(v)),
        formatCurrency(report.grandTotal),
      ]);

      autoTable(doc, {
        head,
        body,
        startY: 44,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [68, 114, 196], textColor: [255, 255, 255], fontStyle: 'bold' },
        didParseCell: (data) => {
          if (data.section === 'body' && data.row.index === body.length - 1) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [235, 240, 250];
          }
        },
      });
    } else {
      // Relatório único detalhado: itens agrupados por categoria + subtotais
      const head = [['Data', 'Descrição / Fornecedor', 'Nota Fiscal', 'Status', 'Valor']];
      const body: string[][] = [];
      const categoryRows: number[] = [];
      const subtotalRows: number[] = [];

      report.groups.forEach((g) => {
        categoryRows.push(body.length);
        body.push([`CATEGORIA: ${g.category}`, '', '', '', '']);
        g.items.forEach((bill) => {
          const ref = (dateBasis === 'dueDate' ? bill.dueDate : bill.datapagamento) || '';
          body.push([
            formatDateBR(ref.slice(0, 10)),
            bill.vendorName || '-',
            bill.numero_nota_fiscal || '-',
            bill.status === 'paid' ? 'Paga' : 'Pendente',
            formatCurrency(bill.amount),
          ]);
        });
        subtotalRows.push(body.length);
        body.push(['', '', '', `Total ${g.category}`, formatCurrency(g.total)]);
      });

      const totalRow = body.length;
      body.push(['', '', '', 'TOTAL GERAL', formatCurrency(report.grandTotal)]);

      autoTable(doc, {
        head,
        body,
        startY: 44,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [68, 114, 196], textColor: [255, 255, 255], fontStyle: 'bold' },
        columnStyles: {
          0: { cellWidth: 24 },
          2: { cellWidth: 32 },
          3: { cellWidth: 28 },
          4: { cellWidth: 32, halign: 'right' },
        },
        didParseCell: (data) => {
          if (data.section !== 'body') return;
          const i = data.row.index;
          if (categoryRows.includes(i)) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [225, 233, 247];
          } else if (subtotalRows.includes(i)) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [243, 245, 249];
          } else if (i === totalRow) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [68, 114, 196];
            data.cell.styles.textColor = [255, 255, 255];
          }
        },
      });
    }

    doc.save(`relatorio-${viewMode}-${tipo}.pdf`);
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
                Escolha os meses ou um período e veja as despesas detalhadas com total por categoria
              </p>
            </div>
            <Button variant="outline" onClick={exportToPDF} disabled={report.groups.length === 0}>
              <FileDown className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-4 mb-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
                <Label>Seleção de datas</Label>
                <Select value={filterMode} onValueChange={(v) => setFilterMode(v as FilterMode)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="periodo">Por período</SelectItem>
                    <SelectItem value="meses">Escolher meses</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>Visualização</Label>
                <Select value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="detalhado">Detalhado</SelectItem>
                    <SelectItem value="resumo">Resumo mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {filterMode === 'periodo' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="start">Data inicial</Label>
                  <Input id="start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="end">Data final</Label>
                  <Input id="end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Meses do relatório</Label>
                <div className="flex flex-wrap items-center gap-2">
                  <Popover open={monthsOpen} onOpenChange={setMonthsOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-start min-w-[220px]">
                        {selectedMonths.length === 0
                          ? 'Selecionar meses'
                          : `${selectedMonths.length} mês(es) selecionado(s)`}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-64 p-0 bg-popover z-50">
                      <div className="max-h-72 overflow-y-auto p-2 space-y-1">
                        {availableMonths.length === 0 && (
                          <p className="text-sm text-muted-foreground p-2">Nenhum mês disponível</p>
                        )}
                        {availableMonths.map((m) => (
                          <label
                            key={m}
                            className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent cursor-pointer text-sm"
                          >
                            <Checkbox
                              checked={selectedMonths.includes(m)}
                              onCheckedChange={() => toggleMonth(m)}
                            />
                            {monthLabelLong(m)}
                          </label>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>

                  <Button variant="ghost" size="sm" onClick={() => setSelectedMonths(availableMonths)}>
                    <Check className="h-4 w-4 mr-1" /> Todos
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedMonths([])}>
                    Limpar
                  </Button>
                </div>
                {selectedMonths.length > 0 && (
                  <p className="text-xs text-muted-foreground">{periodText}</p>
                )}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm overflow-hidden">
            {report.groups.length === 0 ? (
              <div className="p-10 text-center text-gray-500 dark:text-gray-400">
                {filterMode === 'meses' && selectedMonths.length === 0
                  ? 'Selecione ao menos um mês para gerar o relatório.'
                  : 'Nenhum lançamento encontrado para os filtros selecionados.'}
              </div>
            ) : viewMode === 'resumo' ? (
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
                    {report.groups.map((g) => (
                      <tr key={g.category} className="border-t border-gray-100 dark:border-gray-800">
                        <td className="px-4 py-2 max-w-[220px] truncate sticky left-0 bg-white dark:bg-gray-900" title={g.category}>
                          {g.category}
                        </td>
                        {g.values.map((v, i) => (
                          <td key={i} className="px-4 py-2 text-right whitespace-nowrap">
                            {v ? formatCurrency(v) : '-'}
                          </td>
                        ))}
                        <td className="px-4 py-2 text-right font-semibold whitespace-nowrap">
                          {formatCurrency(g.total)}
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
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold w-28">Data</th>
                      <th className="text-left px-4 py-3 font-semibold">Descrição / Fornecedor</th>
                      <th className="text-left px-4 py-3 font-semibold w-32">Nota Fiscal</th>
                      <th className="text-left px-4 py-3 font-semibold w-28">Status</th>
                      <th className="text-right px-4 py-3 font-semibold w-36">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.groups.map((g) => (
                      <React.Fragment key={g.category}>
                        <tr className="bg-blue-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                          <td colSpan={5} className="px-4 py-2 font-semibold">
                            {g.category}
                          </td>
                        </tr>
                        {g.items.map((bill) => {
                          const ref = (dateBasis === 'dueDate' ? bill.dueDate : bill.datapagamento) || '';
                          return (
                            <tr key={bill.id} className="border-t border-gray-100 dark:border-gray-800">
                              <td className="px-4 py-2 whitespace-nowrap">{formatDateBR(ref.slice(0, 10))}</td>
                              <td className="px-4 py-2 max-w-[320px] truncate" title={bill.vendorName || ''}>
                                {bill.vendorName || '-'}
                              </td>
                              <td className="px-4 py-2 truncate">{bill.numero_nota_fiscal || '-'}</td>
                              <td className="px-4 py-2">{bill.status === 'paid' ? 'Paga' : 'Pendente'}</td>
                              <td className="px-4 py-2 text-right whitespace-nowrap">
                                {formatCurrency(bill.amount)}
                              </td>
                            </tr>
                          );
                        })}
                        <tr className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 font-semibold">
                          <td colSpan={4} className="px-4 py-2 text-right">
                            Total {g.category}
                          </td>
                          <td className="px-4 py-2 text-right whitespace-nowrap">{formatCurrency(g.total)}</td>
                        </tr>
                      </React.Fragment>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 font-bold">
                      <td colSpan={4} className="px-4 py-3 text-right">TOTAL GERAL</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">{formatCurrency(report.grandTotal)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {report.groups.length > 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
              {report.count} lançamento(s) · {report.groups.length} categoria(s) · {report.months.length} mês(es)
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Reports;
