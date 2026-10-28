import type { Translations } from "../types";

export const notifications: Translations["notifications"] = {
  offTitle: "Las notificaciones están desactivadas",
  offText:
    "Activa las notificaciones para recibir mensajes, novedades de proyectos y recordatorios en este dispositivo.",
  enable: "Activar notificaciones",
  choose: "Elige qué recibir",
  messages: "Mensajes nuevos",
  messagesText: "Recibe un aviso cuando alguien te escriba.",
  responses: "Respuestas a tus solicitudes",
  responsesText:
    "Cuando un especialista responde a un proyecto que publicaste.",
  projects: "Proyectos nuevos que coinciden",
  projectsText:
    "Cuando un proyecto nuevo coincide con tu especialidad o está abierto a todos.",
  reminders: "Recordatorios",
  remindersText: "Avisos ocasionales cuando llevas tiempo sin entrar.",
};

export const invite: Translations["invite"] = {
  ownEmail: "Ese es tu propio correo.",
  failed: "No se pudo enviar la invitación. Inténtalo de nuevo.",
  title: "Invitar a un amigo",
  heroTitle: "Trae a un amigo a CTMASS",
  heroText:
    "Ingresa su correo y le enviaremos una invitación. Cuando se registre, quedarán conectados como amigos automáticamente.",
  alreadyFriends: "{{email}} ya está en CTMASS: ahora son amigos.",
  sent: "Invitación enviada a {{email}}. Quedarán conectados cuando se registre. Si no encuentra el correo, pídele que revise la carpeta de spam.",
  email: "Correo de tu amigo",
  sending: "Enviando…",
  send: "Enviar invitación",
};

export const friends: Translations["friends"] = {
  loading: "Cargando…",
  emptyTitle: "Aún no tienes amigos",
  emptyText:
    "Invita a personas que conoces: cuando se registren, aparecerán aquí.",
  messageA11y: "Escribir a {{name}}",
  opening: "Abriendo…",
};

export const certificate: Translations["certificate"] = {
  errors: {
    type: "El tipo de documento es obligatorio",
    institution: "La organización emisora es obligatoria",
  },
  saveFailed: "No se pudo guardar el certificado. Inténtalo de nuevo.",
  title: "Agregar certificado",
  intro:
    "Agrega una licencia, certificación o diploma. Los documentos públicos aparecen en tu perfil público.",
  type: "Tipo de documento",
  typePlaceholder: "p. ej. Licencia, Certificado, Diploma",
  institution: "Organización emisora",
  institutionPlaceholder: "p. ej. Estado de Massachusetts",
  specialty: "Especialidad / área (opcional)",
  specialtyPlaceholder: "p. ej. Electricista maestro",
  year: "Año (opcional)",
  addPhoto: "Agregar foto",
  public: "Mostrar en mi perfil",
  publicHint: "Los propietarios pueden ver este certificado en tu perfil y tus especialidades.",
  privateHint: "Solo tú puedes verlo. Tus especialidades siguen mostrando Con licencia.",
  save: "Guardar certificado",
  needPhoto: "Agrega al menos una foto de tu certificado.",
  editTitle: "Editar certificado",
  number: "Número de documento (opcional)",
  privacyTitle: "Privacidad",
  privacyNote:
    "Elige qué pueden ver los propietarios. Los datos ocultos se quedan en tu cuenta.",
  showInstitution: "Mostrar organización emisora",
  showSpecialty: "Mostrar especialidad",
  showYear: "Mostrar año",
  showNumber: "Mostrar número de documento",
  showPhotos: "Mostrar fotos del documento",
  showPhotosHint: "Las fotos pueden incluir tu dirección, número de identificación o firma.",
  missing: "Este certificado ya no está disponible.",
};

export const videoStory: Translations["videoStory"] = {
  addTitle: "Agregar a tu historia",
  needCover: "Agrega una imagen de portada para tu historia.",
  needContent: "Agrega al menos una foto o un video.",
  failed: "No se pudo publicar tu historia. Inténtalo de nuevo.",
  title: "Nueva historia en video",
  chooseCover: "Elegir imagen de portada",
  changeCover: "Cambiar portada",
  addCover: "Agrega una portada",
  coverHint: "La miniatura que tocan para reproducir",
  clips: "Clips de la historia",
  clipsHint:
    "Agrega hasta 3 fotos o videos (de hasta 90 s). Cualquiera puede verlos, darles Me gusta y reportarlos.",
  remove: "Quitar",
  addContent: "Agregar contenido",
  details: "Detalles",
  detailsHint:
    "Opcional: un título y una nota ayudan a que la gente encuentre tu historia.",
  titleLabel: "Título",
  titlePlaceholder: "p. ej. Remodelación de cocina",
  description: "Descripción",
  descriptionPlaceholder: "Cuéntales de qué se trata",
  publishing: "Publicando…",
  publish: "Publicar historia",
  tooLongTitle: "Video demasiado largo",
  tooLongText: "Los videos deben durar entre 1 y 90 segundos.",
  photoOrVideo: "Foto o video",
  signInLike: "Crea una cuenta gratis para dar Me gusta a los videos.",
  signInReport: "Crea una cuenta gratis para reportar videos.",
  thanks: "Gracias",
  thanksText: "Gracias por reportarlo. Nuestro equipo lo revisará.",
};
