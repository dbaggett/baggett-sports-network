import { StartedDockerComposeEnvironment, DockerComposeEnvironment } from 'testcontainers'

const buildPath = './'
const composeFile = 'docker-compose-db.yaml'

export async function createContainers(): Promise<StartedDockerComposeEnvironment> {
  const environment = new DockerComposeEnvironment(
    buildPath,
    [
      composeFile
    ]
  )

  return await environment.up()
}