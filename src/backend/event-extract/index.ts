import got from 'got'
import { Sequelize } from 'sequelize'
import { LiveGame, PlayerStats } from '../model/nhl/game.js'
import { EventContext } from '../model/event_context.js';
import { TeamPlayers } from '../model/nhl/game.js';
import { BoxScoreTeam } from '../model/nhl/game.js';
import { Team } from '../model/data/common/team.js';
import { Player } from '../model/data/common/player.js';
import { Event } from '../model/data/common/event.js';

const POSTGRES_CONNECTION_STRING = process.env.POSTGRES_CONNECTION_STRING || "postgres://postgres:password@127.0.0.1:5432/tracking";

export async function extractEventData(context: EventContext) {
  if (context.referenceNumber) {
    const sequelize = new Sequelize(POSTGRES_CONNECTION_STRING, {})

    const liveData: LiveGame = JSON.parse((await got({
      url: `https://statsapi.web.nhl.com/api/v1/game/${context.referenceNumber}/feed/live`,
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

        await insertTeamPlayer(
          {
            id: liveData.gamePk.toString(),
            status: liveData.gameData.status.abstractGameState
          },
          {
            external_id: team.team.id,
            name: team.team.name,
            abbreviation: team.team.abbreviation,
            league: 'NHL',
            goals: teamGoals
          },
          {
            external_id: player.person.id,
            name: player.person.fullName,
            age: playerRecord.people[0].currentAge as number,
            number: player.jerseyNumber,
            designation: player.position.type,
            stats: {
              goals: goals,
              hits: hits,
              assists: assists,
              pim: pim
            }
          },
          sequelize
        )
      }
    }
  } else {
    console.log('Missing event number')
  }
}

/**
 * Upserts live team and player data.
 * 
 * TODO: Move to repository layer.
 * TODO: Look for the SQL ninja statement that upserts in one commit.
 * 
 * @param eventId 
 * @param team 
 * @param player 
 * @param sql 
 */
async function insertTeamPlayer(event: Event, team: Team, player: Player, sql: Sequelize) {
  const result = await sql.query(
    `BEGIN;
    
    WITH team AS (
      INSERT INTO tracking.team (external_id, name, abbreviation, league)
      VALUES (:team_external_id, :team_name, :abbreviation, :league)
      ON CONFLICT (external_id, league) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    ), player AS (
      INSERT INTO tracking.player (external_id, name, age, number, designation, league)
      VALUES (:player_external_id, :player_name, :age, :number, :designation, :league)
      ON CONFLICT (external_id, league) DO UPDATE SET age = EXCLUDED.age
      RETURNING id
    ), team_player AS (
      INSERT INTO tracking.team_player_xref (team_id, player_id)
      VALUES (
        (SELECT id FROM team),
        (SELECT id FROM player)
      )
      ON CONFLICT (player_id, team_id) DO UPDATE SET established_date = team_player_xref.established_date
      RETURNING id
    ), ins AS (
      INSERT INTO tracking.team_player_game_stats (event_reference_number, team_player_id, stats)
      VALUES (
        :event_id,
        (SELECT id FROM team_player),
        :stats
      )
      ON CONFLICT (event_reference_number, team_player_id) DO UPDATE SET stats = EXCLUDED.stats
    )
    UPDATE tracking.event_participant
    SET score = :score
    WHERE team_id = (SELECT id FROM team);
    
    UPDATE tracking.event SET status = :status WHERE reference_number = :event_id;

    COMMIT;
    `,
    {
      replacements: {
        team_external_id: team.external_id,
        team_name: team.name,
        abbreviation: team.abbreviation,
        league: team.league,
        player_external_id: player.external_id,
        player_name: player.name,
        age: player.age,
        number: player.number,
        designation: player.designation,
        event_id: event.id,
        stats: JSON.stringify(player.stats),
        score: team.goals,
        status: event.status
      }
    }
  )
}