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

import { PersonService } from '../../../../../core/services/data/person.service';
import { LevelService } from '../../../../../core/services/data/level.service';
import { SpecialityService } from '../../../../../core/services/data/speciality.service';
import { PersonModel } from '../../../../../core/models/data/Person';
import { LevelModel } from '../../../../../core/models/data/Level';
import { SpecialityModel } from '../../../../../core/models/data/Speciality';

@Component({
  selector: 'app-people-data-table',
  imports: [
    CommonModule, FormsModule,
    MatTableModule, MatIconModule, MatSortModule, MatPaginatorModule,
  ],
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss',
})
export class PeopleDataTable implements OnInit, AfterViewInit {
  @Output() editRequested = new EventEmitter<void>();
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private readonly personService = inject(PersonService);
  private readonly levelService = inject(LevelService);
  private readonly specialityService = inject(SpecialityService);

  readonly loading = signal(true);
  readonly levels = signal<LevelModel[]>([]);
  readonly specialities = signal<SpecialityModel[]>([]);
  readonly people = signal<PersonModel[]>([]);
  readonly activeSpeciality = signal<number | null>(null);
  readonly openMenuId = signal<number | null>(null);
  readonly menuPosition = signal<{ top: number; right: number } | null>(null);

  readonly dataSource = new MatTableDataSource<PersonModel>([]);
  readonly displayedColumns = ['id', 'name', 'evaluator', 'level', 'level_pct', 'speciality', 'active', 'actions'];

  private _searchText = '';

  constructor() {
    effect(() => {
      this.personService.refreshTrigger();
      this.loadData();
    });
  }

  ngOnInit(): void {
    this.dataSource.filterPredicate = (row: PersonModel, filter: string) => {
      const f = JSON.parse(filter);
      const matchSpec = f.speciality === null || (() => {
        const level = this.levels().find((l) => l.id === row.level_id);
        return level?.speciality_id === f.speciality;
      })();
      const matchSearch = !f.search || row.name.toLowerCase().includes(f.search);
      return matchSpec && matchSearch;
    };
  }

  ngAfterViewInit(): void {
    // Diferimos un tick para que Angular Material inicialice sort y paginator
    // antes de vincularlos a la fuente de datos.
    setTimeout(() => {
      this.dataSource.sortingDataAccessor = (row, col) => {
        if (col === 'level') return this.getLevelName(row.level_id);
        if (col === 'level_pct') return this.getLevelPercentage(row.level_id);
        if (col === 'speciality') return this.getSpecialityName(row.level_id);
        if (col === 'evaluator') return this.getEvaluatorName(row.evaluator);
        if (col === 'active') return row.active ? 1 : 0;
        return (row as any)[col] ?? '';
      };
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    });
  }

  private loadData(): void {
    this.loading.set(true);
    // Contador de peticiones pendientes: solo ocultamos el spinner cuando las tres han respondido.
    let pending = 3;
    const done = () => { if (--pending === 0) this.loading.set(false); };
    this.specialityService.getAll().subscribe((r) => { this.specialities.set(r.data ?? []); done(); });
    this.levelService.getAll().subscribe((r) => { this.levels.set(r.data ?? []); done(); });
    this.personService.getAll().subscribe((r) => {
      const data = r.data ?? [];
      this.people.set(data);
      this.dataSource.data = data;
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
    return this.dataSource.data.filter((r) => {
      const level = this.levels().find((l) => l.id === r.level_id);
      return level?.speciality_id === id;
    }).length;
  }

  getLevelName(id: number | null): string {
    if (!id) return '—';
    return this.levels().find((l) => l.id === id)?.name ?? '—';
  }

  getLevelPercentage(id: number | null): number {
    if (!id) return 0;
    return this.levels().find((l) => l.id === id)?.percentage ?? 0;
  }

  getSpecialityName(levelId: number | null): string {
    if (!levelId) return '—';
    const specId = this.levels().find((l) => l.id === levelId)?.speciality_id ?? null;
    if (!specId) return '—';
    return this.specialities().find((s) => s.id === specId)?.name ?? '—';
  }

  getSpecialityIndex(specId: number | null): number {
    if (!specId) return -1;
    const idx = this.specialities().findIndex((s) => s.id === specId);
    return idx < 0 ? -1 : idx % 8;
  }

  getSpecialityIndexByLevelId(levelId: number | null): number {
    if (!levelId) return -1;
    const specId = this.levels().find((l) => l.id === levelId)?.speciality_id ?? null;
    return this.getSpecialityIndex(specId);
  }

  getEvaluatorName(id: number | null): string {
    if (!id) return '—';
    return this.people().find((p) => p.id === id)?.name ?? `#${id}`;
  }

  toggleActive(item: PersonModel): void {
    const newValue = !item.active;
    item.active = newValue;
    this.dataSource.data = [...this.dataSource.data];
    this.personService.update(item.id, { active: newValue }).subscribe({
      error: () => {
        item.active = !newValue;
        this.dataSource.data = [...this.dataSource.data];
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo actualizar el estado.' });
      },
    });
  }

  edit(item: PersonModel): void {
    this.openMenuId.set(null);
    this.personService.setEditing(item);
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

  async deleteItem(item: PersonModel): Promise<void> {
    this.openMenuId.set(null);
    const result = await Swal.fire({
      title: '¿Eliminar persona?',
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
    this.personService.delete(item.id).subscribe({
      next: () => {
        this.personService.triggerRefresh();
        Swal.fire({ icon: 'success', title: 'Eliminada', text: 'Persona eliminada correctamente.', timer: 1800, showConfirmButton: false });
      },
      error: () => Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar la persona.' }),
    });
  }
}
