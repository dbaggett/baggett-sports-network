import { Sequelize } from 'sequelize'

export const sequelize = new Sequelize({
  logging: false,
  dialect: 'postgres',
  database: process.env.POSTGRES_DATABASE || 'tracking',
  host: process.env.POSTGRES_HOST || 'postgres',
  port: Number(process.env.POSTGRES_PORT) || 5432,
  username: process.env.POSTGRES_USERNAME || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'password',
})