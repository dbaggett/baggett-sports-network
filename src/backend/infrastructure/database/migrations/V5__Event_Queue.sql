CREATE TABLE IF NOT EXISTS event_queue(
  reference_number text NOT NULL,
  league text NOT NULL,
  CONSTRAINT event_queue_pk PRIMARY KEY (reference_number, league)
)