"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Battery, Calendar, CheckCircle, CircleDot, Disc, Download,
  Droplets, Gauge, LifeBuoy, Settings, Shield, SlidersHorizontal,
  TrendingUp, Wind, Wrench,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import { usePrimaryVehicle } from "@/hooks/useVehicles";
import { useMaintenances } from "@/hooks/useMaintenances";
import { useExpensesByCategory, useTotalExpenses } from "@/hooks/useExpenses";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { calculateVehicleScore } from "@/lib/vehicleScore";
import { SERVICE_TYPE_LABELS, type ServiceType } from "@/types/database";

const serviceIcons: Record<ServiceType, typeof Droplets> = {
  troca_oleo: Droplets,
  freios: Disc,
  pneus: CircleDot,
  filtros: Wind,
  bateria: Battery,
  suspensao: LifeBuoy,
  alinhamento: SlidersHorizontal,
  revisao: Settings,
  outro: Wrench,
};

const categoryColors = ["bg-primary", "bg-warning", "bg-danger", "bg-muted-foreground", "bg-success", "bg-accent"];

export default function VehicleReportPage() {
  const router = useRouter();
  const reportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const { data: vehicle } = usePrimaryVehicle();
  const { data: maintenances } = useMaintenances({ vehicleId: vehicle?.id });
  const { data: byCategory } = useExpensesByCategory(vehicle?.id);
  const { data: totals } = useTotalExpenses(vehicle?.id);

  const score = calculateVehicleScore(vehicle, maintenances ?? []);
  const today = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

  const handleExportPDF = async () => {
    if (!reportRef.current || !vehicle) return;
    setExporting(true);
    try {
      const html2canvas = (await import("html2canvas-pro")).default;
      const { jsPDF } = await import("jspdf");
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#f8f9fb",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`SeuCarro-Relatorio-${vehicle.brand}-${vehicle.model}-${vehicle.year}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
    } finally {
      setExporting(false);
    }
  };

  if (!vehicle) {
    return (
      <AppShell>
        <div className="px-5 pt-14 pb-24 animate-fade-in">
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center card-shadow active:scale-95 transition-transform"
            >
              <ArrowLeft className="w-4.5 h-4.5 text-foreground" />
            </button>
            <h1 className="text-xl font-bold text-foreground tracking-tight">Relatório</h1>
          </div>
          <div className="bg-card rounded-2xl p-8 card-shadow border-2 border-dashed border-border text-center">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-bold text-foreground mb-2">Sem veículo cadastrado</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Cadastre um veículo para gerar o relatório.
            </p>
            <button
              onClick={() => router.push("/vehicles/new")}
              className="bg-primary text-primary-foreground font-semibold px-5 py-3 rounded-2xl active:scale-[0.98] transition-transform"
            >
              Cadastrar veículo
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  const list = maintenances ?? [];
  const topCategories = byCategory.slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-lg border-b border-border px-5 py-3 flex items-center justify-between max-w-lg mx-auto">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center card-shadow active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-4.5 h-4.5 text-foreground" />
        </button>
        <h1 className="text-base font-bold text-foreground">Relatório do Veículo</h1>
        <button
          onClick={handleExportPDF}
          disabled={exporting}
          className="w-10 h-10 rounded-full bg-primary flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50"
        >
          <Download className="w-4.5 h-4.5 text-primary-foreground" />
        </button>
      </div>

      <div ref={reportRef} className="px-5 py-6 pb-28 space-y-5 max-w-lg mx-auto">
        <div className="bg-card rounded-2xl p-6 card-shadow-lg text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-accent via-primary to-accent" />
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <Shield className="w-8 h-8 text-accent" />
          </div>
          <div className="inline-flex items-center gap-1.5 bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-bold mb-3">
            <CheckCircle className="w-3.5 h-3.5" />
            Histórico Verificado
          </div>
          <h2 className="text-lg font-bold text-foreground">
            {vehicle.brand} {vehicle.model} {vehicle.year}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {vehicle.license_plate ? `Placa: ${vehicle.license_plate}` : "Sem placa cadastrada"}
            {vehicle.color ? ` · Cor: ${vehicle.color}` : ""}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Relatório gerado em {today}</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-xl p-4 card-shadow text-center">
            <Gauge className="w-5 h-5 text-primary mx-auto mb-1.5" />
            <p className="text-lg font-bold text-foreground">{formatNumber(vehicle.current_mileage)}</p>
            <p className="text-[10px] text-muted-foreground font-medium">KM ATUAL</p>
          </div>
          <div className="bg-card rounded-xl p-4 card-shadow text-center">
            <Calendar className="w-5 h-5 text-primary mx-auto mb-1.5" />
            <p className="text-lg font-bold text-foreground">{totals.count}</p>
            <p className="text-[10px] text-muted-foreground font-medium">SERVIÇOS</p>
          </div>
          <div className="bg-card rounded-xl p-4 card-shadow text-center">
            <TrendingUp className="w-5 h-5 text-primary mx-auto mb-1.5" />
            <p className="text-lg font-bold text-foreground">{formatCurrency(totals.total).replace("R$", "R$").trim()}</p>
            <p className="text-[10px] text-muted-foreground font-medium">INVESTIDO</p>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-5 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-foreground text-sm">Score de Confiabilidade</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{score.label} · histórico dos últimos 12 meses</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-extrabold text-accent">{score.total}</span>
              <span className="text-sm text-muted-foreground font-medium">/100</span>
            </div>
          </div>
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent/80 to-accent transition-all"
              style={{ width: `${score.total}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[10px] text-muted-foreground">Baixo</span>
            <span className="text-[10px] text-muted-foreground">Médio</span>
            <span className="text-[10px] text-muted-foreground">Excelente</span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="bg-accent/5 rounded-lg px-2 py-2">
              <p className="text-xs font-bold text-accent">{score.oilChangeRegularity}</p>
              <p className="text-[10px] text-muted-foreground leading-tight">Trocas de óleo</p>
            </div>
            <div className="bg-accent/5 rounded-lg px-2 py-2">
              <p className="text-xs font-bold text-accent">{score.reviewFrequency}</p>
              <p className="text-[10px] text-muted-foreground leading-tight">Revisões</p>
            </div>
            <div className="bg-accent/5 rounded-lg px-2 py-2">
              <p className="text-xs font-bold text-accent">{score.maintenanceCoverage}</p>
              <p className="text-[10px] text-muted-foreground leading-tight">Cobertura</p>
            </div>
          </div>
        </div>

        {topCategories.length > 0 && (
          <div className="bg-card rounded-2xl p-5 card-shadow">
            <h3 className="font-bold text-foreground text-sm mb-4">Gastos por Categoria</h3>
            <div className="space-y-3">
              {topCategories.map((cat, i) => {
                const pct = totals.total > 0 ? (cat.total / totals.total) * 100 : 0;
                const color = categoryColors[i % categoryColors.length];
                return (
                  <div key={cat.serviceType}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-foreground">{cat.label}</span>
                      <span className="text-xs font-bold text-foreground">{formatCurrency(cat.total)}</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${color}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="bg-card rounded-2xl p-5 card-shadow">
          <h3 className="font-bold text-foreground text-sm mb-4">Histórico Completo de Manutenções</h3>
          {list.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Nenhuma manutenção registrada ainda.
            </p>
          ) : (
            <div className="space-y-0">
              {list.map((m) => {
                const Icon = serviceIcons[m.service_type];
                return (
                  <div key={m.id} className="flex items-center gap-3 py-3 border-b border-border last:border-0">
                    <div className="w-9 h-9 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {SERVICE_TYPE_LABELS[m.service_type]}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(m.service_date)}
                        {m.mileage != null && ` · ${formatNumber(m.mileage)} km`}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-foreground whitespace-nowrap">
                      {formatCurrency(Number(m.cost))}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="text-center pt-2 pb-4">
          <p className="text-xs text-muted-foreground">
            Relatório gerado por <span className="font-bold text-primary">SeuCarro</span>
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            Histórico confiável para compra e venda de veículos
          </p>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-border p-4 max-w-lg mx-auto">
        <button
          onClick={handleExportPDF}
          disabled={exporting}
          className="w-full bg-primary text-primary-foreground rounded-2xl py-4 font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          <Download className="w-5 h-5" />
          {exporting ? "Gerando PDF..." : "Exportar Relatório em PDF"}
        </button>
      </div>
    </div>
  );
}
