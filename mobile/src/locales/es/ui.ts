import type { Translations } from "../types";

export const ui: Translations["ui"] = {
  sortA11y: "Ordenar: {{label}}",
  goBack: "Volver",
  removeLike: "Quitar Me gusta",
  like: "Me gusta",
  unlike: "Ya no me gusta",
  restore: "Restaurar",
  distanceLabel: "Distancia desde la ubicación (millas)",
  errorTitle: "Algo salió mal",
  errorText: "No pudimos cargar la app esta vez. Inténtalo de nuevo.",
  nothingToShow: "No hay nada que mostrar.",
};

export const location: Translations["location"] = {
  title: "Elegir ubicación",
  search: "Busca la dirección del servicio",
  hint: "Arrastra el pin o toca el mapa para ajustarla.",
  use: "Usar esta ubicación",
  setA11y: "Elegir ubicación del servicio",
  placeholder: "Elige la dirección del servicio",
  usOnly:
    "CTMASS solo está disponible en Estados Unidos. Elige una dirección de EE. UU.",
};
