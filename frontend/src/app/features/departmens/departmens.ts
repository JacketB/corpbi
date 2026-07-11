import { Component, computed, inject } from '@angular/core';
import { DataService } from '../../services/data.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-departmens',
  imports: [CommonModule],
  templateUrl: './departmens.html',
  styleUrl: './departmens.css',
})
export class Departmens {
  private dataService = inject(DataService);
  departmentsDataResource = this.dataService.departments;

  departmentsData = computed(() => this.departmentsDataResource.value() ?? [])
}
