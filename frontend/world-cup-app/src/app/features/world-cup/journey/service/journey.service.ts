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
import { UiVisualsService } from '../../../../core/services/ui-visuals.service';
import { AdminService } from '../../../../shared/admin/service/admin.service';
import { JourneyApiResponse } from '../model/journey-api.interface';
import { JourneyViewModel } from '../model/journey-view-model.interface';

@Injectable({ providedIn: 'root' })
export class JourneyService extends BaseApiService {
  private readonly adminService = inject(AdminService);
  private readonly uiVisualsService = inject(UiVisualsService);

  private readonly pageState: JourneyViewModel = {
    lang: 'es',
    loading: false,
    errorMessage: '',
    showNoSimulationState: false,
    selectedTeamLabel: 'ARG',
    journey: null,
  };

  private hasInitialized = false;

  getViewModel(): JourneyViewModel {
    return this.pageState;
  }

  initialize(): void {
    if (this.hasInitialized) {
      this.loadJourney().subscribe();
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
        switchMap(() => this.loadJourney()),
      )
      .subscribe();
  }

  private loadJourney(): Observable<void> {
    const lang = this.getCurrentLang();
    this.pageState.lang = lang;
    this.pageState.loading = true;
    this.pageState.errorMessage = '';
    this.pageState.showNoSimulationState = false;
    this.pageState.journey = null;

    return this.get<JourneyApiResponse>('/world-cup/journey', { lang }).pipe(
      map((response) => response.data),
      tap((payload) => {
        if (payload) {
          payload.matches = (payload.matches ?? []).map((match) => ({
            ...match,
            opponentFlag: this.uiVisualsService.getTeamFlag(match.opponentTeamId),
          }));
        }
        this.pageState.journey = payload ?? null;
      }),
      map(() => undefined),
      catchError((error: HttpErrorResponse) => {
        this.pageState.journey = null;
        if (this.isJourneyUnavailableError(error)) {
          this.pageState.showNoSimulationState = true;
        } else {
          this.pageState.errorMessage = 'No se pudo cargar el camino del equipo. Intenta nuevamente.';
        }
        return of(undefined);
      }),
      finalize(() => (this.pageState.loading = false)),
    );
  }

  private isJourneyUnavailableError(error: HttpErrorResponse): boolean {
    const messageCode = (error?.error as { responseMessage?: { messageCode?: string } } | undefined)
      ?.responseMessage?.messageCode;

    return messageCode === 'WC_JOURNEY_UNAVAILABLE';
  }
}
