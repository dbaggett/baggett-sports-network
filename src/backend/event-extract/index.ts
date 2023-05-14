import got from 'got'
import { Sequelize } from 'sequelize'
import { LiveGame } from '../model/nhl/game.js'
import { EventContext } from '../model/event_context.js';

const POSTGRES_CONNECTION_STRING = process.env.POSTGRES_CONNECTION_STRING || "postgres://postgres:password@127.0.0.1:5432/tracking";

export async function extractEventData(context: EventContext) {
  if (context.referenceNumber) {
    const liveDataFeed = await got({
      url: `https://statsapi.web.nhl.com/api/v1/game/${context.referenceNumber}/feed/live`,
      method: 'GET'
    })

    const liveData: LiveGame = JSON.parse(liveDataFeed.body)

    console.log(liveData.liveData.boxscore.teams.away.teamStats.teamSkaterStats.goals)
    console.log(Object.keys(liveData.liveData.boxscore.teams.away.players))
  } else {
    console.log('Missing event number')
  }
}