import {
  Component, OnInit, OnDestroy,
  ViewChild, ElementRef, signal, inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import {
  Chart, CategoryScale, LinearScale, BarElement, ArcElement,
  Tooltip, Legend, BarController, DoughnutController,
} from 'chart.js';

import { Navbar } from '../../../shared/navbar/navbar';
import { DashboardService } from '../../../core/services/data/dashboard.service';
import { SpecialityService } from '../../../core/services/data/speciality.service';
import { DashboardStatsModel } from '../../../core/models/data/DashboardStats';
import { SpecialityModel } from '../../../core/models/data/Speciality';

// Registramos solo los componentes de Chart.js que realmente usamos
// (evita incluir el bundle completo de la librería).
Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, BarController, DoughnutController);

const SPEC_COLORS = [
  '#7c3aed', '#0d9488', '#d97706', '#1d4ed8',
  '#e11d48', '#16a34a', '#9333ea', '#ea580c',
];

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule, MatIconModule, Navbar],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit, OnDestroy {
  @ViewChild('barCanvas') barCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('donutCanvas') donutCanvasRef!: ElementRef<HTMLCanvasElement>;

  private readonly dashboardService = inject(DashboardService);
  private readonly specialityService = inject(SpecialityService);

  readonly loading = signal(true);
  readonly stats = signal<DashboardStatsModel | null>(null);
  readonly specialities = signal<SpecialityModel[]>([]);
  readonly selectedSpecialityId = signal<number | null>(null);

  private barChart?: Chart;
  private donutChart?: Chart;

  ngOnInit(): void {
    this.specialityService.getAll().subscribe((r) => {
      this.specialities.set((r.data ?? []).filter((s) => s.active));
      this.loadStats();
    });
  }

  ngOnDestroy(): void {
    this.barChart?.destroy();
    this.donutChart?.destroy();
  }

  onSpecialityChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedSpecialityId.set(val ? +val : null);
    this.loadStats();
  }

  getSpecialityIndex(id: number): number {
    const idx = this.specialities().findIndex((s) => s.id === id);
    return idx < 0 ? 0 : idx % 8;
  }

  getSpecColor(specialityId: number): string {
    return SPEC_COLORS[this.getSpecialityIndex(specialityId)] ?? '#9ca3af';
  }

  private loadStats(): void {
    this.loading.set(true);
    this.dashboardService.getStats(this.selectedSpecialityId()).subscribe({
      next: (r) => {
        this.stats.set(r.data ?? null);
        this.loading.set(false);
        setTimeout(() => this.renderCharts());
      },
      error: () => this.loading.set(false),
    });
  }

  private renderCharts(): void {
    const stats = this.stats();
    if (!stats) return;
    this.renderBar(stats);
    this.renderDonut(stats);
  }

  private renderBar(stats: DashboardStatsModel): void {
    const canvas = this.barCanvasRef?.nativeElement;
    if (!canvas) return;

    // Destruimos la instancia anterior para evitar la advertencia de canvas reutilizado.
    this.barChart?.destroy();

    this.barChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: stats.persons_by_level.map((l) => l.name),
        datasets: [{
          data: stats.persons_by_level.map((l) => l.count),
          backgroundColor: '#3f5fe0',
          borderRadius: 6,
          borderSkipped: false,
          barPercentage: 0.55,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          // Tooltip personalizado: mostramos "N personas" en lugar del valor bruto.
          tooltip: {
            callbacks: { label: (ctx) => ` ${ctx.parsed.y} personas` },
          },
        },
        scales: {
          // Eje X: sin líneas de cuadrícula, fuente Inter.
          x: {
            grid: { display: false },
            ticks: { color: '#6b7280', font: { size: 12, family: 'Inter, system-ui, sans-serif' } },
          },
          // Eje Y: empezando en cero, cuadrícula suave y salto de 10 en 10.
          y: {
            beginAtZero: true,
            grid: { color: '#f0f0f0' },
            ticks: { color: '#6b7280', font: { size: 12, family: 'Inter, system-ui, sans-serif' }, stepSize: 10 },
          },
        },
      },
    });
  }

  private renderDonut(stats: DashboardStatsModel): void {
    const canvas = this.donutCanvasRef?.nativeElement;
    if (!canvas) return;

    // Destruimos la instancia anterior para evitar la advertencia de canvas reutilizado.
    this.donutChart?.destroy();

    // Asignamos a cada especialidad el color de la paleta según su índice en la lista.
    const colors = stats.persons_by_speciality.map((s) => this.getSpecColor(s.id));

    this.donutChart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: stats.persons_by_speciality.map((s) => s.name),
        datasets: [{
          data: stats.persons_by_speciality.map((s) => s.count),
          backgroundColor: colors,
          borderWidth: 3,
          borderColor: '#fff',
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '62%',  // Grosor del anillo: a mayor valor, más fino.
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.parsed} personas` },
          },
        },
      },
    });
  }
}

