export interface CurrentStatusResponse {
    teamId: string,
    opponentId: string,
    teamName: string,
    opponentName: string,
    worldCupStatus: string,
    hasActiveFinal: boolean,
    canStartFinal: boolean
}