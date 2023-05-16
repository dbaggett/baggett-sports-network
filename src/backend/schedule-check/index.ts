import got from 'got'
import { Schedule } from '../model/nhl/schedule.js'
import { EventContext } from '../model/event_context.js';
import { upsertScheduledEvents } from '../database/tracking/repository.js';

export async function checkSchedule(context: EventContext) {
  const query = context.time ? `?date=${context.time}` : ''

  console.log(query)

  const scheduleFeed = await got({
    url: `https://statsapi.web.nhl.com/api/v1/schedule${query}`,
    method: 'GET'
  })

  const schedule: Schedule = JSON.parse(scheduleFeed.body)

  console.log(schedule)

  for (const date of schedule.dates) {
    for (const game of date.games) {
      await upsertScheduledEvents(game)
    }
  }
}