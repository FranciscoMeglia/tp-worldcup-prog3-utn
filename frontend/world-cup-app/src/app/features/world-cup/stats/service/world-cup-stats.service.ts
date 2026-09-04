import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { BaseApiService } from 'src/app/core/services/base-api.service';
import { WorldCupStatsApiResponse } from '../model/world-cup-stats-api.interface';
import { ResponseObject } from 'src/app/core/models/response-object.interface';
import { UiVisualsService } from 'src/app/core/services/ui-visuals.service';
import { WorldCupStatsViewModel } from '../model/world-cup-stats-view-model.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, combineLatest, finalize, map, of, switchMap, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WorldCupStatsService extends BaseApiService {
    private readonly uiVisualsService = inject(UiVisualsService)

    private readonly pageState: WorldCupStatsViewModel = {
        lang: 'es',
        loading: false,
        errorMessage: '',
        showNoDataState: false,

        totalMatches: 0,
        totalGoals: 0,
        avgGoalsPerMatch: 0,
        totalYellowCards: 0,
        totalRedCards: 0,

        podium: [],
        topScorers: [],
        topAssists: [],
        awards: [],
    };

    private hasInitialized = false;

    getViewModel(): WorldCupStatsViewModel {
        return this.pageState;
    }

    initialize(): void {
        if(this.hasInitialized) {
            this.loadStatsAwards().subscribe();
            return;
        }

        this.hasInitialized = true;
        this.pageState.lang = this.getCurrentLang();
        
        combineLatest([
            this.appContextService.currentTeamId$,
            this.appContextService.lang$,
            this.appContextService.worldCupRefresh$
        ]).pipe(
            tap(([, lang]) => {
                this.pageState.lang = lang === 'en' ? 'en' : 'es';
            }),
            switchMap(() => this.loadStatsAwards()),
            
        
        )
        .subscribe();
    }

    private loadStatsAwards(): Observable<void> {
        this.pageState.loading = true;
        this.pageState.errorMessage = '';
        this.pageState.showNoDataState = false;

        return this.getStatsAwards().pipe(
            map(response => response.data),

            tap(payload => {
            if (!payload) {
                return;
            }

            payload.podium = payload.podium.map(item => ({
                ...item,
                flag: this.uiVisualsService.getTeamFlag(item.teamId),
            }));

            payload.topScorers = payload.topScorers.map(item => ({
                ...item,
                teamFlag: this.uiVisualsService.getTeamFlag(item.teamId),
            }));

            payload.topAssists = payload.topAssists.map(item => ({
                ...item,
                teamFlag: this.uiVisualsService.getTeamFlag(item.teamId),
            }));

            payload.awards = payload.awards.map(item => ({
                ...item,
                teamFlag: this.uiVisualsService.getTeamFlag(item.teamId),
                icon: this.uiVisualsService.getAwardIcon(item.code),
            }));

                this.pageState.totalMatches = payload.totalMatches;
                this.pageState.totalGoals = payload.totalGoals;
                this.pageState.avgGoalsPerMatch = payload.avgGoalsPerMatch;
                this.pageState.totalYellowCards = payload.totalYellowCards;
                this.pageState.totalRedCards = payload.totalRedCards;

                this.pageState.podium = payload.podium;
                this.pageState.topScorers = payload.topScorers;
                this.pageState.topAssists = payload.topAssists;
                this.pageState.awards = payload.awards;
            }),

            map(() => undefined),

            catchError((error: HttpErrorResponse) => {
                console.log(error.error);
                if (this.isStatsUnavaibleError(error)) {
                    this.pageState.showNoDataState = true;
                    this.pageState.errorMessage = 
                        'Las estadísticas estaran disponible despues de que la final se haya jugado'
                } else {
                    this.pageState.errorMessage =
                    'No se pudieron cargar las estadísticas.';
                }

                return of(undefined);
            }),

            finalize(() => {
                this.pageState.loading = false;
            }),
        );


    }

    private isStatsUnavaibleError(error: HttpErrorResponse): boolean {
        const messageCode = 
        (error?.error as { 
            responseMessage?: { messageCode?: string }
        })?.responseMessage?.messageCode;

        return messageCode === 'WC_STATS_UNAVAILABLE';
    }



    getStatsAwards(): Observable<ResponseObject<WorldCupStatsApiResponse>> {
        return this.get<WorldCupStatsApiResponse>(
            '/world-cup/stats-awards');
    }
}
