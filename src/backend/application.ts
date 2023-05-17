import express, { Request, Response } from "express"
import { checkSchedule, ScheduleOptions } from "./schedule-check/index.js"
import { extractEventData } from "./event-extract/index.js";
import { retrieveActiveEvents } from "./infrastructure/database/tracking/repository.js";

export const app = express()

app.use(express.json())

app.post('/schedule-check', async (req: Request, res: Response) => {
  try {
    const scheduleOptions: ScheduleOptions = {
      date: req.query.date as string || '',
      season: req.query.season as string || ''
    }

    const result = await checkSchedule(scheduleOptions);

    res.status(204).send()
  } catch (err) {
    console.log(err)
    res.status(500).send()
  }
  
})

app.post('/event-extract', async (req: Request, res: Response) => {
  try {
    const activeEvents = await retrieveActiveEvents(req.query.league as string || 'NHL');

    const events = activeEvents as { reference_number: string, league: string, status: string }[]

    console.log(`Extracting data for ${events.length} events`)

    await Promise.all(events.map(async (event) => {
      await extractEventData(event.reference_number, event.league)
    }))

    res.status(204).send()
  } catch (err) {
    console.log(err)
    res.status(500).send()
  }
})

app.post('/events/:referenceNumber', async (req: Request, res: Response) => {
  try {
    const referenceNumber = req.params.referenceNumber

    const result = await extractEventData(referenceNumber, 'NHL')

    res.status(204).send()
  } catch (err) {
    console.log(err)
    res.status(500).send()
  }
})