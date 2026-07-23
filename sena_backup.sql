--
-- PostgreSQL database dump
--

\restrict qpiyfYZ1Dnj1BeQYqxJe46k6tEEUdWGOvrxkXXOLawbTDSLvBRlOf0uNe7ebWEV

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: informes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.informes (
    id_informe integer NOT NULL,
    titulo character varying(150) NOT NULL,
    fecha_informe date NOT NULL,
    estado character varying(50) DEFAULT 'pendiente'::character varying NOT NULL,
    fk_version integer
);


ALTER TABLE public.informes OWNER TO postgres;

--
-- Name: informes_id_informe_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.informes_id_informe_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.informes_id_informe_seq OWNER TO postgres;

--
-- Name: informes_id_informe_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.informes_id_informe_seq OWNED BY public.informes.id_informe;


--
-- Name: novedades; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.novedades (
    id_novedad integer NOT NULL,
    descripcion character varying(255) NOT NULL,
    fecha_novedad date NOT NULL,
    estado character varying(50) DEFAULT 'activo'::character varying NOT NULL,
    fk_version integer
);


ALTER TABLE public.novedades OWNER TO postgres;

--
-- Name: novedades_id_novedad_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.novedades_id_novedad_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.novedades_id_novedad_seq OWNER TO postgres;

--
-- Name: novedades_id_novedad_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.novedades_id_novedad_seq OWNED BY public.novedades.id_novedad;


--
-- Name: versiones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.versiones (
    id_version integer NOT NULL,
    numero_version integer NOT NULL,
    fecha_version date NOT NULL,
    descripcion character varying(255) NOT NULL,
    estado character varying(50) DEFAULT 'activo'::character varying NOT NULL
);


ALTER TABLE public.versiones OWNER TO postgres;

--
-- Name: versiones_id_version_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.versiones_id_version_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.versiones_id_version_seq OWNER TO postgres;

--
-- Name: versiones_id_version_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.versiones_id_version_seq OWNED BY public.versiones.id_version;


--
-- Name: informes id_informe; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.informes ALTER COLUMN id_informe SET DEFAULT nextval('public.informes_id_informe_seq'::regclass);


--
-- Name: novedades id_novedad; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.novedades ALTER COLUMN id_novedad SET DEFAULT nextval('public.novedades_id_novedad_seq'::regclass);


--
-- Name: versiones id_version; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.versiones ALTER COLUMN id_version SET DEFAULT nextval('public.versiones_id_version_seq'::regclass);


--
-- Data for Name: informes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.informes (id_informe, titulo, fecha_informe, estado, fk_version) FROM stdin;
\.


--
-- Data for Name: novedades; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.novedades (id_novedad, descripcion, fecha_novedad, estado, fk_version) FROM stdin;
\.


--
-- Data for Name: versiones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.versiones (id_version, numero_version, fecha_version, descripcion, estado) FROM stdin;
\.


--
-- Name: informes_id_informe_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.informes_id_informe_seq', 1, false);


--
-- Name: novedades_id_novedad_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.novedades_id_novedad_seq', 1, false);


--
-- Name: versiones_id_version_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.versiones_id_version_seq', 1, false);


--
-- Name: informes PK_295459f58935d098d0f9e59ea62; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.informes
    ADD CONSTRAINT "PK_295459f58935d098d0f9e59ea62" PRIMARY KEY (id_informe);


--
-- Name: novedades PK_58e6053de781666efd4ab718021; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.novedades
    ADD CONSTRAINT "PK_58e6053de781666efd4ab718021" PRIMARY KEY (id_novedad);


--
-- Name: versiones PK_669b8554292a6dbaef82cd0c4c8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.versiones
    ADD CONSTRAINT "PK_669b8554292a6dbaef82cd0c4c8" PRIMARY KEY (id_version);


--
-- Name: novedades FK_7030acf1aa2a7745971260b3d35; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.novedades
    ADD CONSTRAINT "FK_7030acf1aa2a7745971260b3d35" FOREIGN KEY (fk_version) REFERENCES public.versiones(id_version);


--
-- Name: informes FK_a58b48dd1e84599406b33de6a35; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.informes
    ADD CONSTRAINT "FK_a58b48dd1e84599406b33de6a35" FOREIGN KEY (fk_version) REFERENCES public.versiones(id_version);


--
-- PostgreSQL database dump complete
--

\unrestrict qpiyfYZ1Dnj1BeQYqxJe46k6tEEUdWGOvrxkXXOLawbTDSLvBRlOf0uNe7ebWEV

