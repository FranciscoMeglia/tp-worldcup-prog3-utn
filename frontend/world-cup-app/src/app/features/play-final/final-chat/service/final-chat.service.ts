import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { FinalChatMessageViewItem, FinalChatViewModel } from '../model/final-chat-view-model.interface';
import { UiVisualsService } from 'src/app/core/services/ui-visuals.service';
import { catchError, combineLatest, finalize, map, Observable, of, switchMap, tap } from 'rxjs';
import { BaseApiService } from 'src/app/core/services/base-api.service';
import { FinalChatApiResponse, FinalChatFormationCatalogApiItem, FinalChatStrategyCatalogApiItem, FinalChatTeamsPreviewApiResponse } from '../model/final-chat-api.interface';

interface FinalChatSelectedStrategyApiResponse {
    strategy: string;
    description: string;
    message: string;
}

interface FinalChatSelectedFormationApiResponse{
    teamId: string;
    formation: string;
    message: string;
}

enum StrategyLabels{
    ATTACK = 'Ataque',
    DEFENSE = 'Defensa',
    PENALTIES = 'Penales',
    COUNTER_ATTACK = 'Contra-ataque',
    BALANCED = 'Balanceado',
    POSSESSION = 'Posesión'
}

enum MatchFieldZone {
  DEFENSE_THIRD = 'DEFENSE_THIRD',
  MIDFIELD = 'MIDFIELD',
  ATTACK_THIRD = 'ATTACK_THIRD',
  BOX = 'BOX',
}


@Injectable({ providedIn: 'root' })
export class FinalChatService extends BaseApiService {
    private readonly finalMessages: FinalChatMessageViewItem[] = [];
    private readonly strategyCatalog: FinalChatStrategyCatalogApiItem[] = [];
    private readonly formationCatalog: FinalChatFormationCatalogApiItem[] = [];
    private readonly uiVisualsService = inject(UiVisualsService);

    private readonly pageState: FinalChatViewModel = {
        lang: 'es',
        loading: false,
        starting: false,
        sending: false,
        errorMessage: '',
        actionErrorMessage: '',
        showNoFinalState: false,
        data: null,
        teamsPreview: null,
        homeFlag: "",
        awayTeamFlag: ""
    }

    private hasInitialized = false;

    getViewModel(): FinalChatViewModel {
        return this.pageState;
    }

    addHomeTeamFlag(): void{
        const teamId = this.pageState.data?.teamId
        this.pageState.homeFlag =  this.uiVisualsService.getTeamFlagAssetPath(teamId);
    }
    addAwayTeamFlag(): void{
        const opponentTeamId = this.pageState.data?.opponentId;
        this.pageState.awayTeamFlag =  this.uiVisualsService.getTeamFlagAssetPath(opponentTeamId);
    }

    initialize(): void {
        if (this.hasInitialized) {
            this.LoadCurrentWorldCup()
                .pipe(switchMap(() => this.LoadStrategies()))
                .pipe(switchMap(() => this.LoadFormations()))
                .subscribe();
            return;
        }

        this.hasInitialized = true;
        this.pageState.lang = this.getCurrentLang();

        combineLatest([
            this.appContextService.currentTeamId$,
            this.appContextService.lang$,
            this.appContextService.worldCupRefresh$,
        ]).pipe(
            tap(([, lang]) => (this.pageState.lang = lang === 'en' ? 'en' : 'es')),
            switchMap(() => this.LoadCurrentWorldCup()),
            switchMap(() => this.LoadStrategies()),
            switchMap(() => this.LoadFormations()),
        ).subscribe();
    }

    StartFinal(): Observable<void> {
        return this.LoadFinal();
    }

    LoadCurrentWorldCup(): Observable<void> {
        const lang = this.getCurrentLang();
        this.pageState.lang = lang;
        this.pageState.loading = true;
        this.pageState.errorMessage = '';
        this.pageState.showNoFinalState = false;

        return this.get<FinalChatTeamsPreviewApiResponse>('/final-match/world-cup/current', { lang }).pipe(
            switchMap((response) => {
                const teamsPreview = response.data;
                this.pageState.teamsPreview = teamsPreview;
                this.pageState.showNoFinalState = !teamsPreview.hasActiveFinal && !teamsPreview.canStartFinal;
                this.pageState.actionErrorMessage = '';
                this.pageState.teamsPreview.canStartFinal = teamsPreview.canStartFinal;
                this.pageState.teamsPreview.worldCupStatus = teamsPreview.worldCupStatus;

                this.pageState.data = null;
                this.finalMessages.length = 0;
                return of(undefined);
            }),
            catchError((error: HttpErrorResponse) => {
                this.pageState.teamsPreview = null;
                this.pageState.data = null;
                this.finalMessages.length = 0;
                this.pageState.showNoFinalState = true;
                this.pageState.errorMessage = this.getErrorMessage(error);
                return of(undefined);
            }),
            finalize(() => {
                this.pageState.loading = false;
            }),
        );
    }


    LoadFinal(replaceMessages = false): Observable<void> {

        const lang = this.getCurrentLang();
        const teamId = this.getPlayableTeamId();
        this.pageState.lang = lang;
        this.pageState.starting = true;
        this.pageState.errorMessage = '';
        this.pageState.actionErrorMessage = '';

        return this.post<FinalChatApiResponse>('/final-match/start-final', { teamId, lang })
            .pipe(
                map((response) => response.data),
                tap((res) => {
                    this.setFinalData(res, replaceMessages);
                    this.addHomeTeamFlag();
                    this.addAwayTeamFlag();
                }),
                map(() => undefined),
                catchError((error: HttpErrorResponse) => {
                    this.pageState.errorMessage = this.getErrorMessage(error);
                    return of(undefined);
                }),
                finalize(() => {
                    this.pageState.starting = false;
                }),
            )
    }

    LoadStrategies(): Observable<void> {
        const lang = this.getCurrentLang();

        return this.get<FinalChatStrategyCatalogApiItem[]>('/final-match/strategies', {lang})
         .pipe(
            map((response)=> response.data),
            tap((res) => this.setStrategies(res)),
            map(()=> undefined),
            catchError((error: HttpErrorResponse) => {
                this.pageState.errorMessage = this.getErrorMessage(error)
                return of(undefined);
            }),

         )
    }

    SelectStrategy(strategy: string): Observable<void> {
        const teamId = this.pageState.data?.teamId ?? this.getPlayableTeamId();
        const lang = this.getCurrentLang();
        this.pageState.errorMessage = '';

        return this.post<FinalChatSelectedStrategyApiResponse>('/final-match/select-strategy', { teamId, strategy, lang })
            .pipe(
                map((response) => response.data),
                tap((res) => this.applySelectedStrategy(res)),
                map(() => undefined),
                catchError((error: HttpErrorResponse) => {
                    this.pageState.actionErrorMessage = this.getErrorMessage(error);
                    return of(undefined);
                }),
            )
    }

    LoadFormations(): Observable<void>{
        const lang = this.getCurrentLang();

        return this.get<FinalChatFormationCatalogApiItem[]>('/final-match/formations', {lang})
        .pipe(
            map((response)=> response.data),
            tap((res)=> this.setFormations(res)),
            map(()=> undefined),
            catchError((error: HttpErrorResponse) => {
                this.pageState.errorMessage = this.getErrorMessage(error)
                return of(undefined);
            }),
        )
    }

    SelectFormation(formation: string): Observable<void>{
        const teamId = this.pageState.data?.teamId ?? this.getPlayableTeamId();
        const lang = this.getCurrentLang();
        this.pageState.errorMessage = '';

        return this.post<FinalChatSelectedFormationApiResponse>('/final-match/select-formation', { teamId, formation, lang })
            .pipe(
                map((response) => response.data),
                tap((res) => this.applySelectedFormation(res)),
                map(() => undefined),
                catchError((error: HttpErrorResponse) => {
                    this.pageState.actionErrorMessage = this.getErrorMessage(error);
                    return of(undefined);
                }),
            )
    }

    playTurn(selectedOption: number): Observable<void> {
        const lang = this.getCurrentLang();
        this.pageState.sending = true;
        this.pageState.errorMessage = '';

        return this.post<FinalChatApiResponse>('/final-match/play-turn', { selectedOption, lang })
            .pipe(
                map((response) => response.data),
                tap((res) => {
                    this.setFinalData(res);
                    this.addHomeTeamFlag();
                    this.addAwayTeamFlag();
                }),
                map(() => undefined),
                catchError((error: HttpErrorResponse) => {
                    this.pageState.actionErrorMessage = this.getErrorMessage(error);
                    return of(undefined);
                }),
                finalize(() => {
                    this.pageState.sending = false;
                }),
            )
    }

    mensajes(): FinalChatMessageViewItem[] {
        return this.finalMessages;
    }

    strategies(): FinalChatStrategyCatalogApiItem[] {
        return this.strategyCatalog;
    }

    formations(): FinalChatFormationCatalogApiItem[] {
        return this.formationCatalog;
    }

    private setFinalData(response: FinalChatApiResponse, replaceMessages = false): void {
        
        this.pageState.data = {
            ...response,
            teamCoachProfile: this.parseCoachProfile(response.teamCoachProfile),
            opponentCoachProfile: this.parseCoachProfile(response.opponentCoachProfile),
            possession: response.possession === 'USER' ? response.teamName  : response.opponentName,
            strategyCatalog: this.strategyCatalog.length ? this.strategyCatalog : response.strategyCatalog,
            formationCatalog: this.formationCatalog.length ? this.formationCatalog : response.formationCatalog,
            zoneLabel: response.zone ? this.parseZoneLabel(response.zone) : '-'
        };


        if (this.pageState.teamsPreview) {
            this.pageState.teamsPreview = {
                ...this.pageState.teamsPreview,
                hasActiveFinal: !response.isFinished,
                canStartFinal: false
            };
        }

        if (replaceMessages) {
            this.finalMessages.length = 0;
        }

        response.messageItems.forEach((msg) => {
            this.finalMessages.push({
                text: msg.text,
                icon: this.uiVisualsService.getFinalChatMessageIcon(msg.type),
            });
        });
    }

    private setStrategies(response: FinalChatStrategyCatalogApiItem[]): void{
        this.strategyCatalog.length = 0;

        response.forEach((str)=>{
            (str.strategy === 'ATTACK') && (str.strategyLabel = StrategyLabels.ATTACK);
            (str.strategy === 'DEFENSE') && (str.strategyLabel = StrategyLabels.DEFENSE);
            (str.strategy === 'PENALTIES') && (str.strategyLabel = StrategyLabels.PENALTIES);
            (str.strategy === 'COUNTER_ATTACK') && (str.strategyLabel = StrategyLabels.COUNTER_ATTACK);
            (str.strategy === 'BALANCED') && (str.strategyLabel = StrategyLabels.BALANCED);
            (str.strategy === 'POSSESSION') && (str.strategyLabel = StrategyLabels.POSSESSION);
            
        });

        this.strategyCatalog.push(...response);

        const data = this.pageState.data;
        if (data) {
            this.pageState.data = {
                ...data,
                strategyCatalog: response,
            };
        }
    }
   
    private setFormations(response: FinalChatFormationCatalogApiItem[]): void{
        this.formationCatalog.length = 0;

        this.formationCatalog.push(...response);

        const data = this.pageState.data;
        if (data) {
            this.pageState.data = {
                ...data,
                formationCatalog: response,
            };
        }
    }

    private applySelectedStrategy(response: FinalChatSelectedStrategyApiResponse): void {
        const data = this.pageState.data;

        if (!data) {
            return;
        }

        this.pageState.data = {
            ...data,
            teamStrategy: response.strategy,
            teamStrategyLabel: this.getStrategyLabel(response.strategy),
        };

        if (response.message) {
            this.finalMessages.push({
                text: response.message,
                icon: this.uiVisualsService.getFinalChatMessageIcon('INFO'),
            });
        }
    }
    
    private applySelectedFormation(response: FinalChatSelectedFormationApiResponse): void {
        const data = this.pageState.data;

        if (!data) {
            return;
        }

        this.pageState.data = {
            ...data,
            teamFormation: response.formation,
        };

        if (response.message) {
            this.finalMessages.push({
                text: response.message,
                icon: this.uiVisualsService.getFinalChatMessageIcon('INFO'),
            });
        }
    }

    private getPlayableTeamId(): string {
        const currentTeamId = this.getCurrentTeamId();
        const teamsPreview = this.pageState.teamsPreview;

        if (!teamsPreview) {
            return currentTeamId;
        }

        if (currentTeamId === teamsPreview.teamId || currentTeamId === teamsPreview.opponentId) {
            return currentTeamId;
        }

        return teamsPreview.teamId;
    }

    private getStrategyLabel(strategy: string): string {
        return this.strategyCatalog.find((item) => item.strategy === strategy)?.strategyLabel || strategy;
    }

    private getErrorMessage(error: HttpErrorResponse): string {
        const responseMessage = error.error.responseMessage; 

        if (error.status === 0 || error.statusText === "Unknown Error") {
            return "No se pudieron cargar los datos de la final. Intente de nuevo en unos instantes.";
        }

        if (responseMessage.messageCode === "ACTIVE_FINAL_NOT_FOUND") {
            return 'No se pudieron cargar los datos de la final. Intente de nuevo en unos instantes.'
        }

        if (responseMessage.messageCode === 'SELECTED_STRATEGY_BAD_REQUEST') {
            return 'No se pudo cargar los datos de la estrategia elegida. Intente de nuevo en unos instantes'
        };
        
        if (responseMessage.messageCode === 'SELECTED_FORMATION_BAD_REQUEST') {
            return 'No se pudo cargar los datos de la formación elegida. Intente de nuevo en unos instantes'
        };

        return 'No se pudieron cargar los datos de la final. Intente de nuevo en unos instantes.';
    }

    private parseCoachProfile(profile: string): string{
        if (profile === 'CONSERVATIVE') {
            return 'Conservador';
        }
        if (profile === 'BALANCED') {
            return 'Balanceado';
        }
        if (profile === 'AGGRESSIVE') {
            return 'Agresivo';
        }
        if (profile === 'PRAGMATIC') {
            return 'Pragmatico';
        }
        if (profile === 'CATENACCIO') {
            return 'Catenaccion';
        }
        if (profile === 'REACTIVE') {
            return 'Reactivo';
        }
        if (profile === 'TOTAL_FOOTBALL') {
            return 'Futbol Total';
        }
        return profile
    }

    private parseZoneLabel(zone: string): string{
        if (zone === MatchFieldZone.DEFENSE_THIRD) {
            return 'Tercio defensivo'
        }

        if (zone === MatchFieldZone.MIDFIELD) {
            return 'Medio campo'
        }

        if (zone === MatchFieldZone.ATTACK_THIRD) {
            return 'Tercio ofensivo'
        }

        if (zone === MatchFieldZone.BOX) {
            return 'Área'
        }
        return zone;
    }

}
