-- Table: users_register

-- DROP TABLE users_register;


CREATE TABLE users_register
(
  user_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_name character varying(255),
  email character varying(255) NOT NULL,
  password character varying(150) NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  last_updated timestamp without time zone NOT NULL DEFAULT now(),
  accepted_policy character varying(155),
  role character varying(255),
  first_login character varying(50),
  status character varying(50),
  CONSTRAINT "PK_226cad5c03b6094d6a7347364ec" PRIMARY KEY (user_id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE users_register
  OWNER TO postgres;

-- Table: notification

-- DROP TABLE notification;

CREATE TABLE notification
(
  notification_id serial NOT NULL,
  notification_name character varying(255),
  notification_message character varying(255) NOT NULL,
  status_code character varying(150),
  last_updated timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_fc4db99eb33f32cea47c5b6a39c" PRIMARY KEY (notification_id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE notification
  OWNER TO postgres;


-- Table: mail_template

-- DROP TABLE mail_template;

CREATE TABLE mail_template
(
  template_id serial NOT NULL,
  template_name character varying(255),
  subject character varying(255) NOT NULL,
  body character varying(5000) NOT NULL,
  status character varying(150),
  last_updated timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT "PK_3c714c913124404d0f9f6829567" PRIMARY KEY (template_id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE mail_template
  OWNER TO postgres;


-- Table: cgp_company_profile

-- DROP TABLE cgp_company_profile;

CREATE TABLE cgp_company_profile
(
  cgp_company_profile_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  establishment_name character varying(255),
  h_company_rcs_siren character varying(255),
  e_siret character varying(255),
  h_orias character varying(255),
  h_cif character varying(255),
  h_coa character varying(255),
  email character varying(255) NOT NULL,
  phone_number character varying(150) NOT NULL,
  address_type character varying(255),
  address_number character varying(255),
  address_street character varying(255),
  city character varying(255),
  country character varying(255),
  logo character varying(255),
  "created_Date" timestamp without time zone DEFAULT now(),
  created_at timestamp without time zone DEFAULT now(),
  last_updated timestamp without time zone NOT NULL DEFAULT now(),
  team_members character varying(255),
  website character varying(255),
  linkedin character varying(255),
  instagram character varying(255),
  twitter character varying(255),
  youtube character varying(255),
  partners character varying(255),
  user_id character varying(255),
  CONSTRAINT "PK_bed01c6c18787c246cdb87e92c8" PRIMARY KEY (cgp_company_profile_id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE cgp_company_profile
  OWNER TO postgres;
