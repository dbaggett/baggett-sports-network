import got from 'got'
import { Schedule } from '../model/nhl/schedule.js'
import { upsertScheduledEvent } from '../infrastructure/database/tracking/repository.js';

export async function checkSchedule(scheduleOptions: ScheduleOptions = {}) {
  const scheduleFeed = await got({
    url: `https://statsapi.web.nhl.com/api/v1/schedule`,
    method: 'GET',
    searchParams: {
      date: scheduleOptions.date,
      season: scheduleOptions.season
    }
  })

  const schedule: Schedule = JSON.parse(scheduleFeed.body)

  for (const date of schedule.dates) {
    for (const game of date.games) {
      console.log(`Upserting scheduled event ${game.gamePk}`)
      await upsertScheduledEvent(game)
    }
  }
}

export interface ScheduleOptions {
  date?: string,
  season?: string
}