CREATE TABLE IF NOT EXISTS event(
  id serial NOT NULL,
  date text NOT NULL,
  reference_number text NOT NULL,
  status text NOT NULL,
  league text NOT NULL,
  CONSTRAINT event_pk PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS event_participant(
  id serial NOT NULL,
  name text NOT NULL,
  designation text NOT NULL,
  score integer NOT NULL,
  event_id integer NOT NULL,
  CONSTRAINT event_participant_pk PRIMARY KEY (id)
);

ALTER TABLE event_participant DROP CONSTRAINT IF EXISTS event_participant_event_fk CASCADE;
ALTER TABLE event_participant ADD CONSTRAINT event_participant_event_fk FOREIGN KEY (event_id)
REFERENCES event (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;