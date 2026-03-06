import {
  Component,
  OnDestroy,
  Output,
  EventEmitter,
  signal,
  effect,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

import { CompetencyService } from '../../../../../core/services/data/competency.service';
import { TypeService } from '../../../../../core/services/data/type.service';
import { LevelService } from '../../../../../core/services/data/level.service';
import { TypeModel } from '../../../../../core/models/data/Type';
import { LevelModel } from '../../../../../core/models/data/Level';

@Component({
  selector: 'app-competencies-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form.html',
  styleUrl: './form.scss',
})
export class CompetenciesForm implements OnDestroy {
  @Output() close = new EventEmitter<void>();

  readonly competencyService = inject(CompetencyService);
  private readonly typeService = inject(TypeService);
  private readonly levelService = inject(LevelService);
  private readonly fb = inject(FormBuilder);

  readonly types = signal<TypeModel[]>([]);
  readonly levels = signal<LevelModel[]>([]);
  readonly submitting = signal(false);
  readonly isEditMode = signal(false);

  /** ID del item en edición, guardado localmente para evitar leer el signal en submit */
  private editingId: number | null = null;

  readonly form = this.fb.group({
    name:      ['', [Validators.required, Validators.maxLength(255)]],
    attribute: ['', [Validators.required, Validators.maxLength(255)]],
    weight:    [1,  [Validators.required, Validators.min(1), Validators.max(100)]],
    active:    [true],
    level_id:  [null as number | null],
    type_id:   [null as number | null],
  });

  constructor() {
    this.loadDropdowns();

    effect(() => {
      const editing = this.competencyService.editing();
      if (editing) {
        this.editingId = editing.id;
        this.isEditMode.set(true);
        this.form.patchValue({
          name:      editing.name,
          attribute: editing.attribute,
          weight:    editing.weight,
          active:    editing.active,
          level_id:  editing.level_id ?? null,
          type_id:   editing.type?.id ?? null,
        });
      } else {
        this.editingId = null;
        this.isEditMode.set(false);
        this.form.reset({ weight: 1, active: true, level_id: null, type_id: null });
      }
    });
  }

  ngOnDestroy(): void {
    this.competencyService.clearEditing();
  }

  private loadDropdowns(): void {
    this.typeService.getAll().subscribe((r) => this.types.set(r.data ?? []));
    this.levelService.getAll().subscribe((r) => this.levels.set(r.data ?? []));
  }

  submit(): void {
    if (this.form.invalid || this.submitting()) return;
    this.submitting.set(true);

    const v = this.form.value;
    const payload = {
      name:      v.name!,
      attribute: v.attribute!,
      weight:    Number(v.weight),
      active:    Boolean(v.active),
      level_id:  v.level_id ? Number(v.level_id) : null,
      type_id:   v.type_id  ? Number(v.type_id)  : null,
    };

    const request$ = this.editingId
      ? this.competencyService.update(this.editingId, payload)
      : this.competencyService.create(payload);

    request$.subscribe({
      next: () => {
        const wasEdit = !!this.editingId;
        this.submitting.set(false);
        this.editingId = null;
        this.isEditMode.set(false);
        this.form.reset({ weight: 1, active: true, level_id: null, type_id: null });
        this.competencyService.triggerRefresh();
        Swal.fire({
          icon: 'success',
          title: wasEdit ? 'Actualizada' : 'Creada',
          text: `Competencia ${wasEdit ? 'actualizada' : 'creada'} correctamente.`,
          timer: 1800,
          showConfirmButton: false,
        });
        this.closeForm();
      },
      error: (err) => {
        this.submitting.set(false);
        const msg = err?.error?.error?.message ?? 'Ha ocurrido un error inesperado.';
        Swal.fire({ icon: 'error', title: 'Error', text: msg });
      },
    });
  }

  closeForm(): void {
    this.competencyService.clearEditing();
    this.form.reset({ weight: 1, active: true, level_id: null, type_id: null });
    this.close.emit();
  }
}