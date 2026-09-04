// segundo modelado (PROVISORIO) de la pantalla de historial de mundiales simulados


export class WorldCupHistoryScreenModel {
  public teamId: string;
  public lang: 'es' | 'en';
  public totalWorldCups: number;
  public worldCups: HistoricalWorldCupItem[];

  constructor(data: {
    teamId: string;
    lang: 'es' | 'en';
    totalWorldCups: number;
    worldCups: HistoricalWorldCupItem[];
  }) {
    this.teamId = data.teamId;
    this.lang = data.lang;
    this.totalWorldCups = data.totalWorldCups;
    this.worldCups = data.worldCups;
  }
}

export class HistoricalWorldCupItem {
  public worldCupId: string;
  public worldCupIdShort: string;
  public finalPlayedAt: string | null;
  public finalPlayedAtLabel: string | null;
  public edition: number;
  public editionLabel: string;
  public status: string;
  public statusLabel: string;
  public champion: HistoricalPodiumTeamItem;
  public runnerUp: HistoricalPodiumTeamItem;
  public thirdPlace: HistoricalPodiumTeamItem;
  public fourthPlace: HistoricalPodiumTeamItem;
  public totalMatches: number;
  public totalGoals: number;
  public avgGoalsPerMatch: number;
  public yellowCards: number;
  public redCards: number;
  public finalScoreLabel: string;
  public finalResolutionLabel: string;
  public topScorer: HistoricalPlayerHighlightItem;
  public topAssist: HistoricalPlayerHighlightItem;
  public fairPlay: HistoricalFairPlayHighlightItem;
  public worstFairPlay: HistoricalFairPlayHighlightItem;

  constructor(data: {
    worldCupId: string;
    worldCupIdShort: string;
    finalPlayedAt: string | null;
    finalPlayedAtLabel: string | null;
    edition: number;
    editionLabel: string;
    status: string;
    statusLabel: string;
    champion: HistoricalPodiumTeamItem;
    runnerUp: HistoricalPodiumTeamItem;
    thirdPlace: HistoricalPodiumTeamItem;
    fourthPlace: HistoricalPodiumTeamItem;
    totalMatches: number;
    totalGoals: number;
    avgGoalsPerMatch: number;
    yellowCards: number;
    redCards: number;
    finalScoreLabel: string;
    finalResolutionLabel: string;
    topScorer: HistoricalPlayerHighlightItem;
    topAssist: HistoricalPlayerHighlightItem;
    fairPlay: HistoricalFairPlayHighlightItem;
    worstFairPlay: HistoricalFairPlayHighlightItem;
  }) {
    this.worldCupId = data.worldCupId;
    this.worldCupIdShort = data.worldCupIdShort;
    this.finalPlayedAt = data.finalPlayedAt;
    this.finalPlayedAtLabel = data.finalPlayedAtLabel;
    this.edition = data.edition;
    this.editionLabel = data.editionLabel;
    this.status = data.status;
    this.statusLabel = data.statusLabel;
    this.champion = data.champion;
    this.runnerUp = data.runnerUp;
    this.thirdPlace = data.thirdPlace;
    this.fourthPlace = data.fourthPlace;
    this.totalMatches = data.totalMatches;
    this.totalGoals = data.totalGoals;
    this.avgGoalsPerMatch = data.avgGoalsPerMatch;
    this.yellowCards = data.yellowCards;
    this.redCards = data.redCards;
    this.finalScoreLabel = data.finalScoreLabel;
    this.finalResolutionLabel = data.finalResolutionLabel;
    this.topScorer = data.topScorer;
    this.topAssist = data.topAssist;
    this.fairPlay = data.fairPlay;
    this.worstFairPlay = data.worstFairPlay;
  }
}


export class HistoricalPodiumTeamItem {
  public teamId: string;
  public teamName: string;
  public flag: string;
  public hasData: boolean;

  constructor(data: { 
    teamId: string; 
    teamName: string; 
    flag: string; 
    hasData: boolean 
  }) {
    this.teamId = data.teamId;
    this.teamName = data.teamName;
    this.flag = data.flag;
    this.hasData = data.hasData;
  }
}

export class HistoricalPlayerHighlightItem {
  public playerName: string;
  public teamId: string;
  public teamName: string;
  public teamFlag: string;
  public value: number;
  public hasData: boolean;

  constructor(data: {
    playerName: string;
    teamId: string;
    teamName: string;
    teamFlag: string;
    value: number;
    hasData: boolean;
  }) {
    this.playerName = data.playerName;
    this.teamId = data.teamId;
    this.teamName = data.teamName;
    this.teamFlag = data.teamFlag;
    this.value = data.value;
    this.hasData = data.hasData;
  }
}

export class HistoricalFairPlayHighlightItem {
  public teamId: string;
  public teamName: string;
  public teamFlag: string;
  public fairPlayPoints: number;
  public yellowCards: number;
  public redCards: number;
  public fairPlayRank: number;
  public totalRankedTeams: number;
  public hasData: boolean;

  constructor(data: {
    teamId: string;
    teamName: string;
    teamFlag: string;
    fairPlayPoints: number;
    yellowCards: number;
    redCards: number;
    fairPlayRank: number;
    totalRankedTeams: number;
    hasData: boolean;
  }) {
    this.teamId = data.teamId;
    this.teamName = data.teamName;
    this.teamFlag = data.teamFlag;
    this.fairPlayPoints = data.fairPlayPoints;
    this.yellowCards = data.yellowCards;
    this.redCards = data.redCards;
    this.fairPlayRank = data.fairPlayRank;
    this.totalRankedTeams = data.totalRankedTeams;
    this.hasData = data.hasData;
  }
}
