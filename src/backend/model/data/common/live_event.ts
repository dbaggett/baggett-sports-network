export interface LiveEventRecord {
  id: string,
  status: string,
  player: Player,
  team: Team
}

export interface Player {
  external_id: number,
  name: string,
  age: number,
  number: number,
  designation: string,
  stats: any
}

export interface Team {
  external_id: number,
  name: string,
  abbreviation: string,
  league: string,
  goals: number
}