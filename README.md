# Baggett Sports Network (BSPN)
Taking the __BS__ out of sports, well... just hockey for the moment.

## Requirements
* Docker
* docker-compose
* *nix system (makes things a little easier)

## Technology
* TypeScript - language
* Express - API framework
* Postgres - SQL database
* Hasura - scheduling and GraphQL queries

## Running
### Simple method
Execute the `run.sh` script located under the `src/backend` directory.
```sh
./run.sh
```
### Manually
Basically just repeat the steps in `run.sh` (minus the healtcheck logic).

1) From the `src/backend` directory (add the `-d` flag if you want to run in the background):
    ```
    docker-compose -f docker-compose-e2e.yaml up
    ```
2) From the `src/backend` directory, create the cron triggers
   * Queued event extractor:
       ```
       curl -d @./infrastructure/hasura/triggers/event_check.json  -H 'Content-Type: application/json' localhost:8080/v1/metadata
       ```
    
Run `docker-compose -f docker-compose-e2e.yaml down` to stop the containers, if necessary.

## Testing
`npm run test`

_Basic integration tests setup using Testcontainers. A __WIP__ as setup time is environment bound currently._

## Logs
Logs can be viewed by watching the BSPN API container.

```docker logs --follow backend-bspn-api-1```

### Notable Logs

#### Server Started Log
```server started at http://localhost:8020```

#### Queued Event Scheduled Run
```Extracting data for {number} events```

#### Schedule Check (current)
```
Upserting scheduled event {event_id}
Setting scheduled event trigger for event: {event_id}
```

## Checking the Schedule
The most common use case is to monitor the live schedule which can be done via a POST to `/schedule-check`. This will set up a scheduled event
to monitor the scheduled events, if any.

## Architecture
## API
The API is available at http://localhost:8020 and mostly reserved for scheduled invocation via Hasura cron/scheduled events.

* `POST /schedule-check` - checks todays schedule and upserts events (games) to the database
* `POST /schedule-check?season=20172018` - upserts events for a specific season
* `POST /schedule-check?date=2023-04-18` - upserts events for a specific date
* `POST /event-extraction` - for ingesting queued events
* `POST /events/{referenceNumber}` - for ingesting a specific event

Events are queued when pulled for a season or specific date as the volume may be quite large.

TODO: Create OpenAPI documentation.

## Database
The database is made available to the host at port `5432`. Check the docker-compose file for connection details if you would like to connect to the database directly.

### Tables
* `event` - holds games
* `event_participant` - holds teams in a game
* `team` - team information
* `player` - player information
* `team_player_xref` - links team and player (many-to-many)
* `team_player_game_stats` - game stats for player on a specific team
* `event_queue` - holds games queued for scheduled ingest

## Hasura
Hasura is used as an event scheduler and provides a GraphQL interface for the ingested data. It's available at http://localhost:8080. An embedded GraphiQL editor awaits.

Note: The table metadata located at `/infrastructure/hasura/tables/metadata.json` must be applied to execute GraphQL queries. Done for you when executing the `run.sh` script.

## Example Queries
_Data may vary depending on information ingested._

### Live Game Scores
_Create a subscription to have your own score ticker._
```
{
  tracking_event(where: {status: {_eq: "Live"}}) {
    status
    date
    event_participants {
      score
      designation
      team {
        name
      }
    }
  }
}
```

### Listing Teams
```
{
  tracking_team {
    name
  }
}
```

### Listing Players and their respective teams
```
{
  tracking_player {
    name
    team_player_xrefs {
      team {
        name
      }
    }
  }
}
```

### Player Game Stats
```
{
  tracking_player(where: {team_player_xrefs: { team_player_game_stats: { event_reference_number: { _eq: "2022030171" } }}}) {
    name
    team_player_xrefs {
      team_player_game_stats {
        stats
        event_reference_number
      }
    }
  }
}
```

### Player Team Stats per Game
```
{
  tracking_player(where: {team_player_xrefs: { team: { name: { _eq: "Winnipeg Jets" } }}}) {
    name
    team_player_xrefs {
      team {
        name
      }
      team_player_game_stats {
        event_reference_number
        stats
      }
    }
  }
}
```

OR, create your own.