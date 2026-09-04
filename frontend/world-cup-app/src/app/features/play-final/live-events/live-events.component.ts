import { Component, OnInit } from '@angular/core';
import { LiveEventsService } from './service/live-events.service';
import { LiveEventsViewModel } from './model/live-events-view-model.interface';

@Component({
  selector: 'app-live-events-page',
  standalone: false,
  templateUrl: './live-events.component.html',
  styleUrls: ['./live-events.component.css'],
})
export class LiveEventsPageComponent implements OnInit{

  constructor(private readonly liveEventService: LiveEventsService){}
  
  get pageState(): LiveEventsViewModel{
    return this.liveEventService.getViewModel();
  }

  ngOnInit(): void {
    this.liveEventService.initialize();
  }
}
