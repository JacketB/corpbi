import { Component, computed, effect, ElementRef, inject, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart } from 'chart.js/auto';

import { DataService } from '../../services/data.service';
import { DepartmentsAnalyticsService } from '../../services/departments-analytics.service';
import { ChartColors } from '../../consts/chart.colors';

@Component({
  selector: 'app-departmens',
  imports: [CommonModule],
  templateUrl: './departmens.html',
  styleUrl: './departmens.css',
})
export class Departmens {
  private dataService = inject(DataService);
  private analyticsService = inject(DepartmentsAnalyticsService);

  departmentsDataResource = this.dataService.departments;
  departmentsData = computed(() => this.departmentsDataResource.value() ?? []);

  expensesCanvas = viewChild<ElementRef<HTMLCanvasElement>>('expensesChartCanvas');
  revenueCanvas = viewChild<ElementRef<HTMLCanvasElement>>('revenueChartCanvas');
  profitCanvas = viewChild<ElementRef<HTMLCanvasElement>>('profitChartCanvas');

  private expensesChartInstance: Chart | null = null;
  private revenueChartInstance: Chart | null = null;
  private profitChartInstance: Chart | null = null;

  readonly chartAnalytics = computed(() => this.analyticsService.financialAnalyticsResource.value());

  constructor() {
    effect(() => {
      const analytics = this.chartAnalytics();
      const expCanvas = this.expensesCanvas()?.nativeElement;
      const revCanvas = this.revenueCanvas()?.nativeElement;
      const profCanvas = this.profitCanvas()?.nativeElement;

      if (analytics && analytics.labels.length > 0 && expCanvas && revCanvas && profCanvas) {
        this.expensesChartInstance = this.renderOrUpdateChart(
          this.expensesChartInstance,
          expCanvas,
          analytics.labels,
          analytics.expensesData
        );

        this.revenueChartInstance = this.renderOrUpdateChart(
          this.revenueChartInstance,
          revCanvas,
          analytics.labels,
          analytics.revenueData
        );

        this.profitChartInstance = this.renderOrUpdateChart(
          this.profitChartInstance,
          profCanvas,
          analytics.labels,
          analytics.profitData
        );
      }
    });
  }

  private renderOrUpdateChart(
    chartInstance: Chart | null,
    canvas: HTMLCanvasElement,
    labels: string[],
    rawDatasets: { label: string; data: number[] }[]
  ): Chart | null {
    const palette = [
      ChartColors.blue,
      ChartColors.red,
      ChartColors.green,
      '#f59e0b',
      '#8b5cf6',
      '#ec4899',
    ];

    const datasets = rawDatasets.map((ds, idx) => ({
      ...ds,
      borderColor: palette[idx % palette.length],
      backgroundColor: palette[idx % palette.length],
      tension: 0.3,
    }));

    if (chartInstance) {
      chartInstance.data.labels = labels;
      chartInstance.data.datasets = datasets;
      chartInstance.update();
      return chartInstance;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    return new Chart(ctx, {
      type: 'line',
      data: { labels, datasets },
      options: {
        plugins: {
          legend: {
            position: 'right',
            align: 'start',
            labels: {
              usePointStyle: true
            }
          }
        },
        responsive: true,
        maintainAspectRatio: false,
      },
    });
  }
}