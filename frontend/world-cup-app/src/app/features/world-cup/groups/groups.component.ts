import { Component, OnInit, inject } from '@angular/core';
import { GroupsService } from './service/groups.service';
import { GroupTableApiItem } from './model/groups-api.interface';
import { GroupsViewModel } from './model/groups-view-model.interface';

@Component({
  selector: 'app-groups-page',
  standalone: false,
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.css'],
})
export class GroupsPageComponent implements OnInit {
  private readonly groupsService = inject(GroupsService);

  viewModel: GroupsViewModel = {
    lang: 'es',
    loading: true,
    errorMessage: '',
    showNoSimulationState: false,
    selectedTeamLabel: 'SAU',
    selectedGroup: null,
    selectedGroupData: null,
    groups: [],
  };

  ngOnInit(): void {
    this.loadGroups();
  }

  loadGroups(): void {
    // Reseteo el estado al arrancar
    this.viewModel.loading = true;
    this.viewModel.errorMessage = '';
    this.viewModel.showNoSimulationState = false;

    this.groupsService.getGroups().subscribe({
      next: (response) => {
        this.viewModel.loading = false;
        this.viewModel.selectedGroup = response.selectedGroup;
        this.viewModel.groups = response.groups;
        this.viewModel.selectedGroupData = this.findGroupData(
            response.groups,
            response.selectedGroup,
        );
      },

      error: (err) => {
        this.viewModel.loading = false;
        const messageCode = err?.error?.responseMessage?.messageCode;

        if (messageCode === 'WC_GROUPS_UNAVAILABLE') {
          this.viewModel.showNoSimulationState = true;
        } else {
          this.viewModel.errorMessage = 'No se pudieron cargar los grupos. Intenta de nuevo.';
        }
      },
    });
  }

  onGroupSelected(group: string): void {
    this.viewModel.selectedGroup = group;
    this.viewModel.selectedGroupData = this.findGroupData(this.viewModel.groups, group);
  }

  private findGroupData(groups: GroupTableApiItem[], targetGroup: string | null): GroupTableApiItem | null {
    if (!groups.length) {
      return null;
    }
    if (!targetGroup) {
      return groups[0];
    }
    return groups.find((g) => g.group === targetGroup) ?? groups[0];
  }

}