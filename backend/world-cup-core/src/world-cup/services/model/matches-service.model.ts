import { mappedMatches } from "./matches-service.interface";
import { MatchesResponse } from "./matches-service.interface";
export class MatchesScreen{
    totalMatches: number;
    playedMatches: number;
    pendingMatches: number;
    matches: mappedMatches;
    constructor(totalMatches: number, playedMatches: number, pendingMatches: number, matches: mappedMatches){
        this.totalMatches= totalMatches,
        this.playedMatches = playedMatches;
        this.pendingMatches = pendingMatches;
        this.matches = matches;
    }
}