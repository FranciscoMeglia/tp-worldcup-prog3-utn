import { Component, OnInit } from '@angular/core';
import { JourneyService } from './service/journey.service';
import { JourneyViewModel } from './model/journey-view-model.interface';

@Component({
  selector: 'app-journey-page',
  standalone: false,
  templateUrl: './journey.component.html',
  styleUrls: ['./journey.component.css'],
})
export class JourneyPageComponent implements OnInit {
  constructor(private readonly journeyService: JourneyService) {}

  get pageState(): JourneyViewModel {
    return this.journeyService.getViewModel();
  }

  ngOnInit(): void {
    this.journeyService.initialize();
  }

  getResultRowClass(resultStyle: string): string {
    switch (resultStyle) {
      case 'WIN': return 'j-win';
      case 'LOSS': return 'j-loss';
      case 'DRAW': return 'j-draw';
      default: return 'j-pending';
    }
  }

  getResultBadgeClass(resultStyle: string): string {
    switch (resultStyle) {
      case 'WIN': return 'jd-win';
      case 'LOSS': return 'jd-loss';
      case 'DRAW': return 'jd-draw';
      default: return 'jd-pending';
    }
  }
}
