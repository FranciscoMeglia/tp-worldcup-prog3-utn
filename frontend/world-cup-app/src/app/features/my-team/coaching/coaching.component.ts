import { Component, OnInit } from '@angular/core';
import { CoachingViewModel } from './model/coaching-view-model.interface';
import { CoachingService } from './service/coaching.service';

@Component({
  selector: 'app-coaching-page',
  standalone: false,
  templateUrl: './coaching.component.html',
  styleUrls: ['./coaching.component.css'],
})
export class CoachingPageComponent implements OnInit {
  constructor(private readonly coachingService: CoachingService) {}

  get pageState(): CoachingViewModel {
    return this.coachingService.getViewModel();
  }

  get isSaving(): boolean {
    return (
      this.pageState.savingStrategy ||
      this.pageState.savingFormation ||
      this.pageState.savingResetDefault
    );
  }

  ngOnInit(): void {
    this.coachingService.initialize();
  }

  onStrategyChange(strategy: string): void {
    this.coachingService.changeStrategy(strategy);
  }

  onFormationChange(formation: string): void {
    this.coachingService.changeFormation(formation);
  }

  onResetTactics(): void {
    this.coachingService.resetTactics();
  }

  getMetricsList(): { label: string; key: string; value: number }[] {
    const m = this.pageState.coach;
    if (!m) return [];
    return [
      { label: 'Apetito al Riesgo', key: 'riskAppetite', value: m.riskAppetite },
      { label: 'Gestión del Partido', key: 'gameManagement', value: m.gameManagement },
      { label: 'Adaptabilidad', key: 'adaptability', value: m.adaptability },
      { label: 'Presión', key: 'pressingBias', value: m.pressingBias },
      { label: 'Posesión', key: 'possessionBias', value: m.possessionBias },
      { label: 'Defensa', key: 'defenseBias', value: m.defenseBias },
    ];
  }

  getMetricLabel(metric: string): string {
    const labels: Record<string, string> = {
      attack: 'ATAQUE',
      defense: 'DEFENSA',
      midfield: 'MEDIOCAMPO',
      overall: 'OVERALL',
    };
    return labels[metric] ?? metric.toUpperCase();
  }

  getBaseRatingValue(metric: string): number {
    return this.pageState.baseRatings.find((r) => r.metric === metric)?.value ?? 0;
  }

  getTacticalStatusLabel(): string {
    const labels: Record<string, string> = {
      compatible: 'Combinación compatible',
      incompatible: 'Combinación incompatible',
      original: 'Táctica original del equipo',
    };
    return labels[this.pageState.tacticalStatusTone] ?? '';
  }

  absValue(n: number): number {
    return Math.abs(n);
  }
}