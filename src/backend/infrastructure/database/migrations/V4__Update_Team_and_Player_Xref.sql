ALTER TABLE team_player_xref DROP CONSTRAINT IF EXISTS team_player_player_fk CASCADE;
ALTER TABLE team_player_xref ADD CONSTRAINT team_player_player_fk FOREIGN KEY (player_id)
REFERENCES player (id) MATCH FULL
ON DELETE NO ACTION ON UPDATE NO ACTION;