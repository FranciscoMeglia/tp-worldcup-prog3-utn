import { Tactical } from "./team-state.interface";


export interface MatchApiResponse{
    matchId: string;
    teamId: string;
    teamName: string;
    opponentId: string;
    opponentName: string;
    messageItems: MessageItem[];
    score: string;
    minute: number;
    turn: number;
    zone: string;
    possession: string;
    ballCarrier: string;
    teamStrategy: string;
    teamFormation: string;
    teamCoachName: string;
    teamCoachProfile:string;
    opponentStrategy: string;
    opponentFormation: string;
    opponentCoachName: string;
    opponentCoachProfile: string;
    eventType: string;
    options: Option[];
    isFinished: boolean;
    result: string | null;
    currentContext: CurrentContext
}


interface MessageItem{
    messageKey: string | null;
    type: string;
    text: string;
    minute: number
    turn: number
    teamId: string
    teamName: string
    playerName: string | null
}

interface Option{
    index: number;
    action: string;
    label: string;
}

interface CurrentContext{
    matchId: string;
    turn: number;
    minute: number;
    eventType: string;
    zone: string;
    possession: string;
    userTeamId: string;
    userTeamName: string;
    opponentTeamId: string;
    opponentTeamName: string;
    actingTeamId: string;
    actingTeamName: string;
    defendingTeamId: string;
    defendingTeamName: string;
    actingPlayer: actingPlayer;
    teammatesInZone: actingPlayer[];
    opponentsInZone: actingPlayer[];
    actingOnFieldCount: number;
    defendingOnFieldCount: number;
    tacticalSnapshot: tacticalSnapshot;
    availableActions: MatchActions;
    isPendingSetPiece: boolean;
    isRivalryMatch: boolean;
    lastAction: MatchActions;
    lastOutcome: string;
}


interface actingPlayer{
    playerId: string,
    name: string,
    position: string,
    shirtNumber: number,
    age: number,
    skill: number,
    attack: number,
    defense: number,
    energy: number,
    isCaptain: boolean
}

interface tacticalSnapshot{
    teamStrategy: string;
    teamFormation: string;
    opponentStrategy: string,
    opponentFormation: string;
    teamPenaltyPoints: number;
    opponentPenaltyPoints: number;
    teamLine: Tactical
    opponentLine: Tactical
}

enum MatchActions {
    DRIBBLE= "DRIBBLE",
    HOLD="HOLD",
    PASS="PASS",
    QUIT_MATCH="QUIT_MATCH"
}

export interface SelectedStrategyApiResponse{
    teamId: string,
    strategy: string,
    formation: string,
    formationAutoAdjusted: boolean,
    message: string
}

export interface SelectedFormationApiResponse{
    teamId: string,
    formation: string,
    message: string
}