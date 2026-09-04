import { inject, Injectable } from '@angular/core';
import { BaseApiService } from '../../../../core/services/base-api.service';
import { map, tap, Observable, catchError, of } from 'rxjs';
import { MatchesViewModel } from '../model/matches-view-model.interface';
import { AdminService } from 'src/app/shared/admin/service/admin.service';
import { UiVisualsService } from 'src/app/core/services/ui-visuals.service';
import { MatchCardApiItem, MatchesApiResponse } from '../model/matches-api.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { MatchStageCode } from '../model/matches-api.interface';
@Injectable({ providedIn: 'root' })
export class MatchesService extends BaseApiService{
    private readonly adminService = inject(AdminService);
    private readonly uiVisualsService = inject(UiVisualsService);
private readonly pageState : MatchesViewModel = {
    lang: this.getCurrentLang(),
    loading: false,
    errorMessage: '',
    showNoSimulationState: false,
    selectedStage: MatchStageCode.GROUP_STAGE,
    stages: [],
    totalMatches: 0,
    playedMatches: 0,
    pendingMatches: 0,
    matches: [],
};
private hasInitialized = false;
initialize() : void {
    if (this.hasInitialized) {
        this.getMatches(this.pageState.selectedStage).subscribe();
        return;
    }
    this.hasInitialized = true;
    this.pageState.lang = this.getCurrentLang();
    this.getMatches(this.pageState.selectedStage).subscribe();
}

getViewModel() : MatchesViewModel {
    return this.pageState;
}
setStageFilter(stage: MatchStageCode) : void {
    this.pageState.selectedStage = stage;
    this.getMatches(stage).subscribe();
}
getMatches(stage: MatchStageCode) : Observable<unknown> {
    const lang = this.getCurrentLang();
    this.pageState.lang = lang;
    this.pageState.loading = true;
    this.pageState.errorMessage = '';    
    return this.get<MatchesApiResponse>('/world-cup/current/matches', {
        lang,
        stage 
        }).pipe(
        map((response) => response.data),
        tap((data) => {
        this.pageState.loading = false;
        this.pageState.stages = data.availableStages;
        this.pageState.totalMatches = data.totalMatches;
        this.pageState.playedMatches = data.playedMatches;
        this.pageState.pendingMatches = data.pendingMatches;
        this.pageState.matches = data.matches;
        this.pageState.matches.forEach(m => {
            m.homeFlag = this.uiVisualsService.getTeamFlagAssetPath(m.homeTeamId);
            m.awayFlag = this.uiVisualsService.getTeamFlagAssetPath(m.awayTeamId);
        });
        this.pageState.showNoSimulationState = false;
        }),
        catchError((error: HttpErrorResponse) => {
        this.pageState.loading = false;
        if (error.status === 404 || error.status === 409 || error.error?.messageCode === 'WC_SIMULATION_UNAVAILABLE') {
          this.pageState.showNoSimulationState = true;
        } else {
          this.pageState.errorMessage = 'Hubo un error al cargar los partidos';
        }
        return of(null);
      })
    );
 }
}
