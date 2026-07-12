import { Component, computed, effect, ElementRef, inject, input, viewChild } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { Chart } from 'chart.js/auto';

import { DataService } from '../../services/data.service';
import { ChartColors } from '../../consts/chart.colors';

@Component({
  selector: 'app-department-detail',
  standalone: true,
  imports: [CommonModule, DecimalPipe, RouterLink, TranslocoPipe],
  templateUrl: './departments-detail.html',
  styleUrl: './departments-detail.css',
})
export class DepartmentsDetail {
  id = input.required<string>(); 

  private dataService = inject(DataService);

  departmentsResource = this.dataService.departments;
  employeesResource = this.dataService.getEmployeesByDepartment(this.id);

  deptCanvas = viewChild<ElementRef<HTMLCanvasElement>>('deptChartCanvas');
  private chartInstance: Chart | null = null;

  readonly department = computed(() => {
    const list = this.departmentsResource.value() ?? [];
    return list.find(d => String(d.departmentId) === this.id());
  });

  readonly employees = computed(() => this.employeesResource.value() ?? []);

  constructor() {
    effect(() => {
      const dept = this.department();
      const canvas = this.deptCanvas()?.nativeElement;
      if (dept && canvas) {
        this.renderOrUpdateChart(canvas, dept);
      }
    });
  }

  private renderOrUpdateChart(canvas: HTMLCanvasElement, dept: any) {
    const labels = ['Q1', 'Q2', 'Q3', 'Q4'];
    const datasets = [
      { label: 'Revenue', data: dept.quarterlyRevenue || [12000, 19000, 15000, 22000], borderColor: ChartColors.green, backgroundColor: ChartColors.green, tension: 0.3 },
      { label: 'Expenses', data: dept.quarterlyExpenses || [8000, 11000, 9500, 13000], borderColor: ChartColors.red, backgroundColor: ChartColors.red, tension: 0.3 }
    ];

    if (this.chartInstance) {
      this.chartInstance.data.labels = labels;
      this.chartInstance.data.datasets = datasets;
      this.chartInstance.update();
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.chartInstance = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets },
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
        },
      }
    });
  }
}