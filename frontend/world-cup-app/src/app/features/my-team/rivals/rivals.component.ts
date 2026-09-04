import { Component, OnInit } from '@angular/core';
import { RivalsService } from './service/rivals.service'; 
import { RivalItem } from './model/rivals-api.interface';
import { RivalsViewModel } from './model/rivals-view-model.interface';

@Component({
  selector: 'app-rivals-page',
  standalone: false,
  templateUrl: './rivals.component.html',
  styleUrls: ['./rivals.component.css'],
})
export class RivalsPageComponent implements OnInit {
  public viewModel: RivalsViewModel;
  

  public selectedRival: RivalItem | null = null;

  constructor(private readonly rivalsService: RivalsService) {
    this.viewModel = this.rivalsService.getViewModel();
  }

  ngOnInit(): void {
    this.rivalsService.initialize();
  }
}

