import { Component, OnInit } from '@angular/core';
import { TeamStateService } from './service/team-state.service';
import { TeamStateViewModel } from './model/team-state-view-model.interface';

@Component({
  selector: 'app-team-state-page',
  standalone: false,
  templateUrl: './team-state.component.html',
  styleUrls: ['./team-state.component.css'],
})
export class TeamStatePageComponent implements OnInit {

  constructor(private readonly teamStateService: TeamStateService){}
  
  get pageState(): TeamStateViewModel{
    return this.teamStateService.getViewModel();
  }

  get flag(): string{
    return this.teamStateService.getFlag();
  }

  getPercent(value: number | null | undefined): number {
    const numericValue = Number(value ?? 0);

    if (Number.isNaN(numericValue)) {
      return 0;
    }

    return Math.min(Math.max(numericValue, 0), 100);
  }

  energy(energyLevel: number): string{
    if (energyLevel < 40) {
      return "Bajo";
    } else if (energyLevel < 70){
      return "Medio";
    } else{
      return "Alto";
    }
    
  }

  ngOnInit(): void {
    this.teamStateService.initialize();
  }
}
