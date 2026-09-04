import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, catchError, finalize, map, of, tap } from 'rxjs';

import { BaseApiService } from '../../../../core/services/base-api.service';
import { HistoricalWorldCupItem, WorldCupHistoryApiResponse } from '../model/world-cup-history-api.interface';
import { WorldCupHistoryViewModel } from '../model/world-cup-history-view-model.interface';
import { UiVisualsService } from 'src/app/core/services/ui-visuals.service';

@Injectable({ providedIn: 'root' })
export class WorldCupHistoryService extends BaseApiService {
  private readonly pageState: WorldCupHistoryViewModel = {
    lang: 'es',
    loading: false,
    errorMessage: '',
    showNoDataState: false,
    totalWorldCups: 0,
    worldCups: [],
  };

  
  getViewModel(): WorldCupHistoryViewModel {
    return this.pageState;
  }

  initialize(): void {
    this.loadWorldCupHistory().subscribe();
  }

  // obtiene el historial consolidado desde WorldCupCore.
  private loadWorldCupHistory(): Observable<void> {
    this.pageState.loading = true;
    this.pageState.errorMessage = '';

    return this.get<WorldCupHistoryApiResponse>('/world-cup/history').pipe(
      map((response) => response.data),
      tap((history) => {
        this.pageState.lang = history.lang;
        this.pageState.totalWorldCups = history.totalWorldCups;
        this.pageState.worldCups = history.worldCups;

        for (const worldCup of this.pageState.worldCups) {
          this.addFlags(worldCup);
        }
      }),
      tap(() => {
        this.pageState.showNoDataState = this.pageState.worldCups.length === 0;
      }),
      map(() => undefined),
      catchError((error: HttpErrorResponse) => {
        this.pageState.errorMessage = 'No se pudo cargar el historial de mundiales.';
        this.pageState.showNoDataState = false;

        return of(undefined);
      }),
      finalize(() => {
        this.pageState.loading = false;
      }),
    );
  }

  // prueba de solucion para el problema de las banderas en Windows.

  private readonly uiVisualsService = inject(UiVisualsService);

  private addFlags(worldCup: HistoricalWorldCupItem): void {
  worldCup.champion.flag =
    this.uiVisualsService.getTeamFlagAssetPath(worldCup.champion.teamId);

  worldCup.runnerUp.flag =
    this.uiVisualsService.getTeamFlagAssetPath(worldCup.runnerUp.teamId);

  worldCup.thirdPlace.flag =
    this.uiVisualsService.getTeamFlagAssetPath(worldCup.thirdPlace.teamId);

  worldCup.fourthPlace.flag =
    this.uiVisualsService.getTeamFlagAssetPath(worldCup.fourthPlace.teamId);

  worldCup.topScorer.teamFlag =
    this.uiVisualsService.getTeamFlagAssetPath(worldCup.topScorer.teamId);

  worldCup.topAssist.teamFlag =
    this.uiVisualsService.getTeamFlagAssetPath(worldCup.topAssist.teamId);

  worldCup.fairPlay.teamFlag =
    this.uiVisualsService.getTeamFlagAssetPath(worldCup.fairPlay.teamId);

  worldCup.worstFairPlay.teamFlag =
    this.uiVisualsService.getTeamFlagAssetPath(worldCup.worstFairPlay.teamId);
}


}