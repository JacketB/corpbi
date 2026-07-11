import { Component, computed, inject } from '@angular/core';
import { DataService } from '../../services/data.service';
import { CommonModule, DecimalPipe } from '@angular/common';
@Component({
  selector: 'app-dashboard',
  imports: [DecimalPipe, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private dataService = inject(DataService);
  summaryResource = this.dataService.summaryData;
  financialDataResource = this.dataService.financial;

  readonly summary = computed(() => this.summaryResource.value());
  readonly financialData = computed(() => this.financialDataResource.value() ?? []);
}
