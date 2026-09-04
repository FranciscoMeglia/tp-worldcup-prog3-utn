import { inject, Injectable } from '@angular/core';
import { BaseApiService } from 'src/app/core/services/base-api.service';
import { LiveEventsApiResponse } from '../model/live-events-api.interface';
import { LiveEventsViewModel } from '../model/live-events-view-model.interface';
import { Observable, catchError, finalize, map, tap, of, combineLatest, switchMap, throwError} from 'rxjs';
import { AdminService } from 'src/app/shared/admin/service/admin.service';
import { UiVisualsService } from 'src/app/core/services/ui-visuals.service';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class LiveEventsService extends BaseApiService{
    private readonly adminService = inject(AdminService);
    private readonly uiVisualsService = inject(UiVisualsService);

    private readonly pageState: LiveEventsViewModel = {
        lang: 'es',
        loading: false,
        errorMessage: '',
        showNoFinalState: true,
        data: null
    }

    private hasInitialized = false;
    
    getViewModel() : LiveEventsViewModel{
        return this.pageState;
    }
    
    initialize(): void{
        if(this.hasInitialized){
            this.loadEvents().subscribe();
            return;
        }
        
        this.hasInitialized = true;
        this.pageState.lang = this.getCurrentLang();

        combineLatest([this.appContextService.currentTeamId$, this.appContextService.lang$])
            .pipe(
                tap(([, lang]) => (this.pageState.lang = lang === 'en' ? 'en' : 'es')),
                switchMap(() => this.loadEvents()),
            ).subscribe();
    }

    private loadEvents() : Observable<void> {
        const lang = this.getCurrentLang();
        this.pageState.lang = lang;
        this.pageState.loading = true;
        this.pageState.errorMessage = '';

        return this.get<LiveEventsApiResponse>('/final-match/events', { lang })
            .pipe(
                map(response  => response.data),
                tap((payload) =>{
                    this.pageState.showNoFinalState = false;
                    this.pageState.data = payload ?? null;
                    if(this.pageState.data != null){       
                        this.mapIcons(payload);
                    }
                }),
                map(() => undefined),
                catchError((error: HttpErrorResponse)=>{
                    console.log(error.error);
                    this.pageState.data = null;
                    if(this.eventsError(error)){
                        this.pageState.loading = false;
                        this.pageState.showNoFinalState = true;
                        this.pageState.errorMessage = 'No hay final activa para cargar Eventos';
                        console.log(this.pageState.errorMessage)
                    }else{
                        this.pageState.errorMessage = 'No se pudieron cargar los Eventos';
                    }
                return of(undefined);
            }),
            finalize(() => (this.pageState.loading = false)),
            )
    }

    private eventsError(error: HttpErrorResponse): boolean{
        const messageCode = 
        (error?.error as { 
            responseMessage?: { messageCode?: string }
        })?.responseMessage?.messageCode;

        return messageCode === 'ACTIVE_FINAL_NOT_FOUND';
    }

    private mapIcons(payload: LiveEventsApiResponse): void {
        if(payload.isFinished){
            payload.playerOfMatch!.teamFlag = this.uiVisualsService.getTeamFlag(payload.playerOfMatch?.teamId);
        }
        payload.team.flag = this.uiVisualsService.getTeamFlag(this.getCurrentTeamId());
        payload.opponent.flag = this.uiVisualsService.getTeamFlag(payload.opponent.id);   
        payload.events = payload.events.map(event =>({
            ...event,
            icon: this.uiVisualsService.getLiveEventIcon(event.style, event.type)
        }));
    }
}