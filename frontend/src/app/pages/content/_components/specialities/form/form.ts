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

import { SpecialityService } from '../../../../../core/services/data/speciality.service';

@Component({
  selector: 'app-specialities-form',
  imports: [ReactiveFormsModule],
  templateUrl: './form.html',
  styleUrl: './form.scss',
})
export class SpecialitiesForm implements OnDestroy {
  @Output() close = new EventEmitter<void>();

  readonly specialityService = inject(SpecialityService);
  private readonly fb = inject(FormBuilder);

  readonly submitting = signal(false);
  readonly isEditMode = signal(false);
  private editingId: number | null = null;

  readonly form = this.fb.group({
    name:        ['', [Validators.required, Validators.maxLength(255)]],
    description: ['', Validators.maxLength(500)],
    active:      [true],
  });

  constructor() {
    effect(() => {
      const editing = this.specialityService.editing();
      if (editing) {
        this.editingId = editing.id;
        this.isEditMode.set(true);
        this.form.patchValue({ name: editing.name, description: editing.description, active: editing.active });
      } else {
        this.editingId = null;
        this.isEditMode.set(false);
        this.form.reset({ active: true });
      }
    });
  }

  ngOnDestroy(): void {
    this.specialityService.clearEditing();
  }

  submit(): void {
    if (this.form.invalid || this.submitting()) return;
    this.submitting.set(true);
    const v = this.form.value;
    const payload = { name: v.name!, description: v.description ?? '', active: Boolean(v.active) };
    const request$ = this.editingId
      ? this.specialityService.update(this.editingId, payload)
      : this.specialityService.create(payload);

    request$.subscribe({
      next: () => {
        const wasEdit = !!this.editingId;
        this.submitting.set(false);
        this.editingId = null;
        this.isEditMode.set(false);
        this.form.reset({ active: true });
        this.specialityService.triggerRefresh();
        Swal.fire({ icon: 'success', title: wasEdit ? 'Actualizada' : 'Creada', text: `Especialidad ${wasEdit ? 'actualizada' : 'creada'} correctamente.`, timer: 1800, showConfirmButton: false });
        this.close.emit();
      },
      error: (err) => {
        this.submitting.set(false);
        Swal.fire({ icon: 'error', title: 'Error', text: err?.error?.error?.message ?? 'Ha ocurrido un error inesperado.' });
      },
    });
  }

  closeForm(): void {
    this.specialityService.clearEditing();
    this.form.reset({ active: true });
    this.close.emit();
  }
}
