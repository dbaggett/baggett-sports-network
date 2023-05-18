import express, { Request, Response } from "express"
import { checkSchedule, ScheduleOptions } from "./schedule-check/index.js"
import { extractEventData } from "./event-extract/index.js";
import { retrieveQueuedEvents } from "./infrastructure/database/tracking/repository.js";

export const app = express()

app.use(express.json())

/**
 * Checks live event schedule and stages events for future processing.
 */
app.post('/schedule-check', async (req: Request, res: Response) => {
  try {
    const scheduleOptions: ScheduleOptions = {
      date: req.query.date as string,
      season: req.query.season as string
    }

    await checkSchedule(scheduleOptions);

    res.status(204).send()
  } catch (err) {
    console.log(err)
    res.status(500).send()
  }
  
})

/**
 * Search from queued events placed into the database by retro active
 * schedule checks i.e. by season or specific date.
 */
app.post('/event-extraction', async (req: Request, res: Response) => {
  try {
    const queuedEvents = await retrieveQueuedEvents(req.query.league as string || 'NHL');

    console.log(`Extracting data for ${queuedEvents.length} events`)

    // Process all events concurrently
    await Promise.all(queuedEvents.map(async (event) => {
      await extractEventData(event.reference_number, event.league, true)
    }))

    res.status(204).send()
  } catch (err) {
    console.log(err)
    res.status(500).send()
  }
})

/**
 * Extracts live event data for a specific event.
 */
app.post('/events/:referenceNumber', async (req: Request, res: Response) => {
  try {
    const referenceNumber = req.params.referenceNumber

    // Extract event, team and player information
    await extractEventData(referenceNumber, 'NHL')

    res.status(204).send()
  } catch (err) {
    console.log(err)
    res.status(500).send()
  }
})