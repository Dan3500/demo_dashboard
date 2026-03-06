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

import { CompetencyService } from '../../../../../core/services/data/competency.service';
import { TypeService } from '../../../../../core/services/data/type.service';
import { LevelService } from '../../../../../core/services/data/level.service';
import { SpecialityService } from '../../../../../core/services/data/speciality.service';
import { CompetencyModel } from '../../../../../core/models/data/Competency';
import { TypeModel } from '../../../../../core/models/data/Type';
import { LevelModel } from '../../../../../core/models/data/Level';
import { SpecialityModel } from '../../../../../core/models/data/Speciality';

@Component({
  selector: 'app-competencies-data-table',
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatIconModule,
    MatSortModule,
    MatPaginatorModule,
  ],
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss',
})
export class CompetenciesDataTable implements OnInit, AfterViewInit {
  @Output() editRequested = new EventEmitter<void>();
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private readonly competencyService = inject(CompetencyService);
  private readonly levelService = inject(LevelService);
  private readonly specialityService = inject(SpecialityService);

  readonly levels = signal<LevelModel[]>([]);
  readonly specialities = signal<SpecialityModel[]>([]);
  readonly typeList = signal<TypeModel[]>([]);
  readonly loading = signal(true);
  readonly activeType = signal<string>('all');
  readonly activeSpeciality = signal<number | null>(null);
  readonly openMenuId       = signal<number | null>(null);
  readonly menuPosition     = signal<{ top: number; right: number } | null>(null);

  readonly dataSource = new MatTableDataSource<CompetencyModel>([]);
  readonly displayedColumns = ['id', 'name', 'speciality', 'type', 'level', 'attribute', 'weight', 'active', 'actions'];

  constructor() {
    effect(() => {
      this.competencyService.refreshTrigger();
      this.loadData();
    });
  }

  ngOnInit(): void {
    this.dataSource.filterPredicate = (row: CompetencyModel, filter: string) => {
      const f = JSON.parse(filter);
      const matchType = f.type === 'all' || (row.type?.name ?? '') === f.type;
      const matchSpec = f.speciality === null || (() => {
        const level = this.levels().find((l) => l.id === row.level_id);
        return level?.speciality_id === f.speciality;
      })();
      const matchSearch = !f.search ||
        row.name.toLowerCase().includes(f.search) ||
        (row.attribute ?? '').toLowerCase().includes(f.search) ||
        (row.type?.name ?? '').toLowerCase().includes(f.search);
      return matchType && matchSpec && matchSearch;
    };
  }

  ngAfterViewInit(): void {
    // Diferimos un tick para que Angular Material inicialice sort y paginator
    // antes de vincularlos a la fuente de datos.
    setTimeout(() => {
      this.dataSource.sortingDataAccessor = (row: CompetencyModel, column: string): string | number => {
        switch (column) {
          case 'speciality': return this.getSpecialityName(row.level_id);
          case 'level':      return this.getLevelName(row.level_id);
          case 'type':       return row.type?.name ?? '';
          case 'active':     return row.active ? 1 : 0;
          default:           return (row as any)[column] ?? '';
        }
      };
      this.dataSource.sort      = this.sort;
      this.dataSource.paginator = this.paginator;
    });
  }

  private loadData(): void {
    this.loading.set(true);
    // Contador de peticiones pendientes: solo ocultamos el spinner cuando las tres han respondido.
    let pending = 3;
    const done = () => { if (--pending === 0) this.loading.set(false); };

    this.levelService.getAll().subscribe((r) => { this.levels.set(r.data ?? []); done(); });
    this.specialityService.getAll().subscribe((r) => { this.specialities.set(r.data ?? []); done(); });
    this.competencyService.getAll().subscribe((r) => {
      const items = r.data ?? [];
      this.dataSource.data = items;

      // Construimos la lista de tipos únicos preservando el orden de aparición.
      const seen  = new Set<string>();
      const types: TypeModel[] = [];
      for (const item of items) {
        if (item.type && !seen.has(item.type.name)) {
          seen.add(item.type.name);
          types.push(item.type);
        }
      }
      this.typeList.set(types);

      // Forzamos el filtro inicial para que filterPredicate siempre tenga el control,
      // ya que Angular Material lo omite cuando filter es cadena vacía.
      this.applyCustomFilter();
      done();
    });
  }

  private applyCustomFilter(): void {
    this.dataSource.filter = JSON.stringify({
      type: this.activeType(),
      speciality: this.activeSpeciality(),
      search: this._searchText,
    });
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  private _searchText = '';

  applyFilter(event: Event): void {
    this._searchText = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.applyCustomFilter();
  }

  setTypeFilter(typeName: string): void {
    this.activeType.set(typeName);
    this.applyCustomFilter();
  }

  setSpecialityFilter(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.activeSpeciality.set(val ? Number(val) : null);
    this.applyCustomFilter();
  }

  getLevelName(levelId: number | null): string {
    if (levelId === null) return '—';
    return this.levels().find((l) => l.id === levelId)?.name ?? '—';
  }

  getSpecialityName(levelId: number | null): string {
    if (levelId === null) return '—';
    const level = this.levels().find((l) => l.id === levelId);
    if (!level?.speciality_id) return '—';
    return this.specialities().find((s) => s.id === level.speciality_id)?.name ?? '—';
  }

  countByType(typeName: string): number {
    return this.dataSource.data.filter((c) => c.type?.name === typeName).length;
  }

  /** Índice cíclico (0-7) del tipo en la lista de tipos cargada, para la paleta de colores. */
  getTypeIndex(typeName: string): number {
    const idx = this.typeList().findIndex((t) => t.name === typeName);
    return idx < 0 ? 0 : idx % 8;
  }

  edit(item: CompetencyModel): void {
    this.openMenuId.set(null);
    this.menuPosition.set(null);
    this.competencyService.setEditing(item);
    this.editRequested.emit();
  }

  toggleMenu(id: number, event: MouseEvent): void {
    event.stopPropagation();
    if (this.openMenuId() === id) {
      this.openMenuId.set(null);
      this.menuPosition.set(null);
      return;
    }
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.menuPosition.set({
      top:   rect.bottom + 4,
      right: window.innerWidth - rect.right,
    });
    this.openMenuId.set(id);
  }

  @HostListener('document:click')
  closeMenus(): void {
    this.openMenuId.set(null);
    this.menuPosition.set(null);
  }

  toggleActive(item: CompetencyModel): void {
    const newValue = !item.active;
    // Actualización optimista
    item.active = newValue;
    this.dataSource.data = [...this.dataSource.data];

    this.competencyService.update(item.id, { active: newValue }).subscribe({
      error: () => {
        // Revertir si falla
        item.active = !newValue;
        this.dataSource.data = [...this.dataSource.data];
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo actualizar el estado.' });
      },
    });
  }

  async deleteItem(item: CompetencyModel): Promise<void> {
    this.openMenuId.set(null);
    this.menuPosition.set(null);
    const result = await Swal.fire({
      title: '¿Eliminar competencia?',
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

    this.competencyService.delete(item.id).subscribe({
      next: () => {
        this.competencyService.triggerRefresh();
        Swal.fire({ icon: 'success', title: 'Eliminada', text: 'Competencia eliminada correctamente.', timer: 1800, showConfirmButton: false });
      },
      error: () => Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar la competencia.' }),
    });
  }
}
