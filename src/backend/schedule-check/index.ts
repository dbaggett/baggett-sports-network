import got from 'got'
import { Schedule } from '../model/nhl/schedule'
import { upsertQueuedEvent, upsertScheduledEvent } from '../infrastructure/database/tracking/repository';
import { setScheduledEvent } from '../infrastructure/hasura/api/metadata';

export async function checkSchedule(scheduleOptions: ScheduleOptions = {}) {
  const scheduleFeed = await got({
    url: process.env.NHL_SCHEDULE_URL || `https://statsapi.web.nhl.com/api/v1/schedule`,
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