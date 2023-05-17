import got from 'got'
import { LiveGame, PlayerStats } from '../model/nhl/game.js'
import { TeamPlayers } from '../model/nhl/game.js';
import { BoxScoreTeam } from '../model/nhl/game.js';
import { upsertLiveEventRecord } from '../infrastructure/database/tracking/repository.js';
import { LiveEventRecord } from '../model/data/common/live_event.js';

export async function extractEventData(eventId: string, league: string) {
  if (league == 'NHL') {
    const liveData: LiveGame = JSON.parse((await got({
      url: `https://statsapi.web.nhl.com/api/v1/game/${eventId}/feed/live`,
      method: 'GET'
    })).body)

    const teams = liveData.liveData.boxscore.teams

    for (const designation of ["away", "home"]) {
      var team: BoxScoreTeam
      var teamGoals: number

      if (designation == "away") {
        team = teams.away
        teamGoals = liveData.liveData.linescore.teams.away.goals
      } else {
        team = teams.home
        teamGoals = liveData.liveData.linescore.teams.home.goals
      }

      const players = team.players
      const playerIds = Object.keys(players)

      for (const playerId of playerIds) {
        const player = players[playerId as keyof TeamPlayers]

        const playerRecord = JSON.parse(
          (await got({
            url: `https://statsapi.web.nhl.com/api/v1/people/${player.person.id}`,
            method: 'GET'
          })).body
        )
        
        const positionalStatKeys = Object.keys(player.stats)

        var goals = 0
        var hits = 0
        var assists = 0
        var pim = 0

        // Yes, players have been a goalie and skater in the same game before
        for (const positionalStatKey of positionalStatKeys) {
          const stats = player.stats[positionalStatKey as keyof PlayerStats]
          goals += stats?.goals || 0
          hits += stats?.hits || 0
          assists += stats?.assists || 0
          pim += stats?.pim || stats?.penaltyMinutes || 0
        }

        const record: LiveEventRecord = {
          id: liveData.gamePk.toString(),
          status: liveData.gameData.status.abstractGameState,
          team: {
            external_id: team.team.id,
            name: team.team.name,
            abbreviation: team.team.abbreviation || '',
            league: 'NHL',
            goals: teamGoals
          },
          player: {
            external_id: player.person.id,
            name: player.person.fullName,
            age: playerRecord.people[0].currentAge as number || 0,
            number: player.jerseyNumber || 0,
            designation: player.position.type,
            stats: {
              goals: goals,
              hits: hits,
              assists: assists,
              pim: pim
            }
          }
        } 

        try {
          console.log(`Upserting event ${record.id} for player ${record.player.external_id} on team ${record.team.external_id}`)
          await upsertLiveEventRecord(record)
        } catch (e) {
          console.log(`Error upserting event ${record.id} for player ${record.player.external_id} on team ${record.team.external_id}: ${e}`)
        }
      }
    }
  } else {
    console.log(`League ${league} not supported yet`)
  }
}