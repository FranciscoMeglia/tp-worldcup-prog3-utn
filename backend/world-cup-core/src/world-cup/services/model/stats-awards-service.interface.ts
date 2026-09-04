export interface TeamSummaryApiItem {
    teamId: string;
    teamName: string;
}

export interface PlayerApiItem {
    playerName: string;
    teamId: string;
    teamName: string;
    value: number;
}

export interface CardsApiItem {
    totalYellowCards: number;
    totalRedCards: number;
}

export interface CurrentStatsApiResponse {
    totalMatches: number;
    totalGoals: number;
    avgGoalsPerMatch: number;
    champion: TeamSummaryApiItem;
    runnerUp: TeamSummaryApiItem;
    thirdPlace: TeamSummaryApiItem;
    fourthPlace: TeamSummaryApiItem;
    topScorers: PlayerApiItem[];
    topAssists: PlayerApiItem[];
    bestGoalkeepers: PlayerApiItem[];
    cleanSheetsLeaders: PlayerApiItem[];
    topPlayerOfMatch: PlayerApiItem;
    cards: CardsApiItem;
}
export interface AwardsApiItem {
    code: string;
    winnerName: string;
    teamId: string;
    teamName: string;
    reason: string;

    goals?: number;
    playerOfMatch?: number;

    fairPlayPoints?: number;
    yellowCards?: number;
    redCards?: number;
}

export interface WorldCupStatsAwardsApiResponse {
    teamId: string;
    lang: 'es' | 'en';
    worldCupId: string | null;
    totalMatches: number;
    totalGoals: number;
    avgGoalsPerMatch: number;
    totalYellowCards: number;
    totalRedCards: number;
    podium: TeamSummaryApiItem[]; 
    topScorers: PlayerApiItem[];
    topAssists: PlayerApiItem[];
    awards: AwardsApiItem[];
}

export interface StatsPodiumItem {
    place: 'CHAMPION' | 'RUNNER_UP' | 'THIRD_PLACE' | 'FOURTH_PLACE';
    placeLabel: string;
    medal: string;
    teamId: string;
    teamName: string;
    flag: string;
}

export interface StatsLeaderboardItem {
    rank: number;
    playerName: string;
    teamId: string;
    teamName: string;
    teamFlag: string;
    value: number;
}

export interface StatsAwardItem {
    code: string;
    title: string;
    icon: string;
    winnerName: string;
    teamId: string;
    teamName: string;
    teamFlag: string;
    reason: string;
}




