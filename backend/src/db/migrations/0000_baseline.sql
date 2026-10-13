-- Baseline: the schema the Laravel migrations produced (ADR-0008, D-084), without the
-- tables only Laravel used. Every later change is a new expand-contract migration.
CREATE TABLE public.blocks (
    id bigint NOT NULL,
    blocker_id bigint NOT NULL,
    blocked_id bigint NOT NULL,
    created_at timestamp(0) without time zone
);
--> statement-breakpoint
CREATE SEQUENCE public.blocks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
--> statement-breakpoint
ALTER SEQUENCE public.blocks_id_seq OWNED BY public.blocks.id;
--> statement-breakpoint
CREATE TABLE public.builder_skill (
    builder_id bigint NOT NULL,
    skill_id bigint NOT NULL,
    "position" smallint NOT NULL
);
--> statement-breakpoint
CREATE TABLE public.builders (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    public_id character(26),
    name character varying(100),
    role character varying(30),
    headline character varying(80),
    neighbourhood_id bigint,
    bio text,
    open_to jsonb DEFAULT '[]'::jsonb NOT NULL,
    building_summary character varying(280),
    looking_for character varying(400),
    onboarding_saved_steps jsonb DEFAULT '[]'::jsonb NOT NULL,
    onboarding_completed_at timestamp(0) without time zone,
    photo_id uuid,
    last_active_at timestamp(0) without time zone,
    search_text text DEFAULT ''::text NOT NULL
);
--> statement-breakpoint
CREATE SEQUENCE public.builders_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
--> statement-breakpoint
ALTER SEQUENCE public.builders_id_seq OWNED BY public.builders.id;
--> statement-breakpoint
CREATE TABLE public.email_deliveries (
    id bigint NOT NULL,
    notification_id uuid NOT NULL,
    user_id bigint NOT NULL,
    category character varying(32),
    status character varying(16) DEFAULT 'queued'::character varying NOT NULL,
    attempts smallint DEFAULT '0'::smallint NOT NULL,
    sent_at timestamp(0) without time zone,
    failed_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);
--> statement-breakpoint
CREATE SEQUENCE public.email_deliveries_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
--> statement-breakpoint
ALTER SEQUENCE public.email_deliveries_id_seq OWNED BY public.email_deliveries.id;
--> statement-breakpoint
CREATE TABLE public.email_preferences (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    category character varying(32) NOT NULL,
    enabled boolean NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);
--> statement-breakpoint
CREATE SEQUENCE public.email_preferences_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
--> statement-breakpoint
ALTER SEQUENCE public.email_preferences_id_seq OWNED BY public.email_preferences.id;
--> statement-breakpoint
CREATE TABLE public.email_verifications (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    token_hash character varying(64) NOT NULL,
    expires_at timestamp(0) without time zone NOT NULL,
    used_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE SEQUENCE public.email_verifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
--> statement-breakpoint
ALTER SEQUENCE public.email_verifications_id_seq OWNED BY public.email_verifications.id;
--> statement-breakpoint
CREATE TABLE public.experience_entries (
    id bigint NOT NULL,
    builder_id bigint NOT NULL,
    "position" smallint NOT NULL,
    title character varying(100) NOT NULL,
    organization character varying(100),
    started_on date NOT NULL,
    ended_on date,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);
--> statement-breakpoint
CREATE SEQUENCE public.experience_entries_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
--> statement-breakpoint
ALTER SEQUENCE public.experience_entries_id_seq OWNED BY public.experience_entries.id;
--> statement-breakpoint
CREATE TABLE public.feedback (
    id bigint NOT NULL,
    project_id bigint NOT NULL,
    author_id bigint NOT NULL,
    body text NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);
--> statement-breakpoint
CREATE SEQUENCE public.feedback_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
--> statement-breakpoint
ALTER SEQUENCE public.feedback_id_seq OWNED BY public.feedback.id;
--> statement-breakpoint
CREATE TABLE public.help_offers (
    id bigint NOT NULL,
    project_id bigint NOT NULL,
    offerer_id bigint NOT NULL,
    role character varying(32) NOT NULL,
    message text NOT NULL,
    status character varying(16) DEFAULT 'pending'::character varying NOT NULL,
    answered_at timestamp(0) without time zone,
    conversation_id bigint,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);
--> statement-breakpoint
CREATE SEQUENCE public.help_offers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
--> statement-breakpoint
ALTER SEQUENCE public.help_offers_id_seq OWNED BY public.help_offers.id;
--> statement-breakpoint
CREATE TABLE public.neighbourhood_distances (
    from_id bigint NOT NULL,
    to_id bigint NOT NULL,
    km numeric(6,2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE public.neighbourhoods (
    id bigint NOT NULL,
    slug character varying(60) NOT NULL,
    name character varying(80) NOT NULL,
    area character varying(80) NOT NULL,
    latitude numeric(9,6) NOT NULL,
    longitude numeric(9,6) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);
--> statement-breakpoint
CREATE SEQUENCE public.neighbourhoods_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
--> statement-breakpoint
ALTER SEQUENCE public.neighbourhoods_id_seq OWNED BY public.neighbourhoods.id;
--> statement-breakpoint
CREATE TABLE public.notifications (
    id uuid NOT NULL,
    type character varying(255) NOT NULL,
    notifiable_type character varying(255) NOT NULL,
    notifiable_id bigint NOT NULL,
    data jsonb NOT NULL,
    read_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);
--> statement-breakpoint
CREATE TABLE public.password_reset_tokens (
    email character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    created_at timestamp(0) without time zone
);
--> statement-breakpoint
CREATE TABLE public.privacy_settings (
    user_id bigint NOT NULL,
    profile_visibility character varying(16) DEFAULT 'members'::character varying NOT NULL,
    location_precision character varying(16) DEFAULT 'neighbourhood'::character varying NOT NULL,
    email_contact boolean DEFAULT false NOT NULL,
    show_online_status boolean DEFAULT true NOT NULL,
    list_in_attendees boolean DEFAULT false NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);
--> statement-breakpoint
CREATE TABLE public.profile_links (
    id bigint NOT NULL,
    builder_id bigint NOT NULL,
    "position" smallint NOT NULL,
    label character varying(60) NOT NULL,
    url character varying(2048) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);
--> statement-breakpoint
CREATE SEQUENCE public.profile_links_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
--> statement-breakpoint
ALTER SEQUENCE public.profile_links_id_seq OWNED BY public.profile_links.id;
--> statement-breakpoint
CREATE TABLE public.profile_photos (
    id uuid NOT NULL,
    builder_id bigint NOT NULL,
    path character varying(255) NOT NULL,
    status character varying(16) NOT NULL,
    scanned_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);
--> statement-breakpoint
CREATE TABLE public.project_looking_for (
    project_id bigint NOT NULL,
    role character varying(32) NOT NULL
);
--> statement-breakpoint
CREATE TABLE public.projects (
    id bigint NOT NULL,
    public_id character varying(26) NOT NULL,
    owner_id bigint NOT NULL,
    name character varying(80) NOT NULL,
    summary character varying(140) NOT NULL,
    description text,
    stage character varying(16) NOT NULL,
    link character varying(2048),
    feedback_count integer DEFAULT 0 NOT NULL,
    last_activity_at timestamp(0) without time zone,
    search_text text DEFAULT ''::text NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);
--> statement-breakpoint
CREATE SEQUENCE public.projects_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
--> statement-breakpoint
ALTER SEQUENCE public.projects_id_seq OWNED BY public.projects.id;
--> statement-breakpoint
CREATE TABLE public.sign_ins (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    device_hash character varying(64) NOT NULL,
    created_at timestamp(0) without time zone NOT NULL
);
--> statement-breakpoint
CREATE SEQUENCE public.sign_ins_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
--> statement-breakpoint
ALTER SEQUENCE public.sign_ins_id_seq OWNED BY public.sign_ins.id;
--> statement-breakpoint
CREATE TABLE public.skills (
    id bigint NOT NULL,
    name character varying(40) NOT NULL,
    slug character varying(60) NOT NULL,
    normalized_name character varying(40) NOT NULL,
    is_catalogue boolean DEFAULT false NOT NULL,
    catalogue_position smallint,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);
--> statement-breakpoint
CREATE SEQUENCE public.skills_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
--> statement-breakpoint
ALTER SEQUENCE public.skills_id_seq OWNED BY public.skills.id;
--> statement-breakpoint
CREATE TABLE public.users (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    email_verified_at timestamp(0) without time zone,
    password character varying(255) NOT NULL,
    remember_token character varying(100),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    code_of_conduct_version character varying(255),
    code_of_conduct_accepted_at timestamp(0) without time zone
);
--> statement-breakpoint
CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
--> statement-breakpoint
ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;
--> statement-breakpoint
ALTER TABLE ONLY public.blocks ALTER COLUMN id SET DEFAULT nextval('public.blocks_id_seq'::regclass);
--> statement-breakpoint
ALTER TABLE ONLY public.builders ALTER COLUMN id SET DEFAULT nextval('public.builders_id_seq'::regclass);
--> statement-breakpoint
ALTER TABLE ONLY public.email_deliveries ALTER COLUMN id SET DEFAULT nextval('public.email_deliveries_id_seq'::regclass);
--> statement-breakpoint
ALTER TABLE ONLY public.email_preferences ALTER COLUMN id SET DEFAULT nextval('public.email_preferences_id_seq'::regclass);
--> statement-breakpoint
ALTER TABLE ONLY public.email_verifications ALTER COLUMN id SET DEFAULT nextval('public.email_verifications_id_seq'::regclass);
--> statement-breakpoint
ALTER TABLE ONLY public.experience_entries ALTER COLUMN id SET DEFAULT nextval('public.experience_entries_id_seq'::regclass);
--> statement-breakpoint
ALTER TABLE ONLY public.feedback ALTER COLUMN id SET DEFAULT nextval('public.feedback_id_seq'::regclass);
--> statement-breakpoint
ALTER TABLE ONLY public.help_offers ALTER COLUMN id SET DEFAULT nextval('public.help_offers_id_seq'::regclass);
--> statement-breakpoint
ALTER TABLE ONLY public.neighbourhoods ALTER COLUMN id SET DEFAULT nextval('public.neighbourhoods_id_seq'::regclass);
--> statement-breakpoint
ALTER TABLE ONLY public.profile_links ALTER COLUMN id SET DEFAULT nextval('public.profile_links_id_seq'::regclass);
--> statement-breakpoint
ALTER TABLE ONLY public.projects ALTER COLUMN id SET DEFAULT nextval('public.projects_id_seq'::regclass);
--> statement-breakpoint
ALTER TABLE ONLY public.sign_ins ALTER COLUMN id SET DEFAULT nextval('public.sign_ins_id_seq'::regclass);
--> statement-breakpoint
ALTER TABLE ONLY public.skills ALTER COLUMN id SET DEFAULT nextval('public.skills_id_seq'::regclass);
--> statement-breakpoint
ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);
--> statement-breakpoint
ALTER TABLE ONLY public.blocks
    ADD CONSTRAINT blocks_blocker_id_blocked_id_unique UNIQUE (blocker_id, blocked_id);
--> statement-breakpoint
ALTER TABLE ONLY public.blocks
    ADD CONSTRAINT blocks_pkey PRIMARY KEY (id);
--> statement-breakpoint
ALTER TABLE ONLY public.builder_skill
    ADD CONSTRAINT builder_skill_pkey PRIMARY KEY (builder_id, skill_id);
--> statement-breakpoint
ALTER TABLE ONLY public.builders
    ADD CONSTRAINT builders_pkey PRIMARY KEY (id);
--> statement-breakpoint
ALTER TABLE ONLY public.builders
    ADD CONSTRAINT builders_public_id_unique UNIQUE (public_id);
--> statement-breakpoint
ALTER TABLE ONLY public.builders
    ADD CONSTRAINT builders_user_id_unique UNIQUE (user_id);
--> statement-breakpoint
ALTER TABLE ONLY public.email_deliveries
    ADD CONSTRAINT email_deliveries_notification_id_unique UNIQUE (notification_id);
--> statement-breakpoint
ALTER TABLE ONLY public.email_deliveries
    ADD CONSTRAINT email_deliveries_pkey PRIMARY KEY (id);
--> statement-breakpoint
ALTER TABLE ONLY public.email_preferences
    ADD CONSTRAINT email_preferences_pkey PRIMARY KEY (id);
--> statement-breakpoint
ALTER TABLE ONLY public.email_preferences
    ADD CONSTRAINT email_preferences_user_id_category_unique UNIQUE (user_id, category);
--> statement-breakpoint
ALTER TABLE ONLY public.email_verifications
    ADD CONSTRAINT email_verifications_pkey PRIMARY KEY (id);
--> statement-breakpoint
ALTER TABLE ONLY public.email_verifications
    ADD CONSTRAINT email_verifications_token_hash_unique UNIQUE (token_hash);
--> statement-breakpoint
ALTER TABLE ONLY public.experience_entries
    ADD CONSTRAINT experience_entries_pkey PRIMARY KEY (id);
--> statement-breakpoint
ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT feedback_pkey PRIMARY KEY (id);
--> statement-breakpoint
ALTER TABLE ONLY public.help_offers
    ADD CONSTRAINT help_offers_pkey PRIMARY KEY (id);
--> statement-breakpoint
ALTER TABLE ONLY public.neighbourhood_distances
    ADD CONSTRAINT neighbourhood_distances_pkey PRIMARY KEY (from_id, to_id);
--> statement-breakpoint
ALTER TABLE ONLY public.neighbourhoods
    ADD CONSTRAINT neighbourhoods_pkey PRIMARY KEY (id);
--> statement-breakpoint
ALTER TABLE ONLY public.neighbourhoods
    ADD CONSTRAINT neighbourhoods_slug_unique UNIQUE (slug);
--> statement-breakpoint
ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);
--> statement-breakpoint
ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (email);
--> statement-breakpoint
ALTER TABLE ONLY public.privacy_settings
    ADD CONSTRAINT privacy_settings_pkey PRIMARY KEY (user_id);
--> statement-breakpoint
ALTER TABLE ONLY public.profile_links
    ADD CONSTRAINT profile_links_pkey PRIMARY KEY (id);
--> statement-breakpoint
ALTER TABLE ONLY public.profile_photos
    ADD CONSTRAINT profile_photos_pkey PRIMARY KEY (id);
--> statement-breakpoint
ALTER TABLE ONLY public.project_looking_for
    ADD CONSTRAINT project_looking_for_pkey PRIMARY KEY (project_id, role);
--> statement-breakpoint
ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);
--> statement-breakpoint
ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_public_id_unique UNIQUE (public_id);
--> statement-breakpoint
ALTER TABLE ONLY public.sign_ins
    ADD CONSTRAINT sign_ins_pkey PRIMARY KEY (id);
--> statement-breakpoint
ALTER TABLE ONLY public.skills
    ADD CONSTRAINT skills_normalized_name_unique UNIQUE (normalized_name);
--> statement-breakpoint
ALTER TABLE ONLY public.skills
    ADD CONSTRAINT skills_pkey PRIMARY KEY (id);
--> statement-breakpoint
ALTER TABLE ONLY public.skills
    ADD CONSTRAINT skills_slug_unique UNIQUE (slug);
--> statement-breakpoint
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);
--> statement-breakpoint
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
--> statement-breakpoint
CREATE INDEX blocks_blocked_id_index ON public.blocks USING btree (blocked_id);
--> statement-breakpoint
CREATE INDEX builder_skill_skill_id_index ON public.builder_skill USING btree (skill_id);
--> statement-breakpoint
CREATE INDEX builders_created_at_index ON public.builders USING btree (created_at);
--> statement-breakpoint
CREATE INDEX builders_last_active_at_index ON public.builders USING btree (last_active_at);
--> statement-breakpoint
CREATE INDEX builders_neighbourhood_id_index ON public.builders USING btree (neighbourhood_id);
--> statement-breakpoint
CREATE INDEX builders_role_index ON public.builders USING btree (role);
--> statement-breakpoint
CREATE INDEX builders_search_text_fts ON public.builders USING gin (to_tsvector('simple'::regconfig, search_text));
--> statement-breakpoint
CREATE INDEX experience_entries_builder_id_position_index ON public.experience_entries USING btree (builder_id, "position");
--> statement-breakpoint
CREATE INDEX feedback_author_id_index ON public.feedback USING btree (author_id);
--> statement-breakpoint
CREATE INDEX feedback_project_id_id_index ON public.feedback USING btree (project_id, id);
--> statement-breakpoint
CREATE UNIQUE INDEX help_offers_one_pending_index ON public.help_offers USING btree (project_id, offerer_id) WHERE ((status)::text = 'pending'::text);
--> statement-breakpoint
CREATE INDEX help_offers_project_id_status_created_at_index ON public.help_offers USING btree (project_id, status, created_at);
--> statement-breakpoint
CREATE INDEX neighbourhood_distances_from_id_km_index ON public.neighbourhood_distances USING btree (from_id, km);
--> statement-breakpoint
CREATE INDEX neighbourhoods_area_index ON public.neighbourhoods USING btree (area);
--> statement-breakpoint
CREATE INDEX notifications_member_unread_index ON public.notifications USING btree (notifiable_type, notifiable_id, read_at, created_at);
--> statement-breakpoint
CREATE INDEX notifications_notifiable_type_notifiable_id_index ON public.notifications USING btree (notifiable_type, notifiable_id);
--> statement-breakpoint
CREATE INDEX profile_links_builder_id_position_index ON public.profile_links USING btree (builder_id, "position");
--> statement-breakpoint
CREATE INDEX profile_photos_status_index ON public.profile_photos USING btree (status);
--> statement-breakpoint
CREATE INDEX project_looking_for_role_index ON public.project_looking_for USING btree (role);
--> statement-breakpoint
CREATE INDEX projects_last_activity_at_index ON public.projects USING btree (last_activity_at);
--> statement-breakpoint
CREATE INDEX projects_search_text_fts ON public.projects USING gin (to_tsvector('simple'::regconfig, search_text));
--> statement-breakpoint
CREATE INDEX projects_stage_index ON public.projects USING btree (stage);
--> statement-breakpoint
CREATE INDEX sign_ins_user_id_device_hash_created_at_index ON public.sign_ins USING btree (user_id, device_hash, created_at);
--> statement-breakpoint
ALTER TABLE ONLY public.blocks
    ADD CONSTRAINT blocks_blocked_id_foreign FOREIGN KEY (blocked_id) REFERENCES public.users(id) ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE ONLY public.blocks
    ADD CONSTRAINT blocks_blocker_id_foreign FOREIGN KEY (blocker_id) REFERENCES public.users(id) ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE ONLY public.builder_skill
    ADD CONSTRAINT builder_skill_builder_id_foreign FOREIGN KEY (builder_id) REFERENCES public.builders(id) ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE ONLY public.builder_skill
    ADD CONSTRAINT builder_skill_skill_id_foreign FOREIGN KEY (skill_id) REFERENCES public.skills(id) ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE ONLY public.builders
    ADD CONSTRAINT builders_neighbourhood_id_foreign FOREIGN KEY (neighbourhood_id) REFERENCES public.neighbourhoods(id) ON DELETE SET NULL;
