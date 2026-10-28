import type { Translations } from "../types";

export const search: Translations["search"] = {
  title: "Buscar un especialista",
  placeholder: "Busca por nombre, especialidad o correo",
  emailHint: "Toca buscar para encontrar este correo.",
  archived: "Especialista archivado",
  archivedTab: "Archivados",
  badges: {
    top: "Mejor calificados",
    new: "Nuevo",
  },
  groups: {
    archived: "Especialistas archivados",
    liked: "Especialistas que te gustan",
    matches: "Coincidencias",
    top: "Mejor calificados",
    recent: "Recién llegados",
    more: "Más especialistas",
  },
  empty: {
    likedTitle: "Aún no tienes especialistas guardados",
    archiveTitle: "El archivo está vacío",
    noneTitle: "No se encontraron especialistas",
    likedText:
      "Desliza un especialista a la derecha o toca el corazón para guardarlo aquí. Tus Me gusta son privados.",
    archiveText:
      "Los especialistas que deslices a la izquierda aparecerán aquí. Desliza a la derecha para recuperarlos.",
    noneQuery:
      "Prueba con otro nombre, especialidad, correo o una distancia mayor.",
    noneText: "Los especialistas aparecerán aquí.",
    noneFilters: "Ningún especialista coincide con estos filtros. Prueba quitar uno.",
  },
  filters: {
    trade: "Especialidad",
    tradeTitle: "Filtrar por especialidad",
    language: "Idioma",
    languageTitle: "Habla",
    clearAll: "Quitar todo",
    clearOne: "Quitar el filtro {{name}}",
  },
};
