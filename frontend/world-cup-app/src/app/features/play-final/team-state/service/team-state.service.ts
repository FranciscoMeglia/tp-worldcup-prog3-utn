import { inject, Injectable } from '@angular/core';
import { catchError, combineLatest, finalize, map, Observable, of, switchMap, tap } from 'rxjs';
import { BaseApiService } from 'src/app/core/services/base-api.service';
import { AdminService } from 'src/app/shared/admin/service/admin.service';
import { TeamStateApiResponse } from '../model/team-state-api.interface';
import { TeamStateViewModel } from '../model/team-state-view-model.interface';
import { UiVisualsService } from 'src/app/core/services/ui-visuals.service';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class TeamStateService extends BaseApiService {
    private readonly adminService = inject(AdminService);
    private readonly uiVisualService = inject(UiVisualsService);

    private readonly pageState: TeamStateViewModel = {
        lang: 'es',
        loading: true,
        errorMessage: '',
        showNoFinalState: false,
        homeFlag: '',
        awayTeamFlag: '',
        data:  null
    }

    private hasInitialized = false;

    getViewModel(): TeamStateViewModel{
        return this.pageState;
    }

    getFlag(): string{
        return this.uiVisualService.getTeamFlag(this.adminService.getCurrentTeamId());
    }

    addHomeTeamFlag(): void{
        const teamId = this.getCurrentTeamId();
        this.pageState.homeFlag =  this.uiVisualService.getTeamFlagAssetPath(teamId);
    }
    addAwayTeamFlag(): void{
        const opponentTeamId = this.pageState.data?.opponent.id;
        this.pageState.awayTeamFlag =  this.uiVisualService.getTeamFlagAssetPath(opponentTeamId);
    }

    initialize(): void{
        if (this.hasInitialized) {
            this.loadStates().subscribe();
            return;
        }

        this.hasInitialized = true;
        this.pageState.lang = this.adminService.getCurrentLang();

        combineLatest([this.appContextService.currentTeamId$, this.appContextService.lang$])
            .pipe(
                tap(([, lang]) => (this.pageState.lang = lang === 'en' ? 'en' : 'es')),
                switchMap(() => this.loadStates()),
            )
            .subscribe();
    }

    private loadStates(): Observable<void> {
        const lang = this.getCurrentLang();
        this.pageState.lang = lang;
        this.pageState.loading = true;
        this.pageState.errorMessage = '';
        this.pageState.showNoFinalState = false;
        this.pageState.data = null;

        return this.get<TeamStateApiResponse>('/final-match/current/squad', { lang }).pipe(
            map((response)=>response.data),
            tap((payload)=>{
                this.pageState.lang = payload?.lang ?? this.adminService.getCurrentLang();
                this.pageState.errorMessage = '';
                this.pageState.showNoFinalState = false;
                this.pageState.data = payload ?? null;
                this.addHomeTeamFlag();
                this.addAwayTeamFlag();
            }),
            map(() => undefined),
            catchError((e: HttpErrorResponse)=>{
                let mensajeError = "No se pudo cargar el estado del equipo. Intente de nuevo mas tarde.";
                const error = e.error?.responseMessage?.message;

                if (e.status === 0 || e.statusText === "Unknown Error") {
                    mensajeError = "No se pudo cargar el estado del equipo. Intente de nuevo mas tarde."
                }

                if (error === "There is no active final") {
                    mensajeError = "No hay una final activa.";
                }

                if (error === "Unable to load squad data from World Cup API."){
                    mensajeError = "No se pudo cargar el estado del equipo. Intente de nuevo mas tarde."
                }

                this.pageState.data = null;
                this.pageState.showNoFinalState = true;
                this.pageState.errorMessage = mensajeError;
                return of(undefined);
            }),
            finalize(() => (this.pageState.loading = false)),
        )
    }
}