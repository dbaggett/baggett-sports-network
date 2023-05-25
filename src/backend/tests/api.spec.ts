//import supertest from 'supertest'
import { StartedDockerComposeEnvironment } from 'testcontainers'
import { createContainers, truncateTables } from './utils'
import { StartedGenericContainer } from 'testcontainers/dist/src/generic-container/started-generic-container'
import { app } from '../application'
import supertest from 'supertest'

var environment: StartedDockerComposeEnvironment
var db: StartedGenericContainer
var mockoon: StartedGenericContainer

beforeAll(async () => {
  environment = await createContainers()
  db = environment.getContainer('postgres-1')
  mockoon = environment.getContainer('mockoon-1')
}, 180000)

/**beforeEach(async () => {
  const result = await truncateTables()
  console.log(result)
})**/

describe("Environment", () => {

  it('Database should be available', async () => {
    expect(db.getHost()).not.toBeNull()
  })

})

describe("API", () => {
  it('Should return 204 on POST /schedule-check', async () => {
    process.env.NHL_SCHEDULE_URL = `http://${mockoon.getHost()}:${mockoon.getFirstMappedPort()}/api/v1/schedule?result=1`
    process.env.HASURA_METADATA_URL = `http:${mockoon.getHost()}:${mockoon.getFirstMappedPort()}/v1/metadata`
    await supertest(app).post('/schedule-check').expect(204)
  })
})

afterAll(async () => {
  await environment.down({timeout: 30000})
}, 60000)