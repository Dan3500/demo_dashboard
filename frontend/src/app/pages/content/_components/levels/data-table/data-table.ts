import {
  Component,
  Output,
  EventEmitter,
  OnInit,
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

import { LevelService } from '../../../../../core/services/data/level.service';
import { SpecialityService } from '../../../../../core/services/data/speciality.service';
import { LevelModel } from '../../../../../core/models/data/Level';
import { SpecialityModel } from '../../../../../core/models/data/Speciality';

@Component({
  selector: 'app-levels-data-table',
  imports: [
    CommonModule, FormsModule,
    MatTableModule, MatIconModule, MatSortModule, MatPaginatorModule,
  ],
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss',
})
export class LevelsDataTable implements OnInit, AfterViewInit {
  @Output() editRequested = new EventEmitter<void>();
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private readonly levelService = inject(LevelService);
  private readonly specialityService = inject(SpecialityService);

  readonly loading = signal(true);
  readonly specialities = signal<SpecialityModel[]>([]);
  readonly activeSpeciality = signal<number | null>(null);
  readonly openMenuId = signal<number | null>(null);
  readonly menuPosition = signal<{ top: number; right: number } | null>(null);

  readonly dataSource = new MatTableDataSource<LevelModel>([]);
  readonly displayedColumns = ['id', 'name', 'description', 'percentage', 'competency_count', 'speciality', 'actions'];

  private _searchText = '';

  constructor() {
    effect(() => {
      this.levelService.refreshTrigger();
      this.loadData();
    });
  }

  ngOnInit(): void {
    this.dataSource.filterPredicate = (row: LevelModel, filter: string) => {
      const f = JSON.parse(filter);
      const matchSpec = f.speciality === null || row.speciality_id === f.speciality;
      const matchSearch = !f.search ||
        row.name.toLowerCase().includes(f.search) ||
        (row.description ?? '').toLowerCase().includes(f.search);
      return matchSpec && matchSearch;
    };
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.dataSource.sortingDataAccessor = (row, col) => {
        if (col === 'speciality') return this.getSpecialityName(row.speciality_id);
        if (col === 'competency_count') return row.competency_count ?? 0;
        return (row as any)[col] ?? '';
      };
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    });
  }

  private loadData(): void {
    this.loading.set(true);
    let pending = 2;
    const done = () => { if (--pending === 0) this.loading.set(false); };
    this.specialityService.getAll().subscribe((r) => { this.specialities.set(r.data ?? []); done(); });
    this.levelService.getAll().subscribe((r) => {
      this.dataSource.data = r.data ?? [];
      this.applyCustomFilter();
      done();
    });
  }

  private applyCustomFilter(): void {
    this.dataSource.filter = JSON.stringify({
      speciality: this.activeSpeciality(),
      search: this._searchText,
    });
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  onSearch(event: Event): void {
    this._searchText = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.applyCustomFilter();
  }

  setSpecialityFilter(id: number | null): void {
    this.activeSpeciality.set(id);
    this.applyCustomFilter();
  }

  countBySpeciality(id: number | null): number {
    if (id === null) return this.dataSource.data.length;
    return this.dataSource.data.filter((r) => r.speciality_id === id).length;
  }

  getSpecialityName(id: number | null): string {
    if (!id) return '—';
    return this.specialities().find((s) => s.id === id)?.name ?? '—';
  }

  getSpecialityIndex(id: number | null): number {
    if (!id) return -1;
    const idx = this.specialities().findIndex((s) => s.id === id);
    return idx < 0 ? -1 : idx % 8;
  }

  edit(item: LevelModel): void {
    this.openMenuId.set(null);
    this.levelService.setEditing(item);
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

  async deleteItem(item: LevelModel): Promise<void> {
    this.openMenuId.set(null);
    const result = await Swal.fire({
      title: '¿Eliminar nivel?',
      html: `<b>${item.name}</b> será eliminado permanentemente.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;
    this.levelService.delete(item.id).subscribe({
      next: () => {
        this.levelService.triggerRefresh();
        Swal.fire({ icon: 'success', title: 'Eliminado', text: 'Nivel eliminado correctamente.', timer: 1800, showConfirmButton: false });
      },
      error: () => Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar el nivel.' }),
    });
  }
}
