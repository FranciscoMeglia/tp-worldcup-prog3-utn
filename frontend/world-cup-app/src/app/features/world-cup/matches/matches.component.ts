import { Component, inject, OnInit } from '@angular/core';
import {MatchesService} from './service/matches.service';
import { MatchStageCode } from 'src/app/features/world-cup/matches/model/matches-api.interface';
import { UiVisualsService } from 'src/app/core/services/ui-visuals.service';

@Component({
  selector: 'app-matches-page',
  standalone: false,
  templateUrl: './matches.component.html',
  styleUrls: ['./matches.component.css'],
})
export class MatchesPageComponent implements OnInit {
  private readonly uiVisualsService = inject(UiVisualsService);
  readonly matchStageCode = MatchStageCode; 
  constructor (private readonly matchesService: MatchesService) {}
  
  get pageState() {
    console.log(this.matchesService.getViewModel().selectedStage)
    return this.matchesService.getViewModel();
  }

  ngOnInit(): void {
    this.matchesService.initialize();
  }
  onStageFilterChange(stage: MatchStageCode): void {
    this.matchesService.setStageFilter(stage);
  }
}
