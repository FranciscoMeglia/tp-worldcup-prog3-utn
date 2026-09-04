import { Injectable } from '@angular/core';
import { Observable, map} from "rxjs";
import { BaseApiService } from "../../../../core/services/base-api.service";
import { GroupsApiResponse } from '../model/groups-api.interface';

@Injectable({ providedIn: 'root' })
export class GroupsService extends BaseApiService {

    getGroups() : Observable<GroupsApiResponse> {
        const lang = this.getCurrentLang();
        return this.get<GroupsApiResponse>('/world-cup/current/groups', { lang })
            .pipe(map(response  => response.data));
    }

}
