import got from 'got'
import { Sequelize } from 'sequelize'
import { Schedule } from '../model/nhl/schedule.js'
import { EventContext } from '../model/event_context.js';

const POSTGRES_CONNECTION_STRING = process.env.POSTGRES_CONNECTION_STRING || "postgres://postgres:password@127.0.0.1:5432/tracking";

export async function checkSchedule(context: EventContext) {
  const query = context.time ? `?date=${context.time}` : ''

  console.log(query)

  const scheduleFeed = await got({
    url: `https://statsapi.web.nhl.com/api/v1/schedule${query}`,
    method: 'GET'
  })

  const sequelize = new Sequelize(POSTGRES_CONNECTION_STRING, {})

  const schedule: Schedule = JSON.parse(scheduleFeed.body)

  console.log(schedule)

  for (const date of schedule.dates) {
    for (const game of date.games) {
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
  }
}