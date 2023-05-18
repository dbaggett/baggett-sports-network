import got from 'got'
import { Schedule } from '../model/nhl/schedule.js'
import { upsertQueuedEvent, upsertScheduledEvent } from '../infrastructure/database/tracking/repository.js';
import { setScheduledEvent } from '../infrastructure/hasura/api/metadata.js';

export async function checkSchedule(scheduleOptions: ScheduleOptions = {}) {
  const scheduleFeed = await got({
    url: `https://statsapi.web.nhl.com/api/v1/schedule`,
    method: 'GET',
    searchParams: {
      date: scheduleOptions.date,
      season: scheduleOptions.season
    }
  })

  console.log(scheduleOptions)

  const schedule: Schedule = JSON.parse(scheduleFeed.body)

  for (const date of schedule.dates) {
    for (const game of date.games) {
      if (scheduleOptions.season !== undefined || scheduleOptions.date !== undefined) {
        await upsertQueuedEvent(game)
      } else {
        // Upsert event for tracking
        await upsertScheduledEvent(game)

        // Set scheduled event for continued processing
        await setScheduledEvent(game.gamePk.toString())
      }
    }
  }
}

export interface ScheduleOptions {
  date?: string,
  season?: string
}