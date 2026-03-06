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

import { PersonService } from '../../../../../core/services/data/person.service';
import { LevelService } from '../../../../../core/services/data/level.service';
import { LevelModel } from '../../../../../core/models/data/Level';

@Component({
  selector: 'app-people-form',
  imports: [ReactiveFormsModule],
  templateUrl: './form.html',
  styleUrl: './form.scss',
})
export class PeopleForm implements OnDestroy {
  @Output() close = new EventEmitter<void>();

  readonly personService = inject(PersonService);
  private readonly levelService = inject(LevelService);
  private readonly fb = inject(FormBuilder);

  readonly submitting = signal(false);
  readonly isEditMode = signal(false);
  readonly levels = signal<LevelModel[]>([]);
  readonly people = signal<{ id: number; name: string }[]>([]);
  editingId: number | null = null;

  readonly form = this.fb.group({
    name:      ['', [Validators.required, Validators.maxLength(255)]],
    evaluator: [null as number | null],
    active:    [true],
    level_id:  [null as number | null],
  });

  constructor() {
    this.levelService.getAll().subscribe((r) => this.levels.set(r.data ?? []));
    this.personService.getAll().subscribe((r) => this.people.set(r.data ?? []));

    effect(() => {
      const editing = this.personService.editing();
      if (editing) {
        this.editingId = editing.id;
        this.isEditMode.set(true);
        this.form.patchValue({ name: editing.name, evaluator: editing.evaluator || null, active: editing.active, level_id: editing.level_id });
      } else {
        this.editingId = null;
        this.isEditMode.set(false);
        this.form.reset({ evaluator: null, active: true, level_id: null });
      }
    });
  }

  ngOnDestroy(): void {
    this.personService.clearEditing();
  }

  submit(): void {
    if (this.form.invalid || this.submitting()) return;
    this.submitting.set(true);
    const v = this.form.value;
    const payload = {
      name:      v.name!,
      evaluator: v.evaluator ? Number(v.evaluator) : 0,
      active:    Boolean(v.active),
      level_id:  v.level_id ? Number(v.level_id) : null,
    };
    const request$ = this.editingId
      ? this.personService.update(this.editingId, payload)
      : this.personService.create(payload);

    request$.subscribe({
      next: () => {
        const wasEdit = !!this.editingId;
        this.submitting.set(false);
        this.editingId = null;
        this.isEditMode.set(false);
        this.form.reset({ evaluator: null, active: true, level_id: null });
        this.personService.triggerRefresh();
        Swal.fire({ icon: 'success', title: wasEdit ? 'Actualizada' : 'Creada', text: `Persona ${wasEdit ? 'actualizada' : 'creada'} correctamente.`, timer: 1800, showConfirmButton: false });
        this.close.emit();
      },
      error: (err) => {
        this.submitting.set(false);
        Swal.fire({ icon: 'error', title: 'Error', text: err?.error?.error?.message ?? 'Ha ocurrido un error inesperado.' });
      },
    });
  }

  closeForm(): void {
    this.personService.clearEditing();
    this.form.reset({ evaluator: null, active: true, level_id: null });
    this.close.emit();
  }
}
