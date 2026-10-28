import type { Translations } from "../types";

export const tradeSetup: Translations["tradeSetup"] = {
  yourTrade: "Tu especialidad",
  publish: "Publicar especialidad",
  filterError: "Quita el lenguaje inapropiado de los datos de tu especialidad.",
  steps: {
    trade: {
      title: "¿Cuál es tu especialidad?",
      subtitle:
        "Empieza con una especialidad. Puedes agregar más a tu perfil después.",
    },
    services: {
      title: "Servicios y experiencia",
      subtitle: "La experiencia cuenta solo para esta especialidad.",
    },
    pricing: {
      title: "Precios",
      subtitle:
        "Los precios claros ayudan a los propietarios a comparar. Los montos son opcionales.",
    },
    area: {
      title: "Dónde y cuándo trabajas",
      subtitle: "Los propietarios ven tu ciudad, tu radio y tu horario.",
    },
    details: {
      title: "Últimos detalles",
      subtitle:
        "Opcional, pero los perfiles completos reciben más solicitudes.",
    },
  },
  ready: {
    eyebrow: "Ya casi",
    title: "Inicia sesión para publicar tu especialidad",
    subtitle:
      "Guardamos todo lo que ingresaste. Crea tu cuenta gratis y tu especialidad quedará visible para los propietarios cercanos.",
    cta: "Inicia sesión para publicar",
  },
  done: {
    publishing: "Publicando tu especialidad…",
    failedTitle: "No se pudo publicar tu especialidad",
    failedText:
      "Revisa tu conexión a internet e inténtalo de nuevo. Todo lo que ingresaste está guardado.",
    title: "Especialidad creada",
    subtitle:
      "Tu especialidad ya está activa en la app: los propietarios pueden encontrarla en la búsqueda y tú ya puedes responder a trabajos cercanos.",
    coinsTitle: "Gana monedas CTMASS con tu especialidad",
    coinsNote: "Úsalas en recompensas de la Tienda.",
    bonus: {
      portfolio: "Agrega un proyecto a tu portafolio",
      complete: "Completa un trabajo a través de CTMASS",
      invite: "Invita a un amigo que se registre",
    },
    dashboard: "Ir a mi panel",
    viewTrades: "Ver mis especialidades",
  },
};

export const chooseSpecialty: Translations["chooseSpecialty"] = {
  eyebrow: "Nuevo proyecto",
  title: "¿Cuál es tu proyecto?",
  subtitle: "Elige el tipo de especialista que buscas.",
  otherPlaceholder: "Describe el especialista que necesitas",
};

export const specialists: Translations["specialists"] = {
  requestNumber: "Solicitud #{{id}}",
  yourProject: "Tu proyecto",
  signedIn: "Ya iniciaste sesión: escríbele a cualquier especialista de abajo.",
  fallback:
    "Aún no hay una coincidencia exacta: mostramos especialistas relacionados cerca de ti.",
  searching: "Buscando especialistas cerca de ti…",
  emptyTitle: "Aún no hay especialistas",
  emptyAuthed:
    "Seguimos creciendo en tu zona: te avisaremos en cuanto aparezca alguien.",
  emptyGuest:
    "Seguimos creciendo en tu zona. Inicia sesión y te avisaremos en cuanto aparezca alguien.",
  goHome: "Ir al inicio",
  loginToMessage: "Inicia sesión para escribir",
  freeAccount: "Cuenta gratis, sin tarjeta de crédito.",
};
