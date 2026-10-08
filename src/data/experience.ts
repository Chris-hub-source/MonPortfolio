export type Localized = { fr: string; en: string };

export type ExperienceItem = {
  period: Localized;
  role: Localized;
  company: string;
  description: Localized;
};

export type EducationItem = {
  period: Localized;
  degree: Localized;
  school: string;
};

export const experience: ExperienceItem[] = [
  {
    period: { fr: "Depuis mai 2026", en: "Since May 2026" },
    role: { fr: "Développeur web freelance", en: "Freelance Web Developer" },
    company: "God Willing Agency",
    description: {
      fr: "Conception d'un site web dynamique pour une agence de voyage : présentation des offres de voyage et prise de contact avec les clients.",
      en: "Designed a dynamic website for a travel agency: presentation of travel offers and customer contact.",
    },
  },
  {
    period: { fr: "Mai – août 2026", en: "May – Aug 2026" },
    role: {
      fr: "Développeur Full-Stack (stage)",
      en: "Full-Stack Developer (internship)",
    },
    company: "Moov Africa Togo",
    description: {
      fr: "Conception et développement d'une application PWA de gestion de flottes et d'activation de forfaits sur les lignes téléphoniques d'entreprise. Mise en place d'une authentification à double facteur (OTP par email) et d'une gestion des rôles (JWT, BCrypt).",
      en: "Designed and built a PWA to manage fleets and activate plans on corporate phone lines. Implemented two-factor authentication (email OTP) and role management (JWT, BCrypt).",
    },
  },
  {
    period: { fr: "Déc. 2025 – fév. 2026", en: "Dec 2025 – Feb 2026" },
    role: {
      fr: "Développeur Full-Stack (projet académique)",
      en: "Full-Stack Developer (academic project)",
    },
    company: "ESAG-NDE",
    description: {
      fr: "Développement d'une plateforme de partage d'épreuves : consultation, recherche et téléchargement de sujets d'examen classés par matière, niveau et année, avec filtrage multicritère et espace d'administration.",
      en: "Built an exam-paper sharing platform: browse, search and download past exams sorted by subject, level and year, with multi-criteria filtering and an admin area.",
    },
  },
];

export const education: EducationItem[] = [
  {
    period: { fr: "Depuis oct. 2025", en: "Since Oct 2025" },
    degree: {
      fr: "Licence 3 en Informatique, parcours développement d'applications",
      en: "Bachelor's, year 3, Computer Science (application development track)",
    },
    school: "ESAG-NDE",
  },
  {
    period: { fr: "Oct. 2023 – juil. 2025", en: "Oct 2023 – Jul 2025" },
    degree: {
      fr: "Licence 1 et 2 en Informatique, parcours développement d'applications",
      en: "Bachelor's, years 1 and 2, Computer Science (application development track)",
    },
    school: "ESAG-NDE",
  },
];