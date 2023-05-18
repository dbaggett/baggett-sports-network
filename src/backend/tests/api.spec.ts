//import supertest from 'supertest'
import { StartedDockerComposeEnvironment } from 'testcontainers'
import { createContainers } from './utils/testContainers'
import { StartedGenericContainer } from 'testcontainers/dist/src/generic-container/started-generic-container'
import { app } from '../application'
import supertest from 'supertest'

var environment: StartedDockerComposeEnvironment
var db: StartedGenericContainer

beforeAll(async () => {
  environment = await createContainers()
  db = environment.getContainer('postgres-1')
}, 20000)

describe("Environment", () => {

  it('Database should be available', async () => {
    expect(db.getHost()).not.toBeNull()

  })

})

afterAll(async () => {
  await environment.down({timeout: 30000})
}, 20000)