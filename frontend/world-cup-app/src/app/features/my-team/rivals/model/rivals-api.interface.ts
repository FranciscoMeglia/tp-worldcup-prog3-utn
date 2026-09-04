export interface RivalItem {
  id: string;
  name: string;
  shortCode: string;
  flag: string;
  confederation: string;
  overallRating: number;
  coachName: string;
  captain: string;
  strategy: string;
  strategyLabel: string;
  formation: string;
}

export interface RivalsApiResponse {
  teamId: string;
  totalRivals: number;
  rivals: RivalItem[];
}
