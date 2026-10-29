import type { Translations } from "../types";

export const tabs: Translations["tabs"] = {
  home: "Inicio",
  chats: "Chats",
  shop: "Tienda",
  profile: "Perfil",
};

export const home: Translations["home"] = {
  status: {
    inProgress: "en curso",
    open: "abierta",
    completed: "completada",
    cancelled: "cancelada",
    inReview: "en revisión",
    draft: "borrador",
  },
  menuQuestion: "¿Qué quieres hacer con esta solicitud?",
  archive: "Archivar",
  invited: "Invitación",
  openChat: "Abrir chat",
  heroTitle: "¿Qué necesitas hacer?",
  heroText:
    "Publica una solicitud y los especialistas locales te contactarán. Tú decides a quién contratar.",
  steps: {
    describe: {
      title: "Describe el trabajo",
      text: "Responde unas preguntas rápidas sobre lo que necesitas.",
    },
    offers: {
      title: "Recibe respuestas",
      text: "Los especialistas locales te escriben por chat.",
    },
    hire: {
      title: "Contrata al profesional indicado",
      text: "Compara calificaciones y reseñas, y elige.",
    },
  },
  page: "Página {{page}} de {{total}}",
  firstPage: "Volver a la primera página",
  archived: "Solicitud archivada",
  viewRequest: "Ver solicitud",
  responded: "Respondida",
  viewRespond: "Ver detalles y responder",
  directRequests: "Solicitudes directas",
  directHint:
    "Los propietarios te enviaron estas solicitudes directamente. Desliza a la derecha para marcar Me gusta, a la izquierda para archivar, o responde por chat.",
  myRequests: "Mis solicitudes",
  likedRequests: "Solicitudes que te gustan",
  nearby: "Solicitudes cercanas",
  archiveCount: "Archivo ({{count}})",
  all: "Todas",
  liked: "Me gusta",
  forYou: "Para ti",
  newest: "Más recientes",
  noLikedTitle: "Aún no tienes solicitudes guardadas",
  noLikedText:
    "Desliza una solicitud a la derecha o toca el corazón para guardarla aquí. Tus Me gusta son privados.",
  noNearbyTitle: "No hay solicitudes abiertas cerca",
  noNearbyText:
    "Los trabajos nuevos de tu zona aparecerán aquí. Vuelve a revisar pronto.",
  postRequest: "Publicar una solicitud",
  newRequest: "Nueva solicitud",
  browseA11y: "Explorar especialistas y solicitar uno directamente",
  chooseYourself: "O elige un especialista tú mismo",
  myJobs: "Mis trabajos",
  createTrade: "Crear una especialidad nueva",
  newTrade: "Nueva especialidad",
};
