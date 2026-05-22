import { getErrorMessage } from './axios'; // Usa tu helper existente

/**
 * Traduce errores técnicos del backend a mensajes comprensibles para el usuario.
 * El primer match gana.
 */
const HUMAN_MESSAGES: Array<[RegExp, string]> = [
  [/duplicate key.*username/i, 'El nombre de usuario ya está en uso. Elija otro.'],
  [/duplicate key.*code/i, 'Ya existe una cuenta con ese código.'],
  [/duplicate key.*voucherNumber/i, 'Ya existe un asiento con ese número.'],
  [/duplicate key/i, 'Ya existe un registro con esos datos.'],
  [/cast to objectid failed/i, 'El ID proporcionado no es válido.'],
  [/period is closed/i, 'El período contable está cerrado.'],
  [/cerrado|closed/i, 'El período contable está cerrado para esta fecha.'],
  
  [/subcuenta/i, 'No se puede eliminar porque tiene subcuentas dependientes. Elimine las subcuentas primero.'],
  
  [/asociad|vinculad|en uso|in use|foreign key|constraint/i, 'No se puede borrar porque ya está asociada o en uso.'],
  [/journal|asiento/i, 'No se puede eliminar porque está referenciada en asientos contables.'],
  [/product/i, 'No se puede eliminar porque está siendo usada en transacciones.'],
  [/validation failed/i, 'Algunos campos no son válidos.'],
  [/no autorizado|unauthorized|401/i, 'No tiene permisos para realizar esta acción.'],
  [/requerida|required/i, 'Debe seleccionar una cuenta válida.'],
  [/mínimo 2|min.*2/i, 'El asiento debe tener al menos 2 líneas.'],
  [/descuadre|not balanced/i, 'El asiento no está balanceado.'],
  [/agrupación/i, 'La cuenta seleccionada es de agrupación y no acepta transacciones.'],
  [/inactiva|inactive/i, 'La cuenta seleccionada está inactiva.'],
  [/ya.*anulado|already.*anulado/i, 'Este asiento ya está anulado.'],
  [/network error|connection refused|timeout/i, 'Error de conexión con el servidor.'],
];

export function humanizeError(error: unknown): string {
  // 1. Obtenemos el string crudo usando tu helper de Axios
  const raw = getErrorMessage(error, 'Error inesperado del servidor');

  // 2. Buscamos coincidencias en nuestro diccionario
  for (const [pattern, friendly] of HUMAN_MESSAGES) {
    if (pattern.test(raw)) {
      return friendly;
    }
  }

  // 3. FIX: Fallback en español mejorado. 
  // Ahora permite números (0-9), comillas simples/dobles y guiones bajos.
  if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s,.:;¿?¡!"'_()-]+$/.test(raw) && raw.length < 150) {
    // Si el backend manda un mensaje tan bueno como "No se puede eliminar: esta cuenta tiene 1 subcuenta(s)",
    // esta regla lo dejará pasar directamente a la pantalla del usuario.
    return raw;
  }

  // Fallback genérico solo si de verdad es un error marciano o puro código
  return 'Ocurrió un error inesperado. Intente de nuevo o contacte al administrador.';
}