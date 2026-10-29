import type { Translations } from "../types";

export const portfolio: Translations["portfolio"] = {
  errors: {
    title: "Ponle un título corto al proyecto.",
    location: "¿Dónde se hizo este trabajo?",
    description: "Debe tener menos de 1000 caracteres.",
    after: "Agrega una foto del después.",
  },
  updateFailed: "No se pudo actualizar",
  deleteTitle: "¿Eliminar este proyecto?",
  deleteText: "Se quitará de tu portafolio. No se puede deshacer.",
  unavailable: "Este proyecto no está disponible.",
  sliderHint:
    "Arrastra el control para comparar. Toca una foto para ampliarla.",
  before: "Antes",
  after: "Después",
  openPhotoA11y: "Abrir foto: {{label}}",
  visible: "Visible para todos",
  tapToHide: "Toca para ocultarlo de tu especialidad pública.",
  tapToShow: "Solo tú puedes verlo. Toca para mostrarlo.",
  featured: "Destacado",
  feature: "Destacar este proyecto",
  featuredHint: "Los proyectos destacados se muestran primero.",
  edit: "Editar proyecto",
  add: "Agregar proyecto",
  changePhotoA11y: "Cambiar foto: {{label}}",
  addPhotoA11y: "Agregar foto: {{label}}",
  removePhotoA11y: "Quitar foto: {{label}}",
  addDate: "+ Agregar cuándo se hizo",
  prevMonth: "Mes anterior",
  nextMonth: "Mes siguiente",
  removeDate: "Quitar fecha",
  filterError: "Quita el lenguaje inapropiado de tu proyecto.",
  saveFailed:
    "No se pudo guardar el proyecto. Revisa tu conexión e inténtalo de nuevo.",
  intro:
    "Muestra un trabajo terminado. La foto del antes es opcional, pero las parejas antes/después atraen más atención.",
  when: "¿Cuándo se hizo?",
  titleLabel: "Título del proyecto",
  titlePlaceholder: "p. ej. Cambio de llave de cocina",
  locationHint: "Basta con la ciudad y el estado.",
  locationPlaceholder: "p. ej. Hartford, Connecticut",
  whatDid: "¿Qué hiciste?",
  optionalHint: "Opcional.",
  whatDidPlaceholder: "El problema, lo que hiciste y el resultado.",
  projectType: "Tipo de proyecto",
  cost: "Costo aproximado",
  costHint: "Opcional. Déjalo vacío para mantenerlo privado.",
  duration: "¿Cuánto tiempo tomó?",
  tags: "Etiquetas",
  tagsHint: "Opcional, hasta {{count}}. p. ej. llave, cocina",
  removeTagA11y: "Quitar etiqueta {{tag}}",
  addTag: "Agregar una etiqueta",
  saveChanges: "Guardar cambios",
  addToPortfolio: "Agregar al portafolio",
  cantEdit: "Este proyecto no se puede editar.",
  beforeAfter: "Antes / Después",
  delete: "Eliminar proyecto",
};

export const review: Translations["review"] = {
  stars_one: "{{count}} estrella",
  stars_other: "{{count}} estrellas",
  placeholder: "Agrega un comentario (opcional)",
  submit: "Enviar reseña",
};

export const tradeEdit: Translations["tradeEdit"] = {
  saveFailed: "No se pudieron guardar los cambios. Inténtalo de nuevo.",
  credProvided: "Proporcionado: toca para actualizar",
  credMissing: "No proporcionado: agrégalo para generar confianza",
  groups: {
    trade: "Especialidad",
    area: "Zona de servicio y disponibilidad",
    contact: "Contacto e idiomas",
  },
  unavailable: "Esta especialidad no está disponible.",
};

export const credentials: Translations["credentials"] = {
  errors: {
    format: "Usa MM/AAAA.",
    expired: "Esta fecha ya pasó. Agrega un documento vigente.",
    state: "Ingresa el código de un estado de EE. UU., p. ej. CT.",
    licenseType: "Ingresa el tipo de licencia.",
    insuranceType: "Elige el tipo de seguro.",
  },
  addDoc: "Agrega una foto del documento",
  removeDoc: "Quitar documento",
  saveFailed: "No se pudo guardar. Revisa tu conexión e inténtalo de nuevo.",
  intro:
    "Para {{trade}}. Los propietarios ven “Licencia proporcionada” o “Seguro proporcionado”. CTMASS no verifica los documentos.",
  hasLicense: "Tengo licencia para esta especialidad",
  state: "Estado",
  licenseType: "Tipo de licencia",
  licenseTypePlaceholder: "p. ej. E-2 Unlimited Electrical Journeyperson",
  licenseNumber: "Número de licencia",
  licenseNumberPlaceholder: "Tal como aparece en la licencia",
  expires: "Vence",
  datePlaceholder: "MM/AAAA",
  licenseDocHint:
    "Se mantiene privado. Los propietarios solo ven que se proporcionó una licencia.",
  hasInsurance: "Tengo seguro",
  insuranceType: "Tipo de seguro",
  validThrough: "Válido hasta",
  coi: "Certificado de seguro",
  coiHint:
    "Se mantiene privado. Los propietarios solo ven que se proporcionó un seguro.",
};
