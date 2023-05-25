import { StartedDockerComposeEnvironment, DockerComposeEnvironment, Wait } from 'testcontainers'
import { sequelize } from '../../infrastructure/database/static/data'

const buildPath = './'
const composeFile = 'docker-compose-db.yaml'

export async function createContainers(): Promise<StartedDockerComposeEnvironment> {
  const environment = new DockerComposeEnvironment(
    buildPath,
    [
      composeFile
    ]
  )
  .withWaitStrategy("migration-1", Wait.forLogMessage('A Flyway report has been generated here'))

  return await environment.up()
}

export async function truncateTables() {
  const result = await sequelize.query(`BEGIN;

  TRUNCATE tracking.event_queue RESTART IDENTITY CASCADE;
  TRUNCATE tracking.team_player_game_stats RESTART IDENTITY CASCADE;
  TRUNCATE tracking.team_player_xref RESTART IDENTITY CASCADE;
  TRUNCATE tracking.player RESTART IDENTITY CASCADE;
  TRUNCATE tracking.team RESTART IDENTITY CASCADE;
  TRUNCATE tracking.event_participant RESTART IDENTITY CASCADE;
  TRUNCATE tracking.event RESTART IDENTITY CASCADE;

  COMMIT;
  `)

  return result
}