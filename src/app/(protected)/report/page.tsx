"use client";

import { ArrowLeft, Download, Shield, CheckCircle, Droplets, Disc, CircleDot, Wrench, TrendingUp, Calendar, Gauge } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

const maintenanceHistory = [
  { icon: Droplets, service: "Troca de óleo", date: "28 Mar 2026", cost: "R$ 280", km: "45.230 km", category: "Fluidos" },
  { icon: Disc, service: "Pastilha de freio", date: "10 Jan 2026", cost: "R$ 520", km: "43.800 km", category: "Freios" },
  { icon: CircleDot, service: "Troca de pneus", date: "15 Nov 2025", cost: "R$ 1.800", km: "41.200 km", category: "Pneus" },
  { icon: Wrench, service: "Revisão geral", date: "20 Ago 2025", cost: "R$ 950", km: "38.000 km", category: "Revisão" },
  { icon: Droplets, service: "Troca de óleo", date: "05 Mai 2025", cost: "R$ 250", km: "35.100 km", category: "Fluidos" },
];

export default function VehicleReportPage() {
  const router = useRouter();
  const reportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const totalSpent = "R$ 3.800";
  const totalServices = maintenanceHistory.length;
  const reliabilityScore = 92;

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    setExporting(true);
    try {
      const html2canvas = (await import("html2canvas-pro")).default;
      const { jsPDF } = await import("jspdf");
      const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true, backgroundColor: "#f8f9fb" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("SeuCarro-Relatorio-Honda-Civic-2021.pdf");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-lg border-b border-border px-5 py-3 flex items-center justify-between">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center card-shadow active:scale-95 transition-transform">
          <ArrowLeft className="w-4.5 h-4.5 text-foreground" />
        </button>
        <h1 className="text-base font-bold text-foreground">Relatório do Veículo</h1>
        <button onClick={handleExportPDF} disabled={exporting} className="w-10 h-10 rounded-full bg-primary flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50">
          <Download className="w-4.5 h-4.5 text-primary-foreground" />
        </button>
      </div>

      <div ref={reportRef} className="px-5 py-6 pb-10 space-y-5 max-w-lg mx-auto">
        <div className="bg-card rounded-2xl p-6 card-shadow-lg text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-accent via-primary to-accent" />
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3"><Shield className="w-8 h-8 text-accent" /></div>
          <div className="inline-flex items-center gap-1.5 bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-bold mb-3"><CheckCircle className="w-3.5 h-3.5" />Histórico Verificado</div>
          <h2 className="text-lg font-bold text-foreground">Honda Civic 2021</h2>
          <p className="text-sm text-muted-foreground mt-1">Placa: ABC-1D23 · Cor: Prata</p>
          <p className="text-xs text-muted-foreground mt-0.5">Relatório gerado em 02 Abr 2026</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-xl p-4 card-shadow text-center"><Gauge className="w-5 h-5 text-primary mx-auto mb-1.5" /><p className="text-lg font-bold text-foreground">45.230</p><p className="text-[10px] text-muted-foreground font-medium">KM ATUAL</p></div>
          <div className="bg-card rounded-xl p-4 card-shadow text-center"><Calendar className="w-5 h-5 text-primary mx-auto mb-1.5" /><p className="text-lg font-bold text-foreground">{totalServices}</p><p className="text-[10px] text-muted-foreground font-medium">SERVIÇOS</p></div>
          <div className="bg-card rounded-xl p-4 card-shadow text-center"><TrendingUp className="w-5 h-5 text-primary mx-auto mb-1.5" /><p className="text-lg font-bold text-foreground">{totalSpent}</p><p className="text-[10px] text-muted-foreground font-medium">INVESTIDO</p></div>
        </div>

        <div className="bg-card rounded-2xl p-5 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <div><h3 className="font-bold text-foreground text-sm">Score de Confiabilidade</h3><p className="text-xs text-muted-foreground mt-0.5">Baseado no histórico de manutenções</p></div>
            <div className="text-right"><span className="text-3xl font-extrabold text-accent">{reliabilityScore}</span><span className="text-sm text-muted-foreground font-medium">/100</span></div>
          </div>
          <div className="h-3 bg-secondary rounded-full overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-accent/80 to-accent transition-all" style={{ width: `${reliabilityScore}%` }} /></div>
          <div className="flex justify-between mt-2"><span className="text-[10px] text-muted-foreground">Baixo</span><span className="text-[10px] text-muted-foreground">Médio</span><span className="text-[10px] text-muted-foreground">Excelente</span></div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {["Manutenções em dia", "Revisões regulares", "Pneus novos", "Óleo em dia"].map((t) => (
              <div key={t} className="flex items-center gap-2 bg-accent/5 rounded-lg px-3 py-2"><CheckCircle className="w-3.5 h-3.5 text-accent" /><span className="text-xs text-foreground font-medium">{t}</span></div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-2xl p-5 card-shadow">
          <h3 className="font-bold text-foreground text-sm mb-4">Gastos por Categoria</h3>
          <div className="space-y-3">
            {[{ label: "Fluidos", value: "R$ 530", pct: 14, color: "bg-primary" }, { label: "Freios", value: "R$ 520", pct: 14, color: "bg-warning" }, { label: "Pneus", value: "R$ 1.800", pct: 47, color: "bg-danger" }, { label: "Revisão", value: "R$ 950", pct: 25, color: "bg-muted-foreground" }].map((cat) => (
              <div key={cat.label}><div className="flex items-center justify-between mb-1"><span className="text-xs font-medium text-foreground">{cat.label}</span><span className="text-xs font-bold text-foreground">{cat.value}</span></div><div className="h-2 bg-secondary rounded-full overflow-hidden"><div className={`h-full rounded-full ${cat.color}`} style={{ width: `${cat.pct}%` }} /></div></div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-2xl p-5 card-shadow">
          <h3 className="font-bold text-foreground text-sm mb-4">Histórico Completo de Manutenções</h3>
          <div className="space-y-0">
            {maintenanceHistory.map((item, i) => { const Icon = item.icon; return (
              <div key={i} className="flex items-center gap-3 py-3 border-b border-border last:border-0">
                <div className="w-9 h-9 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0"><Icon className="w-4 h-4 text-primary" /></div>
                <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-foreground">{item.service}</p><p className="text-xs text-muted-foreground">{item.date} · {item.km}</p></div>
                <span className="text-sm font-bold text-foreground whitespace-nowrap">{item.cost}</span>
              </div>
            ); })}
          </div>
        </div>

        <div className="text-center pt-2 pb-4"><p className="text-xs text-muted-foreground">Relatório gerado por <span className="font-bold text-primary">SeuCarro</span></p><p className="text-[10px] text-muted-foreground mt-1">Histórico confiável para compra e venda de veículos</p></div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-border p-4 max-w-lg mx-auto">
        <button onClick={handleExportPDF} disabled={exporting} className="w-full bg-primary text-primary-foreground rounded-2xl py-4 font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50">
          <Download className="w-5 h-5" />{exporting ? "Gerando PDF..." : "Exportar Relatório em PDF"}
        </button>
      </div>
    </div>
  );
}
