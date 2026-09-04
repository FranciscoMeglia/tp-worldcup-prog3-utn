import { Summary, Team } from "./match-response.interface"

export interface Event{
    statId: number,
    minute: number,
    turn: number,
    eventType: string,
    zone: string,
    action: string,
    teamId: string,
    teamName: string,
    playerName: string,
    cardType: null,
    isGoal: boolean,
    message: string,
    creationDate: string
}


export interface LiveEventResponse{
    matchId: string,
    isActive: boolean,
    isFinished: boolean,
    minute: number,
    turn: number,
    score: string,
    team: Team,
    opponent: Team,
    summary: Summary,
    events: Event[]
}

