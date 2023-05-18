import got from 'got'

// Sets a scheduled job to reprocess the event
export async function setScheduledEvent(eventId: string) {
  console.log(`Setting scheduled event trigger for event: ${eventId}`)

  const currentDateTime = new Date()

  // Create a scheduled event for 1 minute in the future
  await got({
    url: 'http://graphql-engine:8080/v1/metadata',
    method: 'POST',
    json: {
      type: 'create_scheduled_event',
      args: {
        webhook: `http://bspn-api:8020/events/${eventId}`,
        schedule_at: new Date(currentDateTime.getTime() + 60000)
      }
    }
  })
}