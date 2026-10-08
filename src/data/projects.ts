import type { Localized } from "./experience";

export type ProjectKind = "real" | "study" | "other";

export type Project = {
  id: string;
  kind: ProjectKind; 
  title: Localized;
  description: Localized;
  tech: string[];
  year?: number;
  image?: string;
  demo?: string; 
};

export const projects: Project[] = [
  {
    id: "moov-corporate",
    kind: "real",
    title: { fr: "Moov Corporate", en: "Moov Corporate" },
    description: {
      fr: "Application PWA de gestion de flottes et d'activation de forfaits sur les lignes téléphoniques d'entreprise, avec double authentification par OTP email et gestion des rôles.",
      en: "PWA to manage fleets and activate plans on corporate phone lines, with two-factor authentication by email OTP and role management.",
    },
    tech: ["Next.js", "C#", "PostgreSQL", "PWA"],
    year: 2026,
    image: "/images/projects/moov-corporate.webp",
  },
  {
    id: "miabe-clinik",
    kind: "study", 
    title: { fr: "Miabe Clinik", en: "Miabe Clinik" },
    description: {
      fr: "Plateforme web de gestion de clinique : un espace dédié pour échanger avec l'équipe médicale, prendre rendez-vous et assurer le suivi personnalisé du parcours de soins.",
      en: "Web platform to manage a clinic: a dedicated space to communicate with the medical team, book appointments and follow each patient's care journey.",
    },
    tech: ["Laravel"],
    image: "/images/projects/miabe-clinik.webp",
  },
  {
    id: "eganye",
    kind: "other", 
    title: { fr: "Eganye", en: "Eganye" },
    description: {
      fr: "Application mobile de gestion de tontines : rejoindre une tontine, effectuer des paiements et devenir administrateur d'un groupe.",
      en: "Mobile app to manage tontines (rotating savings groups): join a tontine, make payments and become a group administrator.",
    },
    tech: ["Flutter", "Laravel", "MySQL"],
    image: "/images/projects/eganye.webp",
  },
  {
    id: "ebbct-cantiques",
    kind: "other", 
    title: { fr: "EBBCT Cantiques", en: "EBBCT Hymns" },
    description: {
      fr: "Application mobile de cantiques des Églises baptistes bibliques Calvaire du Togo : bibliothèque de cantiques, favoris, partitions PDF et vidéos YouTube.",
      en: "Hymn app for the Baptist Bible Churches Calvaire of Togo: hymn library, favourites, PDF sheet music and YouTube videos.",
    },
    tech: ["Flutter", "Supabase"],
    year: 2026,
    image: "/images/projects/ebbct-cantiques.webp",
  },
  {
    id: "god-willing-agency",
    kind: "real",
    title: { fr: "God Willing Agency", en: "God Willing Agency" },
    description: {
      fr: "Site web dynamique pour une agence de voyage : présentation des offres de voyage et prise de contact des clients.",
      en: "Dynamic website for a travel agency: presentation of travel offers and customer contact.",
    },
    tech: ["Next.js"], 
    demo: "https://godwillingagency.com",
    image: "/images/projects/god-willing-agency.webp",
  },
 /* {
    id: "Stock Epreuves",
    kind: "study",
    title: {
     //fr: "Plateforme de partage d'épreuves",
      en: "Exam paper sharing platform",
    },
    description: {
      fr: "Application web pour consulter, rechercher et télécharger des sujets d'examen classés par matière, niveau et année, avec filtrage multicritère et espace d'administration.",
      en: "Web app to browse, search and download past exams sorted by subject, level and year, with multi-criteria filtering and an admin area.",
    },
    tech: ["Laravel", "MySQL"], // à compléter
    year: 2026,
  },*/
];