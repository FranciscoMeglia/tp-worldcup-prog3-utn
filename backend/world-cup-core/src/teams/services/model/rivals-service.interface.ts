// src/teams/services/model/rivals-service.interface.ts

export interface BaseRival {
  id?: string;
  name?: string;
}

export interface RivalTeamDetails {
  id?: string;
  teamId?: string;
  name?: string;
  groupName?: string;
  footballAssociation?: string; 
  rating?: number;              
  coach?: string;              
  captain?: string;             
  strategy?: string;            
  formation?: string;           
  flag?: string;
}

export interface RivalCoach {
  name?: string;
}


