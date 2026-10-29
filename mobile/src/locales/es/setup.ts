import type { Translations } from "../types";

export const setup: Translations["setup"] = {
  validation: {
    name: "El nombre es obligatorio",
    phonePreferred: "Agrega tu teléfono y muéstralo en tus especialidades para ofrecer llamadas o mensajes.",
    emailPreferred: "Muestra tu correo en tus especialidades para ofrecer correo.",
  },
  saveFailed: "No se pudo guardar tu perfil. Inténtalo de nuevo.",
  deleteCertTitle: "¿Eliminar certificado?",
  deleteVideoTitle: "¿Eliminar historia en video?",
  removesFromProfile: "Se quitará de tu perfil.",
  introContractor:
    "Esta información se usa en todo CTMASS: tus chats, pedidos y tu perfil público de especialista.",
  introHomeowner:
    "Esta información se usa en todo CTMASS: tus chats, pedidos y tus solicitudes.",
  basicInfo: "Información básica",
  fullName: "Nombre completo",
  namePlaceholder: "Tu nombre",
  businessName: "Nombre del negocio / empresa",
  businessPlaceholder: "p. ej. Bay State Renovations",
  professionalTitle: "Título profesional",
  titlePlaceholder: "p. ej. Electricista con licencia",
  bio: "Acerca de / Biografía",
  bioPlaceholder:
    "Cuéntales a los propietarios sobre tu experiencia y especialidades.",
  phoneHint: "Número de EE. UU.: +1 seguido de 10 dígitos",
  businessDetails: "Datos del negocio",
  location: "Ubicación",
  socialGroups: "Grupos sociales",
  socialGroupsHint:
    "Agrega los roles y comunidades que te describen. Se muestran en tu perfil público.",
  editSocialGroups: "Editar grupos sociales",
  addSocialGroups: "+ Agregar grupos sociales",
  deleteCertA11y: "Eliminar certificado",
  editCertA11y: "Editar {{name}}",
  certPrivate: "Privado",
  certEmpty: "Agrega una licencia, certificación o diploma.",
  addCertA11y: "Agregar certificado",
  addCert: "+ Agregar certificado",
  video: "Video",
  items_one: "{{count}} elemento",
  items_other: "{{count}} elementos",
  views_one: "{{count}} vista",
  views_other: "{{count}} vistas",
  hidden: "Oculto",
  deleteVideoA11y: "Eliminar video",
  videoEmpty: "Comparte fotos y videos en tu perfil público.",
  addVideoA11y: "Agregar video",
  addVideo: "+ Agregar historia en video",
  saving: "Guardando…",
  save: "Guardar perfil",
  contact: "Contacto",
};

export const business: Translations["business"] = {
  errors: {
    year: "Ingresa un año válido, desde 1900 hasta este año.",
    website: "Ingresa un sitio web válido, p. ej. example.com",
    contactMethods: "Elige al menos una forma de contactarte.",
  },
  note: "Se comparte entre todas tus especialidades. La experiencia se indica por separado en cada una.",
  role: "Tu cargo",
  subcontractors: "Trabajo con subcontratistas cuando hace falta",
  founded: "Año de fundación",
  foundedHint:
    "Los años en el negocio se muestran por separado de la experiencia en la especialidad.",
  languages: "Idiomas en los que atiendes a tus clientes",
  showPhone: "Mostrar mi teléfono en mis especialidades",
  showPhoneHint:
    "Los propietarios verán un botón para llamarte. Los mensajes de CTMASS siempre están activos.",
  showEmail: "Mostrar mi correo en mis especialidades",
  contactMethodsHint: "Elige todas las formas en que los propietarios pueden contactarte. La primera se muestra como preferida.",
};

export const socialGroups: Translations["socialGroups"] = {
  subtitle:
    "Elige los roles y comunidades que te describen. Se muestran en tu perfil público.",
  search: "Buscar grupos…",
  selected: "Seleccionados: {{count}}",
  nothing: "No se encontró nada.",
  save: "Guardar selección",
};

export const qr: Translations["qr"] = {
  subtitle: "Escanea para abrir este perfil",
  reward: "Gana monedas CTMASS cuando alguien nuevo se registre con tu código.",
  sharing: "Compartiendo…",
  shareProfile: "Compartir perfil",
  showQr: "Mostrar código QR",
  qrCode: "Código QR",
};

export const share: Translations["share"] = {
  message: "Mira a {{name}} en CTMASS: {{url}}",
  qrTitle: "Compartir código QR",
};

export const media: Translations["media"] = {
  addPhoto: "Agregar una foto",
  takePhoto: "Tomar foto",
  chooseLibrary: "Elegir de la galería",
  addVideo: "Agregar un video",
  videoLimit: "Los videos pueden durar hasta {{count}} segundos.",
  recordVideo: "Grabar video",
  contentBlocked: "Quita el lenguaje inapropiado antes de publicar.",
};

export const itInquiry: Translations["itInquiry"] = {
  sendFailed: "No pudimos enviar tu mensaje. Inténtalo de nuevo.",
};

export const it: Translations["it"] = {
  contactUs: "Contáctanos",
  emailUs: "Escríbenos a {{email}}",
  chooseOrWrite: "Elige un servicio o escribe un mensaje.",
  sentTitle: "Mensaje enviado",
  sentText: "¡Gracias! Nuestro equipo te responderá pronto por correo.",
  failedTitle: "No se pudo enviar",
  failedText:
    "No pudimos enviar tu mensaje en este momento. Puedes escribirnos directamente por correo.",
  emailDirect: "Escribirnos por correo",
  inquiryTitle: "Habla con nuestro equipo de TI",
  heroTitle: "Agenda una consulta gratis de 30 min",
  heroText:
    "Cuéntanos qué necesitas y elige un horario que te convenga. Nos reuniremos por Google Meet, sin necesidad de monedas.",
  yourDetails: "Tus datos",
  name: "Nombre",
  messagePlaceholder: "Cuéntanos sobre tu proyecto o tu pregunta",
  chooseTime: "Elegir horario",
  sendWithoutA11y: "Enviar un mensaje sin agendar una llamada",
  sendInstead: "Mejor solo enviar un mensaje",
  servicesTitle: "Creamos software para tu negocio",
  servicesText:
    "Nuestro propio equipo crea sitios web, apps móviles, CRM y automatización con IA a medida. Agenda una llamada gratis de 30 minutos para conversar sobre tu idea.",
  bookAboutA11y: "Agendar una llamada sobre {{name}}",
  bookFree: "Agendar llamada gratis",
  payCoins: "Paga con monedas CTMASS",
  payCoinsText:
    "Todos los servicios de arriba también se pueden canjear con las monedas que ganas en la plataforma.",
  bookFree30: "Agendar llamada gratis de 30 min",
  bookingTitle: "Agenda una consulta gratis",
  calendarFailed: "No se pudo cargar el calendario",
  calendarFailedText:
    "Revisa tu conexión e inténtalo de nuevo. Ya tenemos tu solicitud y te contactaremos por correo.",
  booked: "¡Listo, quedó agendado!",
  bookedText:
    "Revisa tu correo para ver la invitación del calendario y el enlace de Google Meet. ¡Nos vemos en la llamada!",
};
