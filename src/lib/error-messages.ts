import { getErrorMessage } from './axios';

/**
 * Traduce errores técnicos del backend a mensajes comprensibles para el usuario.
 * Cada entrada es un fragmento que se busca dentro del mensaje original (case-insensitive).
 * El primer match gana. Si no hay match, se devuelve el mensaje original sanitizado.
 */
const HUMAN_MESSAGES: Array<[RegExp, string]> = [
  [/duplicate key.*code/i, 'Ya existe una cuenta con ese código. Por favor use un código diferente.'],
  [/duplicate key.*voucherNumber/i, 'Ya existe un asiento con ese número de comprobante.'],
  [/duplicate key/i, 'Ya existe un registro con esos datos. Verifique e intente de nuevo.'],
  [/cast to objectid failed/i, 'El ID proporcionado no es válido. Verifique los datos e intente de nuevo.'],
  [/period is closed/i, 'El período contable está cerrado. No se pueden crear ni modificar asientos con fecha anterior al cierre.'],
  [/cuenta.*cerrado|periodo.*cerrado|closed.*date/i, 'El período contable está cerrado para esta fecha. Reabra el período o use una fecha posterior.'],
  [/cannot delete.*children|tiene subcuentas|has.*child/i, 'No se puede eliminar porque tiene subcuentas dependientes. Elimine las subcuentas primero.'],
  [/cannot delete.*journal|referenced.*journal|asiento/i, 'No se puede eliminar porque está referenciada en asientos contables existentes. Reasigne esas líneas primero.'],
  [/cannot delete.*product|referenced.*product/i, 'No se puede eliminar porque está siendo usada en transacciones.'],
  [/validation failed/i, 'Algunos campos no son válidos. Revise los datos ingresados.'],
  [/no autorizado|unauthorized|401/i, 'No tiene permisos para realizar esta acción.'],
  [/cuenta.*requerida|account.*required/i, 'Debe seleccionar una cuenta válida.'],
  [/mínimo 2 líneas|min.*2.*line/i, 'El asiento debe tener al menos 2 líneas (débito y crédito).'],
  [/descuadre|not balanced|débito.*crédito/i, 'El asiento no está balanceado. El total de débitos debe igualar al total de créditos.'],
  [/no acepta transacciones|does not accept transactions|agrupación/i, 'La cuenta seleccionada es de agrupación y no acepta transacciones. Seleccione una cuenta hoja.'],
  [/cuenta.*inactiva|inactive.*account/i, 'La cuenta seleccionada está inactiva. Active la cuenta o seleccione otra.'],
  [/no se puede anular|already.*anulado/i, 'Este asiento ya está anulado o no se puede anular en su estado actual.'],
  [/network error|connection refused|timeout/i, 'Error de conexión con el servidor. Verifique su conexión a internet.'],
];

/**
 * Convierte un mensaje de error técnico en uno comprensible para el usuario final.
 * Siempre retorna un string en español, nunca códigos de error ni mensajes de sistema.
 */
export function humanizeError(error: unknown): string {
  const raw = getErrorMessage(error, 'Error inesperado del servidor');

  for (const [pattern, friendly] of HUMAN_MESSAGES) {
    if (pattern.test(raw)) {
      return friendly;
    }
  }

  // Si el mensaje ya está en español y no parece técnico, lo usamos tal cual
  if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s,.:;¿?¡!()-]+$/.test(raw) && !raw.includes('Error:') && raw.length < 150) {
    return raw;
  }

  // Fallback genérico si el mensaje es muy técnico
  return 'Ocurrió un error inesperado. Intente de nuevo o contacte al administrador.';
}