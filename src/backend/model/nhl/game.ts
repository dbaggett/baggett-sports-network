import { Status } from "./status.js"

export interface LiveGame {
  gamePk: number;
  gameData: GameData;
  liveData: LiveData;
}

export interface GameData {
  status: Status
}

export interface LiveData {
  linescore: LineScore
  boxscore: BoxScore
}

export interface LineScore {
  teams: LineScoreTeams
}

export interface LineScoreTeams {
  away: LineScoreTeam
  home: LineScoreTeam
}

export interface LineScoreTeam {
  goals: number
  shotsOnGoal: number
}

export interface BoxScore {
  teams: BoxScoreTeams
}

export interface BoxScoreTeams {
  away: BoxScoreTeam
  home: BoxScoreTeam
}

export interface BoxScoreTeam {
  team: Team
  teamStats: TeamStats
  players: TeamPlayers
}

export interface Team {
  id: number
  name: string
  abbreviation: string
}

export interface TeamStats {
  teamSkaterStats: TeamSkaterStats
}

export interface TeamSkaterStats {
  goals: number
  pim: number
  shots: number
  hits: number
}

export interface TeamPlayers {
  [key: string]: Player
}

export interface Player {
  person: Person
  jerseyNumber: number
  position: PlayerPosition
  stats: PlayerStats
}

export interface Person {
  id: number
  fullName: string
}

export interface PlayerPosition {
  code: string
  type: string
}

export interface PlayerStats {
  goalieStats?: Stats
  skaterStats?: Stats
}

export interface Stats {
  assists: number
  goals: number
  hits?: number
  pim?: number
  penaltyMinutes?: number
}