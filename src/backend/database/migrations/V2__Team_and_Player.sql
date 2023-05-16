CREATE UNIQUE INDEX event_reference_number_indx
ON event(league, reference_number);

ALTER TABLE event_participant
ADD COLUMN team_id integer NOT NULL,
DROP COLUMN name;

CREATE TABLE IF NOT EXISTS team(
  id serial NOT NULL,
  external_id integer NOT NULL,
  name text NOT NULL,
  abbreviation text,
  league text NOT NULL,
  CONSTRAINT team_pk PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS player(
  id serial NOT NULL,
  external_id integer NOT NULL,
  name text NOT NULL,
  age integer NOT NULL,
  number integer NOT NULL,
  designation text NOT NULL,
  CONSTRAINT player_pk PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS team_player_xref(
  id serial NOT NULL,
  team_id integer NOT NULL,
  player_id integer NOT NULL,
  established_date date DEFAULT CURRENT_DATE,
  CONSTRAINT team_player_pk PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS team_player_game_stats(
  id serial NOT NULL,
  event_reference_number text NOT NULL,
  team_player_id integer NOT NULL,
  stats jsonb NOT NULL,
  CONSTRAINT team_player_stat_pk PRIMARY KEY (id)
);

CREATE UNIQUE INDEX event_participant_team_indx
ON event_participant(event_id, team_id);

CREATE UNIQUE INDEX team_indx
ON team(external_id, league);

CREATE UNIQUE INDEX team_player_indx
ON team_player_xref(player_id, team_id);

CREATE UNIQUE INDEX team_player_game_stat_indx
ON team_player_game_stats(event_reference_number, team_player_id);

ALTER TABLE event_participant DROP CONSTRAINT IF EXISTS event_participant_team_fk CASCADE;
ALTER TABLE event_participant ADD CONSTRAINT event_participant_team_fk FOREIGN KEY (team_id)
REFERENCES team (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE team_player_xref DROP CONSTRAINT IF EXISTS team_player_team_fk CASCADE;
ALTER TABLE team_player_xref ADD CONSTRAINT team_player_team_fk FOREIGN KEY (team_id)
REFERENCES team (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE team_player_xref DROP CONSTRAINT IF EXISTS team_player_player_fk CASCADE;
ALTER TABLE team_player_xref ADD CONSTRAINT team_player_player_fk FOREIGN KEY (team_id)
REFERENCES player (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE team_player_game_stats DROP CONSTRAINT IF EXISTS player_stats_team_player_fk CASCADE;
ALTER TABLE team_player_game_stats ADD CONSTRAINT player_stats_team_player_fk FOREIGN KEY (team_player_id)
REFERENCES team_player_xref (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;