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
import { RivalsViewModel } from '../model/rivals-view-model.interface';
import { RivalsApiResponse } from '../model/rivals-api.interface';
import { UiVisualsService } from '../../../../core/services/ui-visuals.service';

@Injectable({ providedIn: 'root' })
export class RivalsService extends BaseApiService {
  private readonly adminService = inject(AdminService);
  private readonly uiVisualsService = inject(UiVisualsService);

  // Estado reactivo local que controla el listado inicial y el rival seleccionado en la misma página
  private readonly pageState: RivalsViewModel = {
    lang: 'es',
    loading: false,
    errorMessage: '',
    selectedTeamLabel: 'SAU',
    totalRivals: 0,
    rivals: [],
  };

  private hasInitialized = false;

  getViewModel(): RivalsViewModel {
    return this.pageState;
  }

  initialize(): void {
    if (this.hasInitialized) {
      this.loadHistoricalRivals().subscribe();
      return;
    }

    this.hasInitialized = true;
    this.pageState.lang = this.getCurrentLang();
    this.pageState.selectedTeamLabel = this.adminService.getCurrentTeam()?.name ?? 'SAU';

    this.adminService.currentTeam$.subscribe((team) => {
      this.pageState.selectedTeamLabel = team?.name ?? 'SAU';
    });

    combineLatest([this.appContextService.currentTeamId$, this.appContextService.lang$])
      .pipe(
        tap(([, lang]) => (this.pageState.lang = lang === 'en' ? 'en' : 'es')),
        switchMap(() => this.loadHistoricalRivals()),
      )
      .subscribe();
  }

  private loadHistoricalRivals(): Observable<void> {
    const lang = this.getCurrentLang();
    const teamId = this.adminService.getCurrentTeam()?.teamId ?? 'SAU';
    this.pageState.lang = lang;
    this.pageState.loading = true;
    this.pageState.errorMessage = '';

    //mapeamos la propiedad .data de la respuesta genérica del BaseApiService
    return this.get<RivalsApiResponse>('/my-team/historical-rivals', { 
      lang, 
      teamId 
    }).pipe(
      map((response) => response.data),
      map((rivals) => this.normalizeRivals(rivals)),
      tap((rivals) => {
        this.pageState.rivals = rivals?.rivals ?? [];
        this.pageState.totalRivals = rivals?.totalRivals ?? 0;
      }),
      map(() => undefined),
      catchError(() => {
        this.pageState.rivals = [];
        this.pageState.totalRivals = 0;
        this.pageState.errorMessage = 'No se pudieron cargar los rivales históricos.';
        return of(undefined);
      }),
      finalize(() => (this.pageState.loading = false)),
    );
  }

  private normalizeRivals(response: RivalsApiResponse | null | undefined): RivalsApiResponse | null {
    if (!response) {
      return null;
    }

    return {
      ...response,
      rivals: (response.rivals ?? []).map((rival) => ({
        ...rival,
        flag: this.uiVisualsService.getTeamFlag(rival.id)
      })),
    };
  }
}