--> statement-breakpoint
ALTER TABLE ONLY public.builders
    ADD CONSTRAINT builders_photo_id_foreign FOREIGN KEY (photo_id) REFERENCES public.profile_photos(id) ON DELETE SET NULL;
--> statement-breakpoint
ALTER TABLE ONLY public.builders
    ADD CONSTRAINT builders_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE ONLY public.email_deliveries
    ADD CONSTRAINT email_deliveries_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE ONLY public.email_preferences
    ADD CONSTRAINT email_preferences_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE ONLY public.email_verifications
    ADD CONSTRAINT email_verifications_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE ONLY public.experience_entries
    ADD CONSTRAINT experience_entries_builder_id_foreign FOREIGN KEY (builder_id) REFERENCES public.builders(id) ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT feedback_author_id_foreign FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT feedback_project_id_foreign FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE ONLY public.help_offers
    ADD CONSTRAINT help_offers_offerer_id_foreign FOREIGN KEY (offerer_id) REFERENCES public.users(id) ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE ONLY public.help_offers
    ADD CONSTRAINT help_offers_project_id_foreign FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE ONLY public.neighbourhood_distances
    ADD CONSTRAINT neighbourhood_distances_from_id_foreign FOREIGN KEY (from_id) REFERENCES public.neighbourhoods(id) ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE ONLY public.neighbourhood_distances
    ADD CONSTRAINT neighbourhood_distances_to_id_foreign FOREIGN KEY (to_id) REFERENCES public.neighbourhoods(id) ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE ONLY public.privacy_settings
    ADD CONSTRAINT privacy_settings_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE ONLY public.profile_links
    ADD CONSTRAINT profile_links_builder_id_foreign FOREIGN KEY (builder_id) REFERENCES public.builders(id) ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE ONLY public.profile_photos
    ADD CONSTRAINT profile_photos_builder_id_foreign FOREIGN KEY (builder_id) REFERENCES public.builders(id) ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE ONLY public.project_looking_for
    ADD CONSTRAINT project_looking_for_project_id_foreign FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_owner_id_foreign FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE ONLY public.sign_ins
    ADD CONSTRAINT sign_ins_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
