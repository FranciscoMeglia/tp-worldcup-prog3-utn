// src/teams/services/model/rivals-service.model.ts

export class RivalsScreenModel {
  public teamId: string;
  public totalRivals: number;
  public rivals: RivalTitleItemModel[];

  constructor(data: { teamId: string; totalRivals: number; rivals: RivalTitleItemModel[] }) {
    this.teamId = data.teamId;
    this.totalRivals = data.totalRivals;
    this.rivals = data.rivals;
  }
}

export class RivalTitleItemModel {
  public id: string;
  public name: string;
  public flag: string;
  public confederation: string;
  public overallRating: number;
  public captain: string;
  public strategy: string;
  public formation: string;
  public coachName: string;

  constructor(data: {
    id: string;
    name: string;
    flag: string;
    confederation: string;
    overallRating: number;
    captain: string;
    strategy: string;
    formation: string;
    coachName: string;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.flag = data.flag;
    this.confederation = data.confederation;
    this.overallRating = data.overallRating;
    this.captain = data.captain;
    this.strategy = data.strategy;
    this.formation = data.formation;
    this.coachName = data.coachName;
  }
}

