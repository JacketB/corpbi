import { Component, computed, effect, ElementRef, inject, viewChild } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Chart } from 'chart.js/auto';

import { DataService } from '../../services/data.service';
import { ChartColors } from '../../consts/chart.colors';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-dashboard',
  imports: [DecimalPipe, CommonModule, TranslocoPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private dataService = inject(DataService);
  summaryResource = this.dataService.summaryData;
  financialDataResource = this.dataService.financial;
  departmentsDataResource = this.dataService.departments;

  readonly summary = computed(() => this.summaryResource.value());
  readonly financialData = computed(() => this.financialDataResource.value() ?? []);
  readonly departmentsData = computed(() => this.departmentsDataResource.value() ?? [])

  private chartInstance: Chart | null = null;

  canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('financialChartCanvas');

  readonly financialGroups = computed(() => {
    const data = this.financialDataResource.value() ?? [];
    return {
      dates: data.map(i => i.date),
      revenue: data.map(i => i.revenue),
      expenses: data.map(i => i.expenses),
      netProfit: data.map(i => i.netProfit)
    };
  });

  constructor() {
    effect(() => {
      const groups = this.financialGroups();
      const canvas = this.canvasRef()?.nativeElement;

      if (groups.dates.length > 0 && canvas) {
        this.renderOrUpdateChart(canvas, groups);
      }
    });
  }

  private renderOrUpdateChart(canvas: HTMLCanvasElement, groups: any) {
    if (this.chartInstance) {
      this.chartInstance.data.labels = groups.dates;
      this.chartInstance.data.datasets[0].data = groups.revenue;
      this.chartInstance.data.datasets[1].data = groups.expenses;
      this.chartInstance.data.datasets[2].data = groups.netProfit;
      this.chartInstance.update();
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: groups.dates,
        datasets: [
          { label: 'Revenue', data: groups.revenue, borderColor: ChartColors.red, backgroundColor:ChartColors.red, tension: 0.3 },
          { label: 'Expenses', data: groups.expenses, borderColor: ChartColors.green, backgroundColor:ChartColors.green, tension: 0.3 },
          { label: 'Net Profit', data: groups.netProfit, borderColor: ChartColors.blue, backgroundColor:ChartColors.blue, tension: 0.3 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            align: 'start',
            labels: {
              usePointStyle: true
            }
          }
        }
      }
    });
  }
}
