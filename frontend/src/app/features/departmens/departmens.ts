import { Component, inject } from '@angular/core';
import { DataService } from '../../services/data.service';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-departmens',
  imports: [JsonPipe],
  templateUrl: './departmens.html',
  styleUrl: './departmens.css',
})
export class Departmens {
  private dataService = inject(DataService);
  departmentsData = this.dataService.departments;
}
