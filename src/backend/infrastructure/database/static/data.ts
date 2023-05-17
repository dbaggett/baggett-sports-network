import { Sequelize } from 'sequelize'

const POSTGRES_CONNECTION_STRING = process.env.POSTGRES_CONNECTION_STRING || "postgres://postgres:password@127.0.0.1:5432/tracking";

export const sequelize = new Sequelize(POSTGRES_CONNECTION_STRING, {
  logging: false
})