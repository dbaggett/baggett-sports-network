ALTER TABLE player
ADD COLUMN league text NOT NULL;

CREATE UNIQUE INDEX player_indx
ON player(external_id, league);