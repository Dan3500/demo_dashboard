import {
  Component,
  OnDestroy,
  Output,
  EventEmitter,
  signal,
  effect,
  inject,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

import { LevelService } from '../../../../../core/services/data/level.service';
import { SpecialityService } from '../../../../../core/services/data/speciality.service';
import { SpecialityModel } from '../../../../../core/models/data/Speciality';

@Component({
  selector: 'app-levels-form',
  imports: [ReactiveFormsModule],
  templateUrl: './form.html',
  styleUrl: './form.scss',
})
export class LevelsForm implements OnDestroy {
  @Output() close = new EventEmitter<void>();

  readonly levelService = inject(LevelService);
  private readonly specialityService = inject(SpecialityService);
  private readonly fb = inject(FormBuilder);

  readonly submitting = signal(false);
  readonly isEditMode = signal(false);
  readonly specialities = signal<SpecialityModel[]>([]);
  private editingId: number | null = null;

  readonly form = this.fb.group({
    name:          ['', [Validators.required, Validators.maxLength(255)]],
    description:   ['', Validators.maxLength(500)],
    percentage:    [0, [Validators.required, Validators.min(0), Validators.max(100)]],
    speciality_id: [null as number | null],
  });

  constructor() {
    this.specialityService.getAll().subscribe((r) => this.specialities.set(r.data ?? []));

    effect(() => {
      const editing = this.levelService.editing();
      if (editing) {
        this.editingId = editing.id;
        this.isEditMode.set(true);
        this.form.patchValue({ name: editing.name, description: editing.description, percentage: editing.percentage, speciality_id: editing.speciality_id });
      } else {
        this.editingId = null;
        this.isEditMode.set(false);
        this.form.reset({ percentage: 0, speciality_id: null });
      }
    });
  }

  ngOnDestroy(): void {
    this.levelService.clearEditing();
  }

  submit(): void {
    if (this.form.invalid || this.submitting()) return;
    this.submitting.set(true);
    const v = this.form.value;
    const payload = {
      name:          v.name!,
      description:   v.description ?? '',
      percentage:    Number(v.percentage),
      speciality_id: v.speciality_id ? Number(v.speciality_id) : null,
    };
    const request$ = this.editingId
      ? this.levelService.update(this.editingId, payload)
      : this.levelService.create(payload);

    request$.subscribe({
      next: () => {
        const wasEdit = !!this.editingId;
        this.submitting.set(false);
        this.editingId = null;
        this.isEditMode.set(false);
        this.form.reset({ percentage: 0, speciality_id: null });
        this.levelService.triggerRefresh();
        Swal.fire({ icon: 'success', title: wasEdit ? 'Actualizado' : 'Creado', text: `Nivel ${wasEdit ? 'actualizado' : 'creado'} correctamente.`, timer: 1800, showConfirmButton: false });
        this.close.emit();
      },
      error: (err) => {
        this.submitting.set(false);
        Swal.fire({ icon: 'error', title: 'Error', text: err?.error?.error?.message ?? 'Ha ocurrido un error inesperado.' });
      },
    });
  }

  closeForm(): void {
    this.levelService.clearEditing();
    this.form.reset({ percentage: 0, speciality_id: null });
    this.close.emit();
  }
}
