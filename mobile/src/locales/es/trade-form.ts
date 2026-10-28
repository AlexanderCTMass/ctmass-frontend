import type { Translations } from "../types";

export const form: Translations["form"] = {
  optional: "Opcional",
};

export const tradeForm: Translations["tradeForm"] = {
  errors: {
    numbersOnly: "Solo números.",
    title: "Ingresa un nombre para la especialidad.",
    specialty: "Elige tu especialidad.",
    customSpecialty: "Describe tu especialidad.",
    yearsRealistic: "Ingresa un número de años realista.",
    rateMax: "La tarifa máxima debe ser mayor.",
    years: "Agrega tus años en esta especialidad.",
    services: "Elige al menos un servicio.",
    pricingModel: "Elige cómo cobras esta especialidad.",
    days: "Elige cuándo trabajas.",
    location: "Agrega tu ubicación de servicio.",
  },
  tradeName: "Nombre de la especialidad",
  tradeNameHint:
    "Lo que los propietarios ven en tu tarjeta, p. ej. el nombre de tu negocio y la especialidad.",
  tradeNamePlaceholder: "p. ej. Plomería Mike",
  primaryTrade: "Especialidad principal",
  primaryTradeHint:
    "Cada especialidad tiene su propia página con su experiencia, precios y reseñas. Agrega tus otras especialidades después.",
  describeTrade: "Describe tu especialidad",
  addService: "Agrega tu propio servicio",
  servicesSelected:
    "{{count}}/{{max}} seleccionados. Toca un servicio para quitarlo.",
  services: "Servicios que ofreces",
  servicesHint:
    "Trabajos específicos que haces en esta especialidad. Los propietarios los ven en tu tarjeta.",
  yearsHint:
    "Solo experiencia práctica en esta especialidad, no toda tu carrera ni los años de tu negocio.",
  yearsPlaceholder: "p. ej. 8",
  yearsNote:
    "Se muestra tal como lo indicas. CTMASS no verifica la experiencia.",
  pricingModel: "¿Cómo cobras esta especialidad?",
  pricingModelHint: "Cada especialidad tiene sus propios precios.",
  rateHint: "Ingresa un monto o un rango.",
  from: "Desde",
  to: "Hasta",
  example: "p. ej. {{value}}",
  serviceCallFee: "Cargo por visita / diagnóstico",
  credited: "Se descuenta de la reparación",
  travelFee: "Cargo por traslado",
  travelPlaceholder: "p. ej. Gratis hasta 15 millas, luego $1/milla",
  afterHours: "Precios fuera de horario / emergencias",
  afterHoursPlaceholder: "p. ej. +50% después de las 6pm, $150 por salida",
  materials: "Materiales y piezas",
  materialsPlaceholder: "p. ej. Las piezas se cobran aparte",
  pricingNote: "Nota sobre precios",
  pricingNotePlaceholder:
    "Cualquier otra cosa que deban saber los propietarios",
  location: "Ubicación del negocio",
  locationHint:
    "Se usa para medir distancias. Los propietarios solo ven tu ciudad y estado.",
  towns: "Ciudades que atiendes",
  townsHint: "Sepáralas con comas.",
  townsPlaceholder: "p. ej. Hartford, West Hartford, Glastonbury",
  days: "Días de trabajo",
  hours: "Horario de trabajo",
  newWork: "Trabajos nuevos",
  accepting: "Acepto proyectos nuevos",
  acceptingHint: "Desactívalo cuando tengas la agenda llena.",
  emergency: "Servicio de emergencia",
  emergencyPlaceholder: "Horario, cargo extra y zona de cobertura",
  responseTime: "Tiempo de respuesta habitual",
  responseTimeHint:
    "Tu propio compromiso. Se muestra como “Indicado por el contratista”.",
  contactNote:
    "Se comparte entre todas tus especialidades. También puedes cambiarlo en Editar perfil.",
  phoneHint:
    "Se muestra en tus especialidades para que los propietarios te llamen o te escriban.",
  about: "Sobre tu trabajo",
  aboutHint: "Proyectos típicos, qué te hace diferente.",
  aboutPlaceholder: "Qué haces, cómo trabajas, qué te hace destacar…",
  estimatePlaceholder: "p. ej. Presupuesto por escrito en 48 horas",
  warrantyPlaceholder: "Qué cubre y qué no",
  workBy: "Quién hace el trabajo",
};

export const tradePicker: Translations["tradePicker"] = {
  search: "Busca especialidades, p. ej. cargador",
  notOnList: "No está en la lista",
  noMatch: "No hay coincidencias. Elige “Otro” y descríbela.",
};
