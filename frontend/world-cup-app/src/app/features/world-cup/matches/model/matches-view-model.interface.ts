import { MatchCardApiItem, MatchStageFilterItem } from './matches-api.interface';
import { MatchStageCode } from 'src/app/features/world-cup/matches/model/matches-api.interface';
export interface MatchesViewModel {
  lang: 'es' | 'en';
  loading: boolean;
  errorMessage: string;
  showNoSimulationState: boolean;
  selectedStage: MatchStageCode;
  stages: MatchStageFilterItem[];
  totalMatches: number;
  playedMatches: number;
  pendingMatches: number;
  matches: MatchCardApiItem[];
}
