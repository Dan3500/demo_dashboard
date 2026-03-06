import {
  Component,
  Output,
  EventEmitter,
  AfterViewInit,
  ViewChild,
  HostListener,
  signal,
  effect,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import Swal from 'sweetalert2';

import { SpecialityService } from '../../../../../core/services/data/speciality.service';
import { SpecialityModel } from '../../../../../core/models/data/Speciality';

@Component({
  selector: 'app-specialities-data-table',
  imports: [
    CommonModule, FormsModule,
    MatTableModule, MatIconModule, MatSortModule, MatPaginatorModule,
  ],
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss',
})
export class SpecialitiesDataTable implements AfterViewInit {
  @Output() editRequested = new EventEmitter<void>();
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private readonly specialityService = inject(SpecialityService);

  readonly loading = signal(true);
  readonly openMenuId = signal<number | null>(null);
  readonly menuPosition = signal<{ top: number; right: number } | null>(null);

  readonly dataSource = new MatTableDataSource<SpecialityModel>([]);
  readonly displayedColumns = ['id', 'name', 'description', 'level_count', 'person_count', 'competency_count', 'active', 'actions'];

  private _searchText = '';

  constructor() {
    effect(() => {
      this.specialityService.refreshTrigger();
      this.loadData();
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    });
  }

  private loadData(): void {
    this.loading.set(true);
    this.specialityService.getAll().subscribe((r) => {
      this.dataSource.data = r.data ?? [];
      this.applyFilter();
      this.loading.set(false);
    });
  }

  private applyFilter(): void {
    this.dataSource.filter = this._searchText;
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  onSearch(event: Event): void {
    this._searchText = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filterPredicate = (row, f) =>
      row.name.toLowerCase().includes(f) || (row.description ?? '').toLowerCase().includes(f);
    this.applyFilter();
  }

  getSpecialityIndex(id: number | null): number {
    if (!id) return -1;
    const idx = this.dataSource.data.findIndex((s) => s.id === id);
    return idx < 0 ? -1 : idx % 8;
  }

  toggleActive(item: SpecialityModel): void {
    const newValue = !item.active;
    item.active = newValue;
    this.dataSource.data = [...this.dataSource.data];
    this.specialityService.update(item.id, { active: newValue }).subscribe({
      error: () => {
        item.active = !newValue;
        this.dataSource.data = [...this.dataSource.data];
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo actualizar el estado.' });
      },
    });
  }

  edit(item: SpecialityModel): void {
    this.openMenuId.set(null);
    this.specialityService.setEditing(item);
    this.editRequested.emit();
  }

  toggleMenu(id: number, event: MouseEvent): void {
    event.stopPropagation();
    if (this.openMenuId() === id) { this.openMenuId.set(null); this.menuPosition.set(null); return; }
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.menuPosition.set({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    this.openMenuId.set(id);
  }

  @HostListener('document:click')
  closeMenus(): void {
    this.openMenuId.set(null);
    this.menuPosition.set(null);
  }

  async deleteItem(item: SpecialityModel): Promise<void> {
    this.openMenuId.set(null);
    const result = await Swal.fire({
      title: '¿Eliminar especialidad?',
      html: `<b>${item.name}</b> será eliminada permanentemente.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;
    this.specialityService.delete(item.id).subscribe({
      next: () => {
        this.specialityService.triggerRefresh();
        Swal.fire({ icon: 'success', title: 'Eliminada', text: 'Especialidad eliminada correctamente.', timer: 1800, showConfirmButton: false });
      },
      error: () => Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar la especialidad.' }),
    });
  }
}
