import { Component, OnInit } from '@angular/core';
import { WorldCupStatsService } from './service/world-cup-stats.service';
import { WorldCupStatsViewModel } from './model/world-cup-stats-view-model.interface';

@Component({
  selector: 'app-world-cup-stats-page',
  standalone: false,
  templateUrl: './world-cup-stats.component.html',
  styleUrls: ['./world-cup-stats.component.css'],
})
export class WorldCupStatsPageComponent implements OnInit {
  constructor (
    private readonly statisticsService: WorldCupStatsService
  ) {
  }

  get pageState(): WorldCupStatsViewModel {
    return this.statisticsService.getViewModel();
  }

  ngOnInit(): void{
    this.statisticsService.initialize()
  }

}
