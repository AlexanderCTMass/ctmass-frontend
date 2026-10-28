import type { Translations } from "../types";

export const shop: Translations["shop"] = {
  coins: "monedas",
  coinsAmount: "{{amount}} monedas",
  free: "Gratis",
  recommended: "Recomendado",
  items: "Artículos",
  quantity: "Cantidad",
  decrease: "Disminuir cantidad",
  increase: "Aumentar cantidad",
  removeItem: "Quitar artículo",
  addSize: "+ Agregar otra talla",
  contactDetails: "Datos de contacto",
  contactHint:
    "Se completó con tu perfil; actualízalo para este pedido si hace falta.",
  address: "Dirección",
  addressPlaceholder: "Calle, ciudad, estado, código postal",
  total: "Total",
  yourBalance: "Tu saldo",
  balanceAfter: "Saldo después",
  notEnough: "No tienes suficientes monedas para completar esta compra.",
  submitting: "Enviando…",
  validation: {
    emailRequired: "El correo es obligatorio",
    emailInvalid: "Ingresa un correo válido",
    phoneRequired: "El teléfono es obligatorio",
    addressRequired: "La dirección es obligatoria",
    messageRequired: "El mensaje es obligatorio",
  },
  errors: {
    unconfirmed:
      "No pudimos confirmar tu pedido porque se perdió la conexión. Revisa tu internet y vuelve a tocar el botón: no se te cobrará dos veces.",
    noProfile: "No se encontró el perfil de usuario",
    insufficient: "Saldo de monedas insuficiente",
    alreadyPurchased: "Ya compraste esta función",
    network:
      "No pudimos completar tu pedido. Revisa tu conexión e inténtalo de nuevo.",
  },
  done: {
    title: "¡Pedido realizado!",
    orderPrefix: "Tu pedido",
    orderSuffix: "se realizó.",
    ticket: "Ticket #{{ticket}}",
    followUp:
      "Nuestro equipo ya se encarga y te contactará pronto. Encuentra este pedido cuando quieras en Tienda → Mis pedidos.",
    bookCall: "Agenda una llamada con nuestro equipo",
  },
  form: {
    offer: {
      title: "Envía tu oferta",
      intro:
        "Cuéntanos sobre la oferta que quieres publicar. Nuestro equipo te contactará para confirmar los detalles y publicarla.",
      submit: "Enviar oferta",
      messageLabel: "Tu oferta / Mensaje",
      messagePlaceholder:
        "Describe tu servicio, producto u oferta: precios, condiciones, disponibilidad...",
    },
    merch: {
      title: "Haz tu pedido",
      intro:
        "Elige tallas y cantidades para tu pedido. Nuestro equipo confirmará contigo los detalles del envío.",
      submit: "Confirmar pedido",
      messageLabel: "Notas adicionales (opcional)",
      messagePlaceholder: "¿Algo que debamos saber sobre tu pedido?",
    },
    construction: {
      title: "Solicita esta oferta de construcción",
      intro:
        "Cuéntanos un poco sobre tu proyecto: fechas preferidas, detalles del sitio, fotos. Te contactaremos pronto.",
      submit: "Confirmar pedido",
      messageLabel: "Detalles del proyecto / Mensaje",
      messagePlaceholder:
        "Describe tu proyecto, las fechas preferidas, los detalles de la dirección...",
    },
    it: {
      title: "Solicita este servicio",
      intro:
        "Comparte tu idea: objetivos, alcance, enlaces de referencia. Nuestro equipo te contactará para definir el alcance.",
      submit: "Confirmar pedido",
      messageLabel: "Resumen del proyecto / Mensaje",
      messagePlaceholder:
        "Objetivos, alcance, plazos, enlaces de referencia...",
    },
    default: {
      title: "Confirmar compra",
      intro: "Revisa los detalles de tu pedido.",
      submit: "Confirmar pedido",
      messageLabel: "Mensaje (opcional)",
      messagePlaceholder: "¿Algo que debamos saber?",
    },
  },
  tab: {
    category: "Categoría",
    sortBy: "Ordenar por",
    rewards: "Recompensas disponibles",
    ordersA11y: "Ver mis pedidos",
    orders: "Mis pedidos",
    subtitle:
      "Usa tus monedas CTMASS en artículos exclusivos y beneficios de la plataforma.",
    sort: {
      default: "Predeterminado",
      price: "Precio",
    },
    balanceA11y: "Ver tu saldo de monedas y formas de ganar",
    noItems: "Ningún artículo coincide con tus filtros.",
  },
  card: {
    actions: {
      redeem: "Canjear",
      manage: "Administrar",
      buy_more: "Comprar más",
      post_offer: "Publicar oferta",
      not_enough: "Insuficiente",
    },
    oneTime: "Compra única",
  },
  earn: {
    added: "Se agregó a tu saldo",
    earnPrefix: "Gana",
    moreCoins: "{{amount}} monedas más",
    earnSuffix: "para desbloquear tu primera recompensa de la tienda.",
    enough:
      "¡Ya tienes suficientes monedas para tu primera recompensa de la tienda! 🎉",
    keepEarning: "Sigue ganando monedas para desbloquear recompensas.",
    openShop: "Abrir Tienda",
  },
  earnScreen: {
    title: "Cómo ganar monedas",
    gap: "Gana {{amount}} monedas más para desbloquear tu primera recompensa de la tienda.",
    completeBelow: "Completa las acciones de abajo para ganar monedas CTMASS.",
    ways: "Formas de ganar",
    waysText:
      "Completa estas acciones para ganar monedas y desbloquear recompensas.",
    once: "Solo una vez",
  },
  orders: {
    status: {
      active: "Pedido recibido",
      processing: "En proceso",
      completed: "Completado",
      cancelled: "Cancelado",
      expired: "Vencido",
      refunded: "Reembolsado",
    },
    justNow: "Justo ahora",
    quantity: "Cantidad: {{count}}",
    subtitle: "Todo lo que canjeaste con monedas CTMASS.",
    loadFailed: "No se pudieron cargar tus pedidos",
    empty: "Aún no hay pedidos",
    loadFailedText: "Revisa tu conexión y desliza hacia abajo para reintentar.",
    emptyText:
      "Las recompensas que canjees en la Tienda aparecerán aquí con su número de ticket.",
  },
  signInToOrder: "Debes iniciar sesión para hacer un pedido.",
  maybeLater: "Quizá después",
  selectPackage: "Elige un paquete",
};
