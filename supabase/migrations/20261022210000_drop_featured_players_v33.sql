-- V33 (APPLIED): owner asked for real rankings only; remove the featured-players list from V32.
drop function if exists public.etc_featured_players();
drop table if exists etc_private.featured_players;
-- Data repair applied with it: the open season's stage list pointed at old stage versions, so new runs got no season.
-- Season stages were moved to the latest catalog versions and in-window runs of those versions were assigned the season.
