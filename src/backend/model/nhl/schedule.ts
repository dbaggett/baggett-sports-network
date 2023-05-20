import { Status } from "./status"

export interface Schedule {
  copyright:    string;
  totalItems:   number;
  totalEvents:  number;
  totalGames:   number;
  totalMatches: number;
  metaData:     MetaData;
  wait:         number;
  dates:        DateElement[];
}

export interface DateElement {
  date:         Date;
  totalItems:   number;
  totalEvents:  number;
  totalGames:   number;
  totalMatches: number;
  games:        Game[];
}

export interface Game {
  gamePk:   number;
  link:     string;
  gameType: string;
  season:   string;
  gameDate: Date;
  status:   Status;
  teams:    Teams;
  venue:    Venue;
  content:  Content;
}

export interface Content {
  link: string;
}

export interface Teams {
  away: Team;
  home: Team;
}

export interface Team {
  leagueRecord: LeagueRecord;
  score:        number;
  team:         Venue;
}

export interface LeagueRecord {
  wins:   number;
  losses: number;
  type:   string;
}

export interface Venue {
  id?:  number;
  name: string;
  link: string;
}

export interface MetaData {
  timeStamp: string;
}