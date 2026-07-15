--
-- PostgreSQL database dump
--

\restrict 5Uho2GGECgcmkHbLAFFSL7PHu6OBezHHVeCek0XLmYyGt9kfpPyCE2174JfM5FU

-- Dumped from database version 12.2 (Debian 12.2-2.pgdg100+1)
-- Dumped by pg_dump version 12.2 (Debian 12.2-2.pgdg100+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: bid_game_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.bid_game_status_enum AS ENUM (
    'CREATED',
    'DELETED',
    'BIDDING',
    'BIDDING_FINISHED',
    'GAME_RECORDED',
    'EXPIRED'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: bid; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bid (
    id integer NOT NULL,
    coins integer NOT NULL,
    date timestamp without time zone NOT NULL,
    "bidGamePlayerId" integer,
    "bidGameComboId" integer
);


--
-- Name: bid_game; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bid_game (
    id integer NOT NULL,
    status public.bid_game_status_enum DEFAULT 'CREATED'::public.bid_game_status_enum NOT NULL,
    "matchId" integer,
    "bidPresetId" integer,
    "createdAt" timestamp without time zone NOT NULL,
    "modifiedAt" timestamp without time zone NOT NULL,
    "hostId" integer,
    "bidTimeLimitSeconds" integer,
    "enabledCombos" jsonb,
    "bidHistory" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "quickBid" boolean DEFAULT false NOT NULL,
    ranked boolean DEFAULT false NOT NULL
);


--
-- Name: bid_game_combo; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bid_game_combo (
    id integer NOT NULL,
    "bidGameId" integer,
    "factionId" integer,
    "playerMatId" integer
);


--
-- Name: bid_game_combo_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bid_game_combo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bid_game_combo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bid_game_combo_id_seq OWNED BY public.bid_game_combo.id;


--
-- Name: bid_game_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bid_game_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bid_game_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bid_game_id_seq OWNED BY public.bid_game.id;


--
-- Name: bid_game_player; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bid_game_player (
    id integer NOT NULL,
    "dateJoined" timestamp without time zone NOT NULL,
    "bidGameId" integer,
    "userId" integer,
    "order" integer,
    "playerMatchResultId" integer,
    "quickBids" jsonb
);


--
-- Name: bid_game_player_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bid_game_player_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bid_game_player_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bid_game_player_id_seq OWNED BY public.bid_game_player.id;


--
-- Name: bid_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bid_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bid_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bid_id_seq OWNED BY public.bid.id;


--
-- Name: bid_preset; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bid_preset (
    id integer NOT NULL,
    name character varying NOT NULL,
    "position" integer NOT NULL,
    "default" boolean
);


--
-- Name: bid_preset_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bid_preset_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bid_preset_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bid_preset_id_seq OWNED BY public.bid_preset.id;


--
-- Name: bid_preset_setting; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bid_preset_setting (
    id integer NOT NULL,
    enabled boolean NOT NULL,
    "bidPresetId" integer,
    "factionId" integer,
    "playerMatId" integer
);


--
-- Name: bid_preset_setting_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bid_preset_setting_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bid_preset_setting_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bid_preset_setting_id_seq OWNED BY public.bid_preset_setting.id;


--
-- Name: discord_blacklist; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.discord_blacklist (
    id integer NOT NULL,
    "discordId" character varying NOT NULL
);


--
-- Name: discord_blacklist_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.discord_blacklist_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: discord_blacklist_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.discord_blacklist_id_seq OWNED BY public.discord_blacklist.id;


--
-- Name: faction; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.faction (
    id integer NOT NULL,
    name character varying NOT NULL,
    "position" integer NOT NULL
);


--
-- Name: faction_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.faction_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: faction_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.faction_id_seq OWNED BY public.faction.id;


--
-- Name: mat_combo_tier; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mat_combo_tier (
    id integer NOT NULL,
    "tierId" integer,
    "factionId" integer,
    "playerMatId" integer
);


--
-- Name: mat_combo_tier_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.mat_combo_tier_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: mat_combo_tier_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.mat_combo_tier_id_seq OWNED BY public.mat_combo_tier.id;


--
-- Name: match; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.match (
    id integer NOT NULL,
    "numRounds" integer NOT NULL,
    "datePlayed" timestamp without time zone NOT NULL,
    "recordingUserId" character varying
);


--
-- Name: match_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.match_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: match_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.match_id_seq OWNED BY public.match.id;


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: player; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.player (
    id integer NOT NULL,
    "displayName" character varying NOT NULL,
    "steamId" character varying,
    "userId" integer
);


--
-- Name: player_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.player_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: player_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.player_id_seq OWNED BY public.player.id;


--
-- Name: player_mat; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.player_mat (
    id integer NOT NULL,
    name character varying NOT NULL,
    abbrev character varying NOT NULL,
    "order" integer NOT NULL
);


--
-- Name: player_mat_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.player_mat_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: player_mat_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.player_mat_id_seq OWNED BY public.player_mat.id;


--
-- Name: player_match_result; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.player_match_result (
    id integer NOT NULL,
    coins integer NOT NULL,
    "playerId" integer,
    "factionId" integer,
    "playerMatId" integer,
    "matchId" integer,
    "tieOrder" integer DEFAULT 0 NOT NULL,
    rank integer NOT NULL,
    "playerTrueskill" jsonb
);


--
-- Name: player_match_result_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.player_match_result_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: player_match_result_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.player_match_result_id_seq OWNED BY public.player_match_result.id;


--
-- Name: tier; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tier (
    id integer NOT NULL,
    name character varying NOT NULL,
    rank integer NOT NULL
);


--
-- Name: tier_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tier_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tier_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tier_id_seq OWNED BY public.tier.id;


--
-- Name: typeorm_metadata; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.typeorm_metadata (
    type character varying NOT NULL,
    database character varying,
    schema character varying,
    "table" character varying,
    name character varying,
    value text
);


--
-- Name: user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."user" (
    id integer NOT NULL,
    username character varying NOT NULL,
    "discordId" character varying NOT NULL,
    "displayName" character varying,
    discriminator character varying NOT NULL
);


--
-- Name: user_bid_games_bid_game; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_bid_games_bid_game (
    "userId" integer NOT NULL,
    "bidGameId" integer NOT NULL
);


--
-- Name: user_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_id_seq OWNED BY public."user".id;


--
-- Name: user_trueskill; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_trueskill (
    id integer NOT NULL,
    mu numeric(7,2) DEFAULT '25'::numeric NOT NULL,
    sigma numeric(7,2) DEFAULT 8.333333333333334 NOT NULL,
    "userId" integer NOT NULL
);


--
-- Name: user_trueskill_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_trueskill_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_trueskill_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_trueskill_id_seq OWNED BY public.user_trueskill.id;


--
-- Name: bid id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bid ALTER COLUMN id SET DEFAULT nextval('public.bid_id_seq'::regclass);


--
-- Name: bid_game id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bid_game ALTER COLUMN id SET DEFAULT nextval('public.bid_game_id_seq'::regclass);


--
-- Name: bid_game_combo id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bid_game_combo ALTER COLUMN id SET DEFAULT nextval('public.bid_game_combo_id_seq'::regclass);


--
-- Name: bid_game_player id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bid_game_player ALTER COLUMN id SET DEFAULT nextval('public.bid_game_player_id_seq'::regclass);


--
-- Name: bid_preset id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bid_preset ALTER COLUMN id SET DEFAULT nextval('public.bid_preset_id_seq'::regclass);


--
-- Name: bid_preset_setting id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bid_preset_setting ALTER COLUMN id SET DEFAULT nextval('public.bid_preset_setting_id_seq'::regclass);


--
-- Name: discord_blacklist id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discord_blacklist ALTER COLUMN id SET DEFAULT nextval('public.discord_blacklist_id_seq'::regclass);


--
-- Name: faction id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faction ALTER COLUMN id SET DEFAULT nextval('public.faction_id_seq'::regclass);


--
-- Name: mat_combo_tier id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mat_combo_tier ALTER COLUMN id SET DEFAULT nextval('public.mat_combo_tier_id_seq'::regclass);


--
-- Name: match id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.match ALTER COLUMN id SET DEFAULT nextval('public.match_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: player id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.player ALTER COLUMN id SET DEFAULT nextval('public.player_id_seq'::regclass);


--
-- Name: player_mat id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.player_mat ALTER COLUMN id SET DEFAULT nextval('public.player_mat_id_seq'::regclass);


--
-- Name: player_match_result id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.player_match_result ALTER COLUMN id SET DEFAULT nextval('public.player_match_result_id_seq'::regclass);


--
-- Name: tier id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tier ALTER COLUMN id SET DEFAULT nextval('public.tier_id_seq'::regclass);


--
-- Name: user id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user" ALTER COLUMN id SET DEFAULT nextval('public.user_id_seq'::regclass);


--
-- Name: user_trueskill id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_trueskill ALTER COLUMN id SET DEFAULT nextval('public.user_trueskill_id_seq'::regclass);


--
-- Name: user_trueskill PK_0c30c283416bd9176ab2687bc4d; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_trueskill
    ADD CONSTRAINT "PK_0c30c283416bd9176ab2687bc4d" PRIMARY KEY (id);


--
-- Name: player_match_result PK_0f17d1eb459f385a9b34284a7a2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.player_match_result
    ADD CONSTRAINT "PK_0f17d1eb459f385a9b34284a7a2" PRIMARY KEY (id);


--
-- Name: tier PK_14d67ceef0dbea040e39e97e7f6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tier
    ADD CONSTRAINT "PK_14d67ceef0dbea040e39e97e7f6" PRIMARY KEY (id);


--
-- Name: bid_game PK_2e6c9e13f6116092b569c0aef36; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bid_game
    ADD CONSTRAINT "PK_2e6c9e13f6116092b569c0aef36" PRIMARY KEY (id);


--
-- Name: bid_game_combo PK_3aaee4eeecc67abb4a68d97b3b9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bid_game_combo
    ADD CONSTRAINT "PK_3aaee4eeecc67abb4a68d97b3b9" PRIMARY KEY (id);


--
-- Name: bid_preset PK_3bc34db5df736279e55a05c1d17; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bid_preset
    ADD CONSTRAINT "PK_3bc34db5df736279e55a05c1d17" PRIMARY KEY (id);


--
-- Name: faction PK_5935637aa4ecd999ac0555ae5a6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faction
    ADD CONSTRAINT "PK_5935637aa4ecd999ac0555ae5a6" PRIMARY KEY (id);


--
-- Name: player PK_65edadc946a7faf4b638d5e8885; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.player
    ADD CONSTRAINT "PK_65edadc946a7faf4b638d5e8885" PRIMARY KEY (id);


--
-- Name: mat_combo_tier PK_734c543ded8fe8338b3e5dc9097; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mat_combo_tier
    ADD CONSTRAINT "PK_734c543ded8fe8338b3e5dc9097" PRIMARY KEY (id);


--
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);


--
-- Name: discord_blacklist PK_8db294dddf49f12026fd9ee25af; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discord_blacklist
    ADD CONSTRAINT "PK_8db294dddf49f12026fd9ee25af" PRIMARY KEY (id);


--
-- Name: match PK_92b6c3a6631dd5b24a67c69f69d; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.match
    ADD CONSTRAINT "PK_92b6c3a6631dd5b24a67c69f69d" PRIMARY KEY (id);


--
-- Name: user PK_cace4a159ff9f2512dd42373760; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY (id);


--
-- Name: bid_preset_setting PK_d1dbecce5fd2f25bb3da6af9f72; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bid_preset_setting
    ADD CONSTRAINT "PK_d1dbecce5fd2f25bb3da6af9f72" PRIMARY KEY (id);


--
-- Name: user_bid_games_bid_game PK_d2e5f138f4f68eecf48715b7171; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_bid_games_bid_game
    ADD CONSTRAINT "PK_d2e5f138f4f68eecf48715b7171" PRIMARY KEY ("userId", "bidGameId");


--
-- Name: bid_game_player PK_dc2fecf50be2249a546147eb476; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bid_game_player
    ADD CONSTRAINT "PK_dc2fecf50be2249a546147eb476" PRIMARY KEY (id);


--
-- Name: player_mat PK_e3f066bd824539623b5f4393707; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.player_mat
    ADD CONSTRAINT "PK_e3f066bd824539623b5f4393707" PRIMARY KEY (id);


--
-- Name: bid PK_ed405dda320051aca2dcb1a50bb; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bid
    ADD CONSTRAINT "PK_ed405dda320051aca2dcb1a50bb" PRIMARY KEY (id);


--
-- Name: user_trueskill REL_34ad4bbe24300e04d89845d6d9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_trueskill
    ADD CONSTRAINT "REL_34ad4bbe24300e04d89845d6d9" UNIQUE ("userId");


--
-- Name: bid_game REL_873ad736f9b84ef318de13fd22; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bid_game
    ADD CONSTRAINT "REL_873ad736f9b84ef318de13fd22" UNIQUE ("matchId");


--
-- Name: user UQ_13af5754f14d8d255fd9b3ee5c7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "UQ_13af5754f14d8d255fd9b3ee5c7" UNIQUE ("discordId");


--
-- Name: player_mat UQ_1cb35a4fa3cd2c9afa0c897a035; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.player_mat
    ADD CONSTRAINT "UQ_1cb35a4fa3cd2c9afa0c897a035" UNIQUE (abbrev);


--
-- Name: player_match_result UQ_36224eb0f6acea04bc576d38ac0; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.player_match_result
    ADD CONSTRAINT "UQ_36224eb0f6acea04bc576d38ac0" UNIQUE ("matchId", rank);


--
-- Name: bid_game UQ_3b59f7fb6a0e4c661946d24fd2c; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bid_game
    ADD CONSTRAINT "UQ_3b59f7fb6a0e4c661946d24fd2c" UNIQUE ("hostId");


--
-- Name: player_match_result UQ_463fe2bee921b6a3f41b926b78f; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.player_match_result
    ADD CONSTRAINT "UQ_463fe2bee921b6a3f41b926b78f" UNIQUE ("matchId", "playerId");


--
-- Name: faction UQ_51b7d060b06c5b3ed9e3411f6bc; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faction
    ADD CONSTRAINT "UQ_51b7d060b06c5b3ed9e3411f6bc" UNIQUE (name);


--
-- Name: bid_preset_setting UQ_51f6ea6ad6095302f8a3c346a62; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bid_preset_setting
    ADD CONSTRAINT "UQ_51f6ea6ad6095302f8a3c346a62" UNIQUE ("bidPresetId", "factionId", "playerMatId");


--
-- Name: tier UQ_69eed04bdd0b04a20d31361d4e6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tier
    ADD CONSTRAINT "UQ_69eed04bdd0b04a20d31361d4e6" UNIQUE (rank);


--
-- Name: player_mat UQ_72f9b8703be535cbb37795c3db2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.player_mat
    ADD CONSTRAINT "UQ_72f9b8703be535cbb37795c3db2" UNIQUE ("order");


--
-- Name: bid_game_player UQ_73727c7502730c8bd9880a90a1f; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bid_game_player
    ADD CONSTRAINT "UQ_73727c7502730c8bd9880a90a1f" UNIQUE ("playerMatchResultId");


--
-- Name: player_match_result UQ_737e86794c7ae3159b495bbb8c0; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.player_match_result
    ADD CONSTRAINT "UQ_737e86794c7ae3159b495bbb8c0" UNIQUE ("matchId", "factionId");


--
-- Name: player UQ_7687919bf054bf262c669d3ae21; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.player
    ADD CONSTRAINT "UQ_7687919bf054bf262c669d3ae21" UNIQUE ("userId");


--
-- Name: player_match_result UQ_a3143fb2b454409264cc6f979d6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.player_match_result
    ADD CONSTRAINT "UQ_a3143fb2b454409264cc6f979d6" UNIQUE ("matchId", "playerMatId");


--
-- Name: faction UQ_b1fd0e445bb2a73397e874492fc; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faction
    ADD CONSTRAINT "UQ_b1fd0e445bb2a73397e874492fc" UNIQUE ("position");


--
-- Name: mat_combo_tier UQ_b47e2d6a80c42c8607e28b974a9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mat_combo_tier
    ADD CONSTRAINT "UQ_b47e2d6a80c42c8607e28b974a9" UNIQUE ("factionId", "playerMatId");


--
-- Name: tier UQ_ca31b25988ac3848aef318f9b8f; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tier
    ADD CONSTRAINT "UQ_ca31b25988ac3848aef318f9b8f" UNIQUE (name);


--
-- Name: bid_preset UQ_d401f141880bfee0e3dc79e6849; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bid_preset
    ADD CONSTRAINT "UQ_d401f141880bfee0e3dc79e6849" UNIQUE ("default");


--
-- Name: bid UQ_dcda9fcab6e3c674dc6a81e2891; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bid
    ADD CONSTRAINT "UQ_dcda9fcab6e3c674dc6a81e2891" UNIQUE ("bidGameComboId");


--
-- Name: bid UQ_dffaef5fe782b7efd530c0729a6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bid
    ADD CONSTRAINT "UQ_dffaef5fe782b7efd530c0729a6" UNIQUE ("bidGamePlayerId");


--
-- Name: player_mat UQ_e609287fd07431532768faa6aa6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.player_mat
    ADD CONSTRAINT "UQ_e609287fd07431532768faa6aa6" UNIQUE (name);


--
-- Name: bid_game_combo bid_game_combo_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bid_game_combo
    ADD CONSTRAINT bid_game_combo_unique UNIQUE ("bidGameId", "factionId", "playerMatId");


--
-- Name: bid_game_player bid_game_order_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bid_game_player
    ADD CONSTRAINT bid_game_order_unique UNIQUE ("bidGameId", "order");


--
-- Name: bid_game_player bid_game_player_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bid_game_player
    ADD CONSTRAINT bid_game_player_unique UNIQUE ("bidGameId", "userId");


--
-- Name: IDX_4afed942c63686b00386a9b796; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_4afed942c63686b00386a9b796" ON public.player USING btree ("displayName") WHERE (("steamId" IS NULL) AND ("userId" IS NULL));


--
-- Name: IDX_4d7fe2f19e42286074bd98226c; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_4d7fe2f19e42286074bd98226c" ON public.user_bid_games_bid_game USING btree ("bidGameId");


--
-- Name: IDX_57fe6dab14ed96296acc1d6d13; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_57fe6dab14ed96296acc1d6d13" ON public.user_bid_games_bid_game USING btree ("userId");


--
-- Name: IDX_b66b7904d8894932b1a0b77da7; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_b66b7904d8894932b1a0b77da7" ON public.bid_game USING btree (ranked, status);


--
-- Name: bid_game_player FK_0f0c8f9857a8be36ddb5bbbd82d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bid_game_player
    ADD CONSTRAINT "FK_0f0c8f9857a8be36ddb5bbbd82d" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: bid_preset_setting FK_1ca320662cc1a333aad4a26b522; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bid_preset_setting
    ADD CONSTRAINT "FK_1ca320662cc1a333aad4a26b522" FOREIGN KEY ("factionId") REFERENCES public.faction(id) ON DELETE CASCADE;


--
-- Name: user_trueskill FK_34ad4bbe24300e04d89845d6d98; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_trueskill
    ADD CONSTRAINT "FK_34ad4bbe24300e04d89845d6d98" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- Name: bid_game FK_3b59f7fb6a0e4c661946d24fd2c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bid_game
    ADD CONSTRAINT "FK_3b59f7fb6a0e4c661946d24fd2c" FOREIGN KEY ("hostId") REFERENCES public.bid_game_player(id);


--
-- Name: user_bid_games_bid_game FK_4d7fe2f19e42286074bd98226c1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_bid_games_bid_game
    ADD CONSTRAINT "FK_4d7fe2f19e42286074bd98226c1" FOREIGN KEY ("bidGameId") REFERENCES public.bid_game(id);


--
-- Name: user_bid_games_bid_game FK_57fe6dab14ed96296acc1d6d133; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_bid_games_bid_game
    ADD CONSTRAINT "FK_57fe6dab14ed96296acc1d6d133" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: player_match_result FK_5c2052d36dd2a9775c4ad0a00af; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.player_match_result
    ADD CONSTRAINT "FK_5c2052d36dd2a9775c4ad0a00af" FOREIGN KEY ("matchId") REFERENCES public.match(id) ON DELETE CASCADE;


--
-- Name: bid_preset_setting FK_72565665c24358fffccb9ea6d21; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bid_preset_setting
    ADD CONSTRAINT "FK_72565665c24358fffccb9ea6d21" FOREIGN KEY ("playerMatId") REFERENCES public.player_mat(id) ON DELETE CASCADE;


--
-- Name: bid_game_player FK_73727c7502730c8bd9880a90a1f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bid_game_player
    ADD CONSTRAINT "FK_73727c7502730c8bd9880a90a1f" FOREIGN KEY ("playerMatchResultId") REFERENCES public.player_match_result(id);


--
-- Name: player FK_7687919bf054bf262c669d3ae21; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.player
    ADD CONSTRAINT "FK_7687919bf054bf262c669d3ae21" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- Name: bid_game_combo FK_81c87a11729db79068e1e5181f8; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bid_game_combo
    ADD CONSTRAINT "FK_81c87a11729db79068e1e5181f8" FOREIGN KEY ("playerMatId") REFERENCES public.player_mat(id) ON DELETE CASCADE;


--
-- Name: player_match_result FK_861d5bac55cf6e0c4f59708ccce; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.player_match_result
    ADD CONSTRAINT "FK_861d5bac55cf6e0c4f59708ccce" FOREIGN KEY ("playerMatId") REFERENCES public.player_mat(id) ON DELETE CASCADE;


--
-- Name: bid_game FK_873ad736f9b84ef318de13fd220; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bid_game
    ADD CONSTRAINT "FK_873ad736f9b84ef318de13fd220" FOREIGN KEY ("matchId") REFERENCES public.match(id);


--
-- Name: player_match_result FK_a6aceb84c4c2dd136234bb5e4ce; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.player_match_result
    ADD CONSTRAINT "FK_a6aceb84c4c2dd136234bb5e4ce" FOREIGN KEY ("factionId") REFERENCES public.faction(id) ON DELETE CASCADE;


--
-- Name: mat_combo_tier FK_c55878f0f9ee6a136e98b2d2063; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mat_combo_tier
    ADD CONSTRAINT "FK_c55878f0f9ee6a136e98b2d2063" FOREIGN KEY ("tierId") REFERENCES public.tier(id) ON DELETE CASCADE;


--
-- Name: bid_game_player FK_ce4f388f0b6371ca6e83a6f5e76; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bid_game_player
    ADD CONSTRAINT "FK_ce4f388f0b6371ca6e83a6f5e76" FOREIGN KEY ("bidGameId") REFERENCES public.bid_game(id) ON DELETE CASCADE;


--
-- Name: bid_game_combo FK_d02402f5601654ed27d19517c60; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bid_game_combo
    ADD CONSTRAINT "FK_d02402f5601654ed27d19517c60" FOREIGN KEY ("bidGameId") REFERENCES public.bid_game(id) ON DELETE CASCADE;


--
-- Name: mat_combo_tier FK_d714d4242429af212bdf7eb4f8a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mat_combo_tier
    ADD CONSTRAINT "FK_d714d4242429af212bdf7eb4f8a" FOREIGN KEY ("factionId") REFERENCES public.faction(id) ON DELETE CASCADE;


--
-- Name: bid_preset_setting FK_dc89f107778846935ca8cc115c0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bid_preset_setting
    ADD CONSTRAINT "FK_dc89f107778846935ca8cc115c0" FOREIGN KEY ("bidPresetId") REFERENCES public.bid_preset(id) ON DELETE CASCADE;


--
-- Name: bid FK_dcda9fcab6e3c674dc6a81e2891; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bid
    ADD CONSTRAINT "FK_dcda9fcab6e3c674dc6a81e2891" FOREIGN KEY ("bidGameComboId") REFERENCES public.bid_game_combo(id) ON DELETE CASCADE;


--
-- Name: bid FK_dffaef5fe782b7efd530c0729a6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bid
    ADD CONSTRAINT "FK_dffaef5fe782b7efd530c0729a6" FOREIGN KEY ("bidGamePlayerId") REFERENCES public.bid_game_player(id) ON DELETE CASCADE;


--
-- Name: mat_combo_tier FK_e97f569dd10fd68b9ff76e3c7f3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mat_combo_tier
    ADD CONSTRAINT "FK_e97f569dd10fd68b9ff76e3c7f3" FOREIGN KEY ("playerMatId") REFERENCES public.player_mat(id) ON DELETE CASCADE;


--
-- Name: bid_game FK_eb7d1ffed60331b5efdffe591dd; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bid_game
    ADD CONSTRAINT "FK_eb7d1ffed60331b5efdffe591dd" FOREIGN KEY ("bidPresetId") REFERENCES public.bid_preset(id) ON DELETE SET NULL;


--
-- Name: bid_game_combo FK_f12a15aa683d7dacf584d04075c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bid_game_combo
    ADD CONSTRAINT "FK_f12a15aa683d7dacf584d04075c" FOREIGN KEY ("factionId") REFERENCES public.faction(id) ON DELETE CASCADE;


--
-- Name: player_match_result FK_f3ace3c5b33b8b35445c854199a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.player_match_result
    ADD CONSTRAINT "FK_f3ace3c5b33b8b35445c854199a" FOREIGN KEY ("playerId") REFERENCES public.player(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 5Uho2GGECgcmkHbLAFFSL7PHu6OBezHHVeCek0XLmYyGt9kfpPyCE2174JfM5FU

