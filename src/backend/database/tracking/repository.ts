import { Game } from "../../model/nhl/schedule.js";
import { sequelize } from "../static/data.js";
import { LiveEventRecord } from "../../model/data/common/live_event.js";

/**
 * Upsert scheduled event (game).
 * 
 * @param game 
 */
export async function upsertScheduledEvents(game: Game) {
  const result = await sequelize.query(
    `BEGIN;

    WITH home_team AS (
      INSERT INTO tracking.team (external_id, name, abbreviation, league)
      VALUES (:home_team_id, :home_team_name, :home_abbreviation, :league)
      ON CONFLICT (external_id, league) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    ), away_team AS (
      INSERT INTO tracking.team (external_id, name, abbreviation, league)
      VALUES (:away_team_id, :away_team_name, :away_abbreviation, :league)
      ON CONFLICT (external_id, league) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    ), tracked_event AS (
      INSERT INTO tracking.event (date, reference_number, status, league)
      VALUES (:date, :reference_number, :status, :league)
      ON CONFLICT (league, reference_number) DO UPDATE SET status = EXCLUDED.status
      RETURNING id
    )
    INSERT INTO tracking.event_participant (team_id, designation, score, event_id)
    VALUES
      ((SELECT id FROM home_team), 'HOME', :home_score, (SELECT id FROM tracked_event)),
      ((SELECT id FROM away_team), 'AWAY', :away_score, (SELECT id FROM tracked_event))
    ON CONFLICT (event_id, team_id) DO NOTHING;

    COMMIT;
    `,
    {
      replacements: {
        date: game.gameDate.toString(),
        reference_number: game.gamePk.toString(),
        status: game.status.abstractGameState,
        home_team_id: game.teams.home.team.id,
        home_team_name: game.teams.home.team.name,
        home_abbreviation: '',
        home_score: game.teams.home.score,
        away_team_id: game.teams.away.team.id,
        away_team_name: game.teams.away.team.name,
        away_abbreviation: '',
        away_score: game.teams.away.score,
        league: 'NHL'
      }
    })
}

/**
 * Upserts live team and player data.
 * 
 * @param eventId 
 * @param team 
 * @param player 
 * @param sql 
 */
export async function upsertLiveEventRecord(liveEventRecord: LiveEventRecord) {
  const result = await sequelize.query(
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
        team_external_id: liveEventRecord.team.external_id,
        team_name: liveEventRecord.team.name,
        abbreviation: liveEventRecord.team.abbreviation,
        league: liveEventRecord.team.league,
        player_external_id: liveEventRecord.player.external_id,
        player_name: liveEventRecord.player.name,
        age: liveEventRecord.player.age,
        number: liveEventRecord.player.number,
        designation: liveEventRecord.player.designation,
        event_id: liveEventRecord.id,
        stats: JSON.stringify(liveEventRecord.player.stats),
        score: liveEventRecord.team.goals,
        status: liveEventRecord.status
      }
    }
  )
}