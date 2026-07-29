import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
  FormArray,
  FormGroup,
} from '@angular/forms';
import { MetabolicButtonComponent } from '../../shared/components/metabolic-button/metabolic-button.component';
import { MetabolicCardComponent } from '../../shared/components/metabolic-card/metabolic-card.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';
import { ProtocolsService } from '../../shared/services/domain.services';
import { ProfileStore } from '../../shared/services/profile.store';
import { AuthService } from '../../shared/services/auth.service';
import {
  ExerciseModuleWrite,
  ProtocolRead,
  ProtocolWrite,
} from '../../shared/models/domain.models';
import {
  MUSCLE_GROUPS,
  PROTOCOL_STATUSES,
  STIMULUS_TYPES,
  ProtocolStatus,
  StimulusType,
} from '../../shared/constants/domain.constants';
import { PaginationService } from '../../shared/services/pagination.service';
import { ToastService } from '../../shared/components/toast/toast.service';

@Component({
  selector: 'metabolic-protocols',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MetabolicButtonComponent,
    MetabolicCardComponent,
    StatusBadgeComponent,
    SkeletonLoaderComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page">
      <header class="heading">
        <div>
          <p class="eyebrow">{{ profileStore.alias() }} // PROTOCOL_LIBRARY</p>
          <h1>PROTOCOLOS_OPERATIVOS</h1>
          <p>Gestión de rutinas tácticas y optimización de sistemas biológicos.</p>
        </div>
        <button metabolicButton type="button" (click)="toggleCreator()">
          {{ creator() ? 'CANCELAR' : '+ NUEVO_PROTOCOLO' }}
        </button>
      </header>

      @if (error()) {
        <p class="api-error" role="alert">{{ error() }}</p>
      }

      @if (creator()) {
        <metabolic-card accent="rose">
          <form [formGroup]="protocolForm" (ngSubmit)="saveProtocol()" class="creator">
            <p class="eyebrow">NEW_PROTOCOL.sh</p>

            <div class="form-row">
              <label>
                <span>Designación</span>
                <input formControlName="name" placeholder="EJ. PROTOCOLO_OMEGA" />
              </label>

              <label>
                <span>Tipo de Estímulo</span>
                <select formControlName="stimulus_type">
                  @for (type of stimulusTypes; track type) {
                    <option [value]="type">{{ type }}</option>
                  }
                </select>
              </label>

              <label>
                <span>Estado</span>
                <select formControlName="status">
                  @for (status of statuses; track status) {
                    <option [value]="status">{{ status }}</option>
                  }
                </select>
              </label>
            </div>

            <div class="form-row">
              <label>
                <span>Duración Estimada (min)</span>
                <input type="number" formControlName="estimated_duration_min" />
              </label>
              <label>
                <span>Carga Metabólica (kcal)</span>
                <input type="number" formControlName="metabolic_load_kcal" />
              </label>
            </div>

            <div class="modules">
              <p class="eyebrow">MODULOS_ANIDADOS</p>
              @for (module of modules.controls; track $index; let i = $index) {
                <div class="module-row" [formGroup]="asModule(module)">
                  <input formControlName="name" placeholder="NOMBRE_EJERCICIO" />
                  <select formControlName="muscle_group">
                    @for (group of muscleGroups; track group) {
                      <option [value]="group">{{ group }}</option>
                    }
                  </select>
                  <input type="number" formControlName="sets" placeholder="SETS" />
                  <input type="number" formControlName="reps" placeholder="REPS" />
                  <input type="number" formControlName="target_weight_kg" placeholder="KG" />
                  <button metabolicButton variant="danger" type="button" (click)="removeModule(i)">
                    <span class="material-symbols-outlined">delete</span>
                  </button>
                </div>
              }
              <button metabolicButton variant="outline" type="button" (click)="addModule()">
                + AGREGAR MODULO
              </button>
            </div>

            <button metabolicButton type="submit" [disabled]="saving()" [loading]="saving()">
              {{ saving() ? 'COMPILANDO...' : 'COMPILAR_PROTOCOLO' }}
            </button>
          </form>
        </metabolic-card>
      }

      @if (loading()) {
        <metabolic-card accent="cyan">
          <metabolic-skeleton [rows]="4" />
        </metabolic-card>
      } @else {
        <div class="protocol-grid">
          @for (protocol of protocols(); track protocol.id) {
            <metabolic-card>
              <div class="card-top">
                <status-badge
                  [label]="protocol.status"
                  [tone]="protocol.status === 'ALPHA' ? 'rose' : 'cyan'" />
                <span class="eyebrow">{{ protocol.id }}</span>
              </div>
              <h2>{{ protocol.name }}</h2>
              <div class="data-grid">
                <span>MÓDULOS <b>{{ protocol.module_count }}</b></span>
                <span>DURACIÓN <b>{{ protocol.estimated_duration_min }} MIN</b></span>
                <span>CARGA <b>{{ protocol.metabolic_load_kcal ?? 0 }} KCAL</b></span>
              </div>
              <div class="card-actions">
                <button
                  metabolicButton
                  variant="outline"
                  type="button"
                  (click)="editProtocol(protocol)">
                  EDITAR
                </button>
                <button
                  metabolicButton
                  variant="danger"
                  type="button"
                  (click)="deleteProtocol(protocol.id)">
                  BORRAR
                </button>
              </div>
            </metabolic-card>
          } @empty {
            <p class="empty-text">NO HAY PROTOCOLOS REGISTRADOS.</p>
          }
        </div>
      }

      @if (pagination().hasNext || pagination().hasPrevious) {
        <div class="pagination">
          <button
            metabolicButton
            variant="outline"
            type="button"
            [disabled]="!pagination().hasPrevious"
            (click)="changePage(pagination().page - 1)">
            ← PREV
          </button>
          <span>PAG {{ pagination().page }} / {{ pagination().totalPages }}</span>
          <button
            metabolicButton
            variant="outline"
            type="button"
            [disabled]="!pagination().hasNext"
            (click)="changePage(pagination().page + 1)">
            NEXT →
          </button>
        </div>
      }
    </section>
  `,
  styles: [`
    :host { display: block; }

    .page { display: grid; gap: 24px; }

    .heading {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 20px;
    }

    .eyebrow {
      margin: 0;
      color: var(--metabolic-primary);
      font: 700 10px var(--metabolic-font-data);
      letter-spacing: 0.15em;
    }

    .heading h1 {
      margin: 10px 0;
      color: var(--metabolic-text);
      font: 600 clamp(1.6rem, 4vw, 2.4rem) var(--metabolic-font-display);
      letter-spacing: 0.04em;
    }

    .heading p:not(.eyebrow) {
      margin: 0;
      color: var(--metabolic-text-muted);
      font: 14px/1.6 var(--metabolic-font-data);
    }

    .api-error {
      margin: 0;
      padding: 12px;
      border-left: 3px solid var(--metabolic-secondary);
      background: rgba(181, 0, 54, 0.12);
      color: var(--metabolic-secondary);
      font: 12px var(--metabolic-font-data);
    }

    .creator {
      display: grid;
      gap: 20px;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
    }

    .creator label {
      display: grid;
      gap: 6px;
      color: var(--metabolic-primary);
      font: 700 10px var(--metabolic-font-data);
      letter-spacing: 0.1em;
    }

    .creator input,
    .creator select {
      padding: 12px;
      background: var(--metabolic-surface-dark);
      border: 1px solid var(--metabolic-grid-line);
      border-bottom: 2px solid var(--metabolic-outline-variant);
      color: var(--metabolic-text);
      font: 14px var(--metabolic-font-data);
    }

    .creator input:focus,
    .creator select:focus {
      border-color: var(--metabolic-primary);
      outline: none;
    }

    .modules {
      display: grid;
      gap: 12px;
    }

    .module-row {
      display: grid;
      grid-template-columns: 2fr 1fr 80px 80px 80px auto;
      gap: 8px;
      align-items: center;
    }

    @media (max-width: 900px) {
      .module-row { grid-template-columns: 1fr 1fr; }
    }

    .protocol-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 18px;
    }

    @media (max-width: 1100px) {
      .protocol-grid { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 700px) {
      .protocol-grid { grid-template-columns: 1fr; }
    }

    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .protocol-grid h2 {
      margin: 0 0 12px;
      color: var(--metabolic-text);
      font: 600 1.2rem var(--metabolic-font-heading);
      text-transform: uppercase;
    }

    .data-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--metabolic-grid-line);
    }

    .data-grid span {
      display: grid;
      gap: 4px;
      color: var(--metabolic-text-muted);
      font: 10px var(--metabolic-font-data);
    }

    .data-grid b {
      color: var(--metabolic-text);
      font: 14px var(--metabolic-font-data);
    }

    .card-actions {
      display: flex;
      gap: 12px;
    }

    .empty-text,
    .pagination span {
      color: var(--metabolic-text-muted);
      font: 12px var(--metabolic-font-data);
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 16px;
    }
  `]
})
export class ProtocolsComponent implements OnInit {
  private readonly protocolsService = inject(ProtocolsService);
  private readonly paginationService = inject(PaginationService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly toast = inject(ToastService);
  readonly profileStore = inject(ProfileStore);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly protocols = signal<ProtocolRead[]>([]);
  readonly creator = signal(false);
  readonly editingId = signal<string | null>(null);

  readonly pagination = signal({
    page: 1,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
  });

  readonly stimulusTypes = STIMULUS_TYPES;
  readonly statuses = PROTOCOL_STATUSES;
  readonly muscleGroups = MUSCLE_GROUPS;

  readonly protocolForm = this.fb.group({
    name: ['', Validators.required],
    stimulus_type: ['HIPERTROFIA' as StimulusType, Validators.required],
    status: ['BETA' as ProtocolStatus, Validators.required],
    estimated_duration_min: [45, [Validators.required, Validators.min(1)]],
    metabolic_load_kcal: [null as number | null],
    modules: this.fb.array<FormGroup>([]),
  });

  get modules(): FormArray {
    return this.protocolForm.get('modules') as FormArray;
  }

  asModule(control: unknown): FormGroup {
    return control as FormGroup;
  }

  ngOnInit(): void {
    this.loadProtocols();
  }

  loadProtocols(page = 1): void {
    this.loading.set(true);
    this.error.set('');
    this.protocolsService.list(page).subscribe({
      next: response => {
        this.protocols.set(response.results);
        this.pagination.set({
          page,
          totalPages: this.paginationService.totalPages(response),
          hasNext: this.paginationService.hasNext(response),
          hasPrevious: this.paginationService.hasPrevious(response),
        });
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.error.set(AuthService.extractErrorMessage(err));
      },
    });
  }

  changePage(page: number): void {
    this.loadProtocols(page);
  }

  toggleCreator(): void {
    this.creator.update(v => !v);
    if (!this.creator()) {
      this.editingId.set(null);
      this.protocolForm.reset();
      this.modules.clear();
    }
  }

  addModule(module?: Partial<ExerciseModuleWrite>): void {
    const order = this.modules.length + 1;
    const group = this.fb.group({
      name: [module?.name ?? '', Validators.required],
      muscle_group: [module?.muscle_group ?? 'PUSH', Validators.required],
      order: [module?.order ?? order],
      sets: [module?.sets ?? 3, [Validators.required, Validators.min(1), Validators.max(20)]],
      reps: [module?.reps ?? 10, [Validators.required, Validators.min(1), Validators.max(100)]],
      target_weight_kg: [module?.target_weight_kg ?? 0, Validators.required],
    });
    this.modules.push(group);
  }

  removeModule(index: number): void {
    this.modules.removeAt(index);
  }

  editProtocol(protocol: ProtocolRead): void {
    this.editingId.set(protocol.id);
    this.protocolForm.patchValue({
      name: protocol.name,
      stimulus_type: protocol.stimulus_type,
      status: protocol.status,
      estimated_duration_min: protocol.estimated_duration_min,
      metabolic_load_kcal: protocol.metabolic_load_kcal,
    });
    this.modules.clear();
    protocol.modules.forEach(m => this.addModule(m));
    this.creator.set(true);
  }

  saveProtocol(): void {
    if (this.protocolForm.invalid) {
      this.protocolForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set('');

    const raw = this.protocolForm.getRawValue();
    const moduleValues = raw.modules as ExerciseModuleWrite[];
    const payload: ProtocolWrite = {
      name: raw.name,
      stimulus_type: raw.stimulus_type as StimulusType,
      status: raw.status as ProtocolStatus,
      estimated_duration_min: raw.estimated_duration_min,
      metabolic_load_kcal: raw.metabolic_load_kcal,
      modules: moduleValues.map((m, index) => ({ ...m, order: index + 1 })),
    };

    const request = this.editingId()
      ? this.protocolsService.update(this.editingId()!, payload)
      : this.protocolsService.create(payload);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.creator.set(false);
        this.editingId.set(null);
        this.protocolForm.reset();
        this.modules.clear();
        this.toast.success('Protocolo compilado y sincronizado correctamente.');
        this.loadProtocols(this.pagination().page);
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.error.set(AuthService.extractErrorMessage(err));
      },
    });
  }

  deleteProtocol(id: string): void {
    if (!confirm('¿CONFIRMAR BORRADO DEL PROTOCOLO?')) return;
    this.protocolsService.delete(id).subscribe({
      next: () => this.loadProtocols(this.pagination().page),
      error: (err: unknown) => this.error.set(AuthService.extractErrorMessage(err)),
    });
  }
}
