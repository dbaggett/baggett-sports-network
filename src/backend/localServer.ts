import express, { Request, Response } from "express"
import { checkSchedule } from "./schedule-check/index.js"
import { extractEventData } from "./event-extract/index.js";
import { EventContext, ExecutionType } from './model/event_context.js';

const app = express()

app.use(express.json())

app.post('/schedule-check', async (req: Request, res: Response) => {
  try {
    var context: EventContext;

    if (req.body.event !== undefined) {
      // nothing done with event body just yet
      context = {
        trigger: ExecutionType.SCHEDULED
      }
    } else {
      context = {
        trigger: ExecutionType.MANUAL,
        time: req.body.time
      }
    }

    const result = await checkSchedule(context);

    res.status(204).send()
  } catch (err) {
    console.log(err)
    res.status(500).send()
  }
  
})

app.post('/event-extract', async (req: Request, res: Response) => {
  try {
    var context: EventContext;

    if (req.body.event !== undefined) {
      // nothing done with event body just yet
      context = {
        trigger: ExecutionType.SCHEDULED
      }
    } else {
      context = {
        trigger: ExecutionType.MANUAL,
        referenceNumber: req.body.referenceNumber
      }
    }

    const result = await extractEventData(context)

    res.status(204).send()
  } catch (err) {
    console.log(err)
    res.status(500).send()
  }
})

app.listen(8020, () => {
  console.log(`server started at http://localhost:8020`)
})