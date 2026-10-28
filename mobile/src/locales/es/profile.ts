import type { Translations } from "../types";

export const profile: Translations["profile"] = {
  tab: {
    title: "Perfil",
    yourProfile: "Tu perfil",
    removePhotoFailed: "No se pudo quitar la foto",
    photoTitle: "Foto de perfil",
    viewPhoto: "Ver foto",
    choosePhoto: "Elegir otra foto",
    removePhoto: "Quitar foto",
    uploadPhotoFailed: "No se pudo subir la foto",
    leaveFeedback: "Dejar opinión",
    ratingUnavailable:
      "La calificación no está disponible en este dispositivo. Escríbenos a support@ctmass.com",
    storeOpenFailed: "No se pudo abrir la tienda",
    contactSupport: "Contactar a soporte",
    emailSupport: "Escríbenos a support@ctmass.com",
    deleteFailed: "No se pudo eliminar la cuenta",
    logoutFailed: "No se pudo cerrar sesión",
    logoutConfirmTitle: "¿Cerrar sesión?",
    logoutConfirmText: "Puedes volver a iniciar sesión cuando quieras.",
    logout: "Cerrar sesión",
    deleteConfirmTitle: "¿Eliminar cuenta?",
    deleteConfirmText:
      "Esto elimina de forma permanente tu cuenta y todos tus datos: perfil, mensajes, proyectos y monedas. No se puede deshacer.",
    guestTitle: "Inicia sesión en tu perfil",
    guestText:
      "Crea una cuenta gratis para configurar tu perfil, administrar notificaciones y más.",
    changePhotoA11y: "Cambiar foto de perfil",
    uploadPhotoA11y: "Subir foto de perfil",
    showQrA11y: "Mostrar mi código QR",
    myQr: "Mi QR",
    setupTitle: "Configura tu perfil",
    setupSub: "Agrega tus datos para que la gente te reconozca.",
    viewPublic: "Ver perfil público",
    notifications: "Notificaciones",
    invite: "Invita amigos y gana monedas",
    friends: "Amigos",
    itServices: "Nuestros servicios de TI",
    deleteAccount: "Eliminar cuenta",
    deleting: "Eliminando tu cuenta…",
    loggingOut: "Cerrando sesión…",
    qrSubtitle: "Escanea para abrir mi perfil y conectar",
  },
  theme: {
    title: "Apariencia",
    options: {
      system: "Sistema",
      light: "Claro",
      dark: "Oscuro",
    },
    optionA11y: "Tema {{label}}",
    systemHint:
      "Sistema mantiene el tema que usaba tu teléfono cuando lo elegiste. Toca Sistema otra vez para aplicar un cambio.",
    fixedHint: {
      light: "La app siempre usa el tema claro.",
      dark: "La app siempre usa el tema oscuro.",
    },
  },
  language: {
    title: "Idioma",
    hint: "Desliza o toca para cambiar el idioma de la app.",
  },
};
