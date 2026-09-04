import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  Observable,
  catchError,
  combineLatest,
  finalize,
  map,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { BaseApiService } from '../../../../core/services/base-api.service';
import { AdminService } from '../../../../shared/admin/service/admin.service';
import {
  CoachingOverviewData,
  CoachingStrategyCatalogItem,
} from '../model/coaching-api.interface';
import { CoachingViewModel } from '../model/coaching-view-model.interface';

@Injectable({ providedIn: 'root' })
export class CoachingService extends BaseApiService {
  private readonly adminService = inject(AdminService);

  private readonly pageState: CoachingViewModel = {
    lang: 'es',
    loading: false,
    savingStrategy: false,
    savingFormation: false,
    savingResetDefault: false,
    errorMessage: '',
    selectedTeamLabel: 'ARG',
    coach: null,
    strategy: null,
    formation: null,
    stats: null,
    strategies: [],
    formations: [],
    selectedStrategy: '',
    selectedFormation: '',
    selectedStrategyDescription: '',
    compatibleFormations: [],
    compatibleStrategies: [],
    baseRatings: [],
    effectiveRatings: [],
    ratingDeltas: [],
    strategyPenalty: 0,
    isSelectedFormationCompatible: true,
    tacticalStatusTone: 'original',
    tacticalStatusLabelKey: 'original',
  };

  private hasInitialized = false;

  getViewModel(): CoachingViewModel {
    return this.pageState;
  }

  initialize(): void {
    if (this.hasInitialized) {
      this.loadCoachingOverview().subscribe();
      return;
    }

    this.hasInitialized = true;
    this.pageState.lang = this.getCurrentLang();
    this.pageState.selectedTeamLabel = this.adminService.getCurrentTeam()?.name ?? 'ARG';

    this.adminService.currentTeam$.subscribe((team) => {
      this.pageState.selectedTeamLabel = team?.name ?? 'ARG';
    });

    combineLatest([this.appContextService.currentTeamId$, this.appContextService.lang$])
      .pipe(
        tap(([, lang]) => (this.pageState.lang = lang === 'en' ? 'en' : 'es')),
        switchMap(() => this.loadCoachingOverview()),
      )
      .subscribe();
  }

  changeStrategy(strategy: string): void {
    this.pageState.savingStrategy = true;

    this.post<unknown>('/my-team/coaching/strategy', { strategy })
      .pipe(
        switchMap(() => this.loadCoachingOverview()),
        catchError((error: HttpErrorResponse) => {
          this.pageState.errorMessage = this.getSaveErrorMessage(error);
          return of(undefined);
        }),
        finalize(() => (this.pageState.savingStrategy = false)),
      )
      .subscribe();
  }

  changeFormation(formation: string): void {
    this.pageState.savingFormation = true;

    this.post<unknown>('/my-team/coaching/formation', { formation })
      .pipe(
        switchMap(() => this.loadCoachingOverview()),
        catchError((error: HttpErrorResponse) => {
          this.pageState.errorMessage = this.getSaveErrorMessage(error);
          return of(undefined);
        }),
        finalize(() => (this.pageState.savingFormation = false)),
      )
      .subscribe();
  }

  resetTactics(): void {
    this.pageState.savingResetDefault = true;

    this.post<unknown>('/my-team/coaching/reset', {})
      .pipe(
        switchMap(() => this.loadCoachingOverview()),
        catchError((error: HttpErrorResponse) => {
          this.pageState.errorMessage = this.getSaveErrorMessage(error);
          return of(undefined);
        }),
        finalize(() => (this.pageState.savingResetDefault = false)),
      )
      .subscribe();
  }

  private loadCoachingOverview(): Observable<void> {
    const lang = this.getCurrentLang();
    this.pageState.lang = lang;
    this.pageState.loading = true;
    this.pageState.errorMessage = '';

    return this.get<CoachingOverviewData>('/my-team/coaching', { lang }).pipe(
      map((response) => response.data),
      tap((data) => {
        if (data) this.applyData(data);
      }),
      map(() => undefined),
      catchError((error: HttpErrorResponse) => {
        this.pageState.errorMessage = this.isCoachingUnavailableError(error)
          ? 'No hay datos de cuerpo técnico disponibles.'
          : 'No se pudo cargar el cuerpo técnico. Intenta nuevamente.';
        return of(undefined);
      }),
      finalize(() => (this.pageState.loading = false)),
    );
  }

  private applyData(data: CoachingOverviewData): void {
    this.pageState.coach = data.coach;
    this.pageState.strategy = data.strategy;
    this.pageState.formation = data.formation;
    this.pageState.stats = data.stats;
    this.pageState.strategies = data.strategies ?? [];
    this.pageState.formations = data.formations ?? [];
    this.pageState.baseRatings = data.baseRatings ?? [];
    this.pageState.effectiveRatings = data.effectiveRatings ?? [];
    this.pageState.ratingDeltas = data.ratingDeltas ?? [];
    this.pageState.strategyPenalty = data.strategyPenalty ?? 0;

    const selectedStrategy = data.strategy?.strategy ?? '';
    const selectedFormation = data.formation?.formation ?? '';
    this.pageState.selectedStrategy = selectedStrategy;
    this.pageState.selectedFormation = selectedFormation;
    this.pageState.selectedStrategyDescription =
      (data.strategies ?? []).find(
        (s: CoachingStrategyCatalogItem) => s.strategy === selectedStrategy,
      )?.description ?? '';
    this.pageState.compatibleFormations = data.compatibility?.compatibleFormations ?? [];
    this.pageState.compatibleStrategies = data.compatibility?.compatibleStrategies ?? [];
    this.pageState.isSelectedFormationCompatible =
      data.compatibility?.isSelectedPairCompatible ?? true;

    const isCompatible = data.compatibility?.isSelectedPairCompatible ?? true;
    const hasSelection = Boolean(selectedStrategy || selectedFormation);
    this.pageState.tacticalStatusTone = !hasSelection
      ? 'original'
      : isCompatible
        ? 'compatible'
        : 'incompatible';
    this.pageState.tacticalStatusLabelKey = this.pageState.tacticalStatusTone;
  }

  private isCoachingUnavailableError(error: HttpErrorResponse): boolean {
    const messageCode = (
      error?.error as { responseMessage?: { messageCode?: string } } | undefined
    )?.responseMessage?.messageCode;
    return messageCode === 'WC_COACHING_UNAVAILABLE';
  }

  private getSaveErrorMessage(error: HttpErrorResponse): string {
    const messageCode = (
      error?.error as { responseMessage?: { messageCode?: string } } | undefined
    )?.responseMessage?.messageCode;
    return messageCode === 'WC_TACTICS_UPDATE_FAILED'
      ? 'No se pudo actualizar la táctica. Intenta nuevamente.'
      : 'Error al actualizar la táctica.';
  }
}