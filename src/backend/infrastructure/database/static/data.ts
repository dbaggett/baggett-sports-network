import { Sequelize } from 'sequelize'

export const sequelize = new Sequelize({
  logging: false,
  dialect: 'postgres',
  database: process.env.POSTGRES_DATABASE || 'tracking',
  host: process.env.POSTGRES_HOST || '127.0.0.1',
  port: Number(process.env.POSTGRES_PORT) || 5432,
  username: process.env.POSTGRES_USERNAME || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'password',
  pool: {
    max: 5,
    min: 2,
    idle: 10000
  }
})