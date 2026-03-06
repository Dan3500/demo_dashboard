import {
  Component,
  Output,
  EventEmitter,
  signal,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

import { Modal } from '../../../../../shared/modal/modal';
import { TypeService } from '../../../../../core/services/data/type.service';
import { CompetencyService } from '../../../../../core/services/data/competency.service';
import { TypeModel } from '../../../../../core/models/data/Type';
import { CompetencyModel } from '../../../../../core/models/data/Competency';

@Component({
  selector: 'app-type-form',
  imports: [CommonModule, FormsModule, Modal],
  templateUrl: './type-form.html',
  styleUrl: './type-form.scss',
})
export class TypeForm {
  @Output() close = new EventEmitter<void>();

  private readonly typeService       = inject(TypeService);
  private readonly competencyService = inject(CompetencyService);

  readonly types        = signal<TypeModel[]>([]);
  readonly competencies = signal<CompetencyModel[]>([]);
  readonly editing      = signal<TypeModel | null>(null);
  readonly editingName  = signal('');
  readonly newName      = signal('');
  readonly submitting   = signal(false);

  constructor() {
    this.load();
  }

  load(): void {
    this.typeService.getAll().subscribe((r) => this.types.set(r.data ?? []));
    this.competencyService.getAll().subscribe((r) => this.competencies.set(r.data ?? []));
  }

  startEdit(type: TypeModel): void {
    this.editing.set(type);
    this.editingName.set(type.name);
  }

  cancelEdit(): void {
    this.editing.set(null);
    this.editingName.set('');
  }

  saveEdit(): void {
    const name = this.editingName().trim();
    const editing = this.editing();
    if (!name || !editing || this.submitting()) return;
    this.submitting.set(true);
    this.typeService.update(editing.id, { name }).subscribe({
      next: () => { this.submitting.set(false); this.cancelEdit(); this.load(); },
      error: (err) => {
        this.submitting.set(false);
        Swal.fire({ icon: 'error', title: 'Error', text: err?.error?.error?.message ?? 'Ha ocurrido un error.' });
      },
    });
  }

  saveNew(): void {
    const name = this.newName().trim();
    if (!name || this.submitting()) return;
    this.submitting.set(true);
    this.typeService.create({ name }).subscribe({
      next: () => { this.submitting.set(false); this.newName.set(''); this.load(); },
      error: (err) => {
        this.submitting.set(false);
        Swal.fire({ icon: 'error', title: 'Error', text: err?.error?.error?.message ?? 'Ha ocurrido un error.' });
      },
    });
  }

  confirmDelete(type: TypeModel): void {
    // Comprobar si alguna competencia usa este tipo antes de permitir el borrado
    const usedBy = this.competencies().filter((c) => c.type?.id === type.id);
    if (usedBy.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Tipo en uso',
        html: `El tipo <b>${type.name}</b> está asignado a ${usedBy.length} competencia${usedBy.length > 1 ? 's' : ''}.<br>Desasócialo de las competencias antes de eliminarlo.`,
      });
      return;
    }

    Swal.fire({
      icon: 'warning',
      title: '¿Eliminar tipo?',
      text: `Se eliminará "${type.name}". Esta acción no se puede deshacer.`,
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
    }).then((result) => {
      if (!result.isConfirmed) return;
      this.typeService.delete(type.id).subscribe({
        next: () => this.load(),
        error: (err) => {
          const msg = err?.error?.error?.message ?? 'No se pudo eliminar.';
          Swal.fire({ icon: 'error', title: 'Error', text: msg });
        },
      });
    });
  }

  dismiss(): void {
    this.close.emit();
  }

}

