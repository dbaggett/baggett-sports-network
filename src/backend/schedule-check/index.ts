import got from 'got'
import { Sequelize } from 'sequelize'
import { Schedule } from '../model/nhl/schedule.js'
import { EventContext, ExecutionType } from '../model/event_context.js';

const POSTGRES_CONNECTION_STRING = process.env.POSTGRES_CONNECTION_STRING || "postgres://postgres:password@127.0.0.1:5432/tracking";

export async function checkSchedule(context: EventContext) {
  const scheduleFeed = await got({
    url: 'https://statsapi.web.nhl.com/api/v1/schedule',
    method: 'GET'
  })

  const sequelize = new Sequelize(POSTGRES_CONNECTION_STRING, {})

  const schedule: Schedule = JSON.parse(scheduleFeed.body)

  for (const date of schedule.dates) {
    for (const game of date.games) {
      if (game.status.abstractGameState == "Live") {
        const result = await sequelize.query(`BEGIN;
        INSERT INTO events (date, reference_number, status, league) values (:date, :reference_number, :status, 'NHL') RETURNING id into event_id;
        INSERT INTO event_participants (name, designation, score, event_id) (:home_team, 'HOME', :home_score, event_id);
        INSERT INTO event_participants (name, designation, score, event_id) (:away_team, 'AWAY', :away_score, event_id);
        COMMIT;
        `,
        {
          replacements: {
            date: game.gameDate.toISOString(),
            reference_number: game.gamePk.toString(),
            status: game.status.abstractGameState,
            home_team: game.teams.home.team.name,
            home_score: game.teams.home.score,
            away_team: game.teams.away.team.name,
            away_score: game.teams.away.score
          }
        })
      }
    }
  }
}