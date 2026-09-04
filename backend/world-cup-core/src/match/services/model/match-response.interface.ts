
export interface LiveEventsPlayerOfMatch {
  playerName: string;
  teamId: string;
  teamName: string;
  teamFlag: string;
  position: string | null;
}
export interface Team{
    id: string,
    name: string,
    strategy: string,
    formation: string,
    coachName: string,
    coachProfile: string
    teamFlag: string,
}
export interface Summary{
    teamGoals: number,
    opponentGoals: number,
    teamYellowCards: number,
    teamRedCards: number,
    opponentYellowCards: number,
    opponentRedCards: number,
    totalGoals: number
}
