import { Component, computed, effect, inject, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { CommonModule, DecimalPipe } from '@angular/common';
@Component({
  selector: 'app-dashboard',
  imports: [DecimalPipe, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard{
  private dataService = inject(DataService);
  summaryResource = this.dataService.summaryData;
  financialDataResource = this.dataService.financial;
  departmentsDataResource = this.dataService.departments;

  readonly summary = computed(() => this.summaryResource.value());
  readonly financialData = computed(() => this.financialDataResource.value() ?? []);
  readonly departmentsData = computed(() => this.departmentsDataResource.value() ?? [])
  
  readonly financialGroups = computed(() => {
    const data = this.financialDataResource.value() ?? [];
    return {
      expenses: data.map(i => ({date: i.date, expenses: i.expenses})),
      revenue: data.map(i => ({date: i.date, revenue: i.revenue})),
      netProfit: data.map(i => ({date: i.date, netProfit: i.netProfit}))
    }
  }) 
}
