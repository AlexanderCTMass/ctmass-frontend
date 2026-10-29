import type { Translations } from "../types";

export const jobs: Translations["jobs"] = {
  status: {
    completed: "Completado",
    cancelled: "Cancelado",
    inProgress: "En curso",
  },
  directJob: "Trabajo directo",
  cancelJob: "Cancelar trabajo",
  cancelFailed: "No se pudo cancelar",
  cancelTitle: "¿Cancelar este trabajo?",
  cancelText: "Se notificará al cliente. No se puede deshacer.",
  keepJob: "Conservar trabajo",
  active: "Activos",
  history: "Historial",
  emptyActive: "No hay trabajos activos",
  emptyHistory: "Aún no hay trabajos anteriores",
  emptyActiveText: "Aquí aparecen los trabajos para los que te eligieron.",
  emptyHistoryText: "Aquí aparecen los trabajos completados y cancelados.",
};

export const myRequest: Translations["myRequest"] = {
  yourSpecialist: "Tu especialista",
  specialist: "Especialista",
  working: "Trabajando en tu proyecto",
  forThisJob: "Especialistas para este trabajo",
  finding: "Buscando especialistas…",
  noSpecialists:
    "Aún no hay especialistas: te avisaremos en cuanto aparezca alguien.",
  cancelTitle: "¿Cancelar esta solicitud?",
  cancelText:
    "No se puede deshacer. Se notificará a cualquier especialista que esté trabajando en ella.",
  keep: "Conservar solicitud",
  cancel: "Cancelar solicitud",
  cancelling: "Cancelando…",
  looking: "Buscando especialistas",
  unavailable: "Esta solicitud ya no está disponible.",
  wasCancelled: "Esta solicitud se canceló.",
  tapProfile: "Toca para ver el perfil",
};

export const requestDetail: Translations["requestDetail"] = {
  messageRequired: "Escribe un mensaje corto.",
  sendFailed: "No se pudo enviar tu respuesta. Inténtalo de nuevo.",
  signIn: "Inicia sesión para responder",
  signInText:
    "Crea una cuenta gratis para enviar tu respuesta y escribirle al propietario.",
  messagePlaceholder: "Mensaje para el propietario",
  pricePlaceholder: "Precio estimado, $",
  createTradeTitle: "Crea una especialidad para responder",
  createTradeText:
    "Configura tu especialidad para que los propietarios sepan a quién contratan. Solo toma un minuto y luego podrás responder.",
  send: "Enviar respuesta",
  yourResponse: "Tu respuesta",
  ownRequest: "Esta es tu propia solicitud.",
};

export const archive: Translations["archive"] = {
  title: "Solicitudes archivadas",
  subtitle:
    "Desliza a la derecha o usa el menú para devolver una solicitud al Inicio.",
  emptyText:
    "Las solicitudes que deslices a la izquierda en Inicio aparecerán aquí.",
  badge: "Archivada",
  viewDetails: "Ver detalles",
  inProgressTitle: "Este trabajo está en curso",
  inProgressText:
    "Te eligieron para este proyecto. Cancélalo primero en el chat y luego podrás eliminarlo.",
  deleteTitle: "¿Eliminar esta solicitud?",
  deleteText:
    "Se quitará de tu lista y se le avisará al propietario que la rechazaste.",
  keep: "Conservar",
};

export const contact: Translations["contact"] = {
  chatFailed: "No se pudo abrir el chat",
  callFailed: "No se puede hacer la llamada",
  compareFullTitle: "Compara hasta {{count}}",
  compareFullText:
    "Quita a un contratista de tu comparación para agregar otro.",
};

export const report: Translations["report"] = {
  submittedTitle: "Reporte enviado",
  submittedText: "Gracias, nuestro equipo lo revisará pronto.",
  failed: "No se pudo enviar",
  title: "Reportar a {{name}}",
  reason: "Motivo",
  placeholder: "Describe lo que pasó…",
  attach: "Adjuntar una foto (opcional)",
  submit: "Enviar reporte",
  videoA11y: "Reportar video",
  reported: "Reportado",
  dismiss: "Cerrar reporte",
  videoTitle: "Reportar este video",
  videoSubtitle: "Cuéntanos qué está mal para que nuestro equipo lo revise.",
  videoPlaceholder: "Describe el problema",
};

export const ads: Translations["ads"] = {
  sponsoredA11y: "Patrocinado: {{label}}",
  sponsored: "Patrocinado",
};
