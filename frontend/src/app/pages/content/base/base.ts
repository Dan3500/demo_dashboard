import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Navbar } from '../../../shared/navbar/navbar';
import { Modal } from '../../../shared/modal/modal';
import { SpecialitiesDataTable } from '../_components/specialities/data-table/data-table';
import { SpecialitiesForm } from '../_components/specialities/form/form';
import { LevelsDataTable } from '../_components/levels/data-table/data-table';
import { LevelsForm } from '../_components/levels/form/form';
import { CompetenciesDataTable } from '../_components/competencies/data-table/data-table';
import { CompetenciesForm } from '../_components/competencies/form/form';
import { TypeForm } from '../_components/competencies/type-form/type-form';
import { PeopleDataTable } from '../_components/people/data-table/data-table';
import { PeopleForm } from '../_components/people/form/form';


export interface PageConfig {
  entity: string;
  title: string;
  description: string;
  actionLabel?: string;
}

@Component({
  selector: 'app-base',
  imports: [
    Navbar, Modal,
    SpecialitiesDataTable, SpecialitiesForm,
    LevelsDataTable, LevelsForm,
    CompetenciesDataTable, CompetenciesForm,
    PeopleDataTable, PeopleForm,
    MatIconModule, TypeForm,
  ],
  templateUrl: './base.html',
  styleUrl: './base.scss',
})
export class Base implements OnInit {
  config!: PageConfig;
  modalOpen = false;
  typeManagerOpen = false;

  constructor(private readonly route: ActivatedRoute) {}

  ngOnInit(): void {
    this.config = this.route.snapshot.data as PageConfig;
  }

  openModal(): void {
    this.modalOpen = true;
  }

  closeModal(): void {
    this.modalOpen = false;
  }

  openTypeManager(): void {
    this.typeManagerOpen = true;
  }

  closeTypeManager(): void {
    this.typeManagerOpen = false;
  }
}
