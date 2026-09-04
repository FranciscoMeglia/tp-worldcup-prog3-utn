
import {LiveEventsPlayerOfMatch, Summary, Team } from "./match-response.interface";

export interface EventModel{
    statId: number,
    minute: number,
    minuteLabel: string;
    turn: number,
    type: string,
    style: string;
    icon: string,
    text: string,
    teamId: string,
    teamName: string,
    playerName: string,
}

export class LiveEventModel{
    public teamId: string;
    public lang: string;
    public matchId: string;
    public isActive: boolean;
    public isFinished: boolean;
    public minute: number;
    public turn: number;
    public zone: string;
    public score: string;
    public team: Team;
    public opponent: Team;
    public summary: Summary;
    public playerOfMatch: LiveEventsPlayerOfMatch; 
    public events: EventModel[];


    constructor(data: {
        lang: string;
        teamId: string;
        matchId: string;
        isActive: boolean;
        isFinished: boolean;
        minute: number;
        turn: number;
        zone: string;
        score: string;
        team: Team;
        opponent: Team;
        summary: Summary;
        player: LiveEventsPlayerOfMatch;
        events: EventModel[];
        }
    ){
        this.lang = data.lang;
        this.teamId = data.teamId;
        this.matchId = data.matchId;
        this.isActive = data.isActive;
        this.isFinished = data.isFinished;
        this.minute = data.minute;
        this.turn = data.turn;
        this.zone = data.zone;
        this.score = data.score;
        this.team = data.team;
        this.opponent = data.opponent;
        this.summary = data.summary;
        this.playerOfMatch = data.player;
        this.events = data.events;
    }
}