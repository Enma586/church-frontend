// Response about api request, with optional data and pagination info
import type { PermissionKey } from '@/constants/permissions';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: PaginationMeta;
  errors?: string[];
}

// ─── Paginación ──────────────────────────────────────────────────────────────

export interface PaginationMeta {
  total: number;
  totalPages: number;
  currentPage: number;
  perPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

// ─── Enums compartidos ───────────────────────────────────────────────────────

export type Gender = 'Masculino' | 'Femenino';

export type MemberStatus = 'Activo' | 'Inactivo';

export type FamilyRelationship =
  | 'Padre'
  | 'Madre'
  | 'Cónyuge'
  | 'Hijo/a'
  | 'Hermano/a'
  | 'Tutor'
  | 'Otro';

export type UserRole = 'Coordinador' | 'Subcoordinador';

export type AppointmentStatus = 'Programada' | 'Completada' | 'Cancelada';

// NUEVO: El tipo de evento para diferenciar citas de cronogramas
export type EventType = 'cita_pastoral' | 'evento_cronograma' | 'bloqueo_agenda';

export type SyncStatus = 'synced' | 'pending_sync' | 'failed' | 'orphan';

export type SacramentType =
  | 'Bautismo'
  | 'Primera Comunión'
  | 'Confirmación'
  | 'Ninguno'


// ─── Address ─────────────────────────────────────────────────────────────────

export interface Department {
  _id: string;
  name: string;
  isoCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Municipality {
  _id: string;
  name: string;
  departmentId: string | Department;
  code?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Member ──────────────────────────────────────────────────────────────────

export interface FamilyMember {
  name: string;
  relationship: FamilyRelationship;
  contactNumber?: string;
  isMember: boolean;
}

export interface Member {
  _id: string;
  fullName: string;
  dateOfBirth: string;
  gender: Gender;
  phone?: string;
  email?: string;
  departmentId: string | Department;
  municipalityId: string | Municipality;
  addressDetails?: string;
  family: FamilyMember[];
  status: MemberStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMemberPayload {
  fullName: string;
  dateOfBirth: string;
  gender: Gender;
  phone?: string;
  email?: string;
  departmentId: string;
  municipalityId: string;
  addressDetails?: string;
  family?: Omit<FamilyMember, 'isMember'>[];
  status?: MemberStatus;
}

export type UpdateMemberPayload = Partial<CreateMemberPayload>;

export interface MemberQueryParams extends PaginationParams {
  status?: MemberStatus;
  gender?: Gender;
  departmentId?: string;
  search?: string;
}

// ─── User ────────────────────────────────────────────────────────────────────

export interface User {
  _id: string;
  memberId: string | Pick<Member, '_id' | 'fullName' | 'phone' | 'email'>;
  username: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface CreateUserPayload {
  memberId: string;
  username: string;
  password: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface UpdateUserPayload {
  username?: string;
  password?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface UserQueryParams extends PaginationParams {
  role?: UserRole;
  isActive?: boolean;
  search?: string;
}

// ─── Appointment (Ahora Eventos Unificados) ──────────────────────────────────

export interface Appointment {
  _id: string;
  type: EventType; // NUEVO
  memberId?: string | Pick<Member, '_id' | 'fullName' | 'phone' | 'email'>; // MODIFICADO: Opcional
  participants?: (string | Pick<Member, '_id' | 'fullName' | 'phone' | 'email'>)[]; // NUEVO: Para cronogramas
  title: string;
  description?: string;
  allDayDate?: string; // NUEVO: Para eventos de todo el día
  startDateTime?: string; // MODIFICADO: Opcional
  extras?: string; // NUEVO: Reemplaza suggestions y observations
  googleEventId?: string;
  syncStatus: SyncStatus;
  status: AppointmentStatus;
  createdBy: string | Pick<User, '_id' | 'username' | 'role'>;
  createdAt: string;
  updatedAt: string;

  member?: Pick<Member, '_id' | 'fullName' | 'phone' | 'email'>;
  participantsList?: Pick<Member, '_id' | 'fullName' | 'phone' | 'email'>[];
  creatorId?: Pick<User, '_id' | 'username' | 'role'>;
}

export interface CreateAppointmentPayload {
  type?: EventType; // NUEVO
  memberId?: string; // MODIFICADO: Opcional
  participants?: string[]; // NUEVO
  title: string;
  description?: string;
  allDayDate?: string; // NUEVO
  startDateTime?: string; // MODIFICADO: Opcional
  extras?: string; // NUEVO
  status?: AppointmentStatus;
  // ELIMINADO: suggestions y observations
}

export type UpdateAppointmentPayload = Partial<CreateAppointmentPayload>;

export interface AppointmentQueryParams extends PaginationParams {
  type?: EventType; // NUEVO: Permite filtrar por cita o cronograma
  status?: AppointmentStatus;
  memberId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}
// ─── Schedule (Cronograma Anual / Annual Schedule) ───────────────────────────

export interface ScheduleEvent {
  _id: string;
  title: string;
  description?: string;
  extras?: string;
  allDayDate: string;
  participants?: string[];
  participantsList?: Pick<Member, '_id' | 'fullName' | 'phone' | 'email'>[];
  googleEventId?: string;
  syncStatus: SyncStatus;
  status: AppointmentStatus;
  createdBy: string;
  creator?: Pick<User, '_id' | 'username' | 'role'>;
  createdAt: string;
  updatedAt: string;

  member?: Pick<Member, '_id' | 'fullName' | 'phone' | 'email'>;
  creatorId?: Pick<User, '_id' | 'username' | 'role'>;
}

export interface CreateScheduleEventPayload {
  type: 'evento_cronograma';
  title: string;
  description?: string;
  extras?: string;
  allDayDate: string;
  participants: string[];
}

export type UpdateScheduleEventPayload = Partial<Omit<CreateScheduleEventPayload, 'type'>>;

export interface ScheduleEventQueryParams extends PaginationParams {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}
// ─── Sacrament ───────────────────────────────────────────────────────────────

export interface Godparent {
  name: string;
  role?: string;
}

export interface Sacrament {
  _id: string;
  memberId: string | Pick<Member, '_id' | 'fullName'>;
  type: SacramentType;
  date: string;
  place?: string;
  celebrant?: string;
  godparents: Godparent[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateSacramentPayload {
  memberId: string;
  type: SacramentType;
  date: string;
  place?: string;
  celebrant?: string;
  godparents?: Godparent[];
}

export type UpdateSacramentPayload = Partial<CreateSacramentPayload>;

export interface SacramentQueryParams extends PaginationParams {
  type?: SacramentType;
  memberId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

// ─── Pastoral Note ───────────────────────────────────────────────────────────

export interface PastoralNote {
  _id: string;
  memberId: string | Pick<Member, '_id' | 'fullName'>;
  authorId: string | Pick<User, '_id' | 'username' | 'role'>;
  content: string;
  isSensitive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePastoralNotePayload {
  memberId: string;
  content: string;
  isSensitive?: boolean;
}

export type UpdatePastoralNotePayload = Partial<CreatePastoralNotePayload>;

export interface PastoralNoteQueryParams extends PaginationParams {
  memberId?: string;
  isSensitive?: boolean;
  search?: string;
}

// ─── Configuration ───────────────────────────────────────────────────────────

export interface Configuration {
  _id: string;

  googleCalendarId: string;
  googleServiceAccountEmail?: string;
  enableLocalNotifications: boolean;
  notificationRefreshInterval: number;
  churchName: string;
  lastBackupDate?: string;
  backupFrequencyDays: number;
  createdAt: string;
  updatedAt: string;
  rolePermissions?: Record<string, PermissionKey[]>;
  accountingClosedDate?: string | null;
  defaultCashAccountId?: string | null;
}

export type UpdateConfigurationPayload = Partial<Omit<Configuration, '_id' | 'createdAt' | 'updatedAt'>>;

// ─── Accounting / Contaduría ──────────────────────────────────────────────────

export type CuentaType = 'Activo' | 'Pasivo' | 'Patrimonio' | 'Ingreso' | 'Gasto';

export type JournalStatus = 'Valido' | 'Anulado';

// ── Account ─────────────────────────────────────────────────────────────────────
export interface Account {
  _id: string;
  code: string;
  name: string;
  type: CuentaType;
  parentAccount?: string | Pick<Account, '_id' | 'code' | 'name' | 'type'>;
  acceptsTransactions: boolean;
  isActive: boolean;
  children?: Account[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccountPayload {
  code: string;
  name: string;
  type: CuentaType;
  parentAccount?: string | null;
  acceptsTransactions?: boolean;
  isActive?: boolean;
}

export type UpdateAccountPayload = Partial<Omit<CreateAccountPayload, 'code'>>;

export interface AccountQueryParams extends PaginationParams {
  type?: CuentaType;
  isActive?: boolean;
  search?: string;
}



// ── Product ────────────────────────────────────────────────────────────────────
export interface Product {
  _id: string;
  name: string;
  defaultPrice: number;
  incomeAccountId: string | Pick<Account, '_id' | 'code' | 'name' | 'type'>;
  incomeAccountIdData?: Pick<Account, '_id' | 'code' | 'name' | 'type'>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductPayload {
  name: string;
  defaultPrice?: number;
  incomeAccountId: string;
  isActive?: boolean;
}

export type UpdateProductPayload = Partial<CreateProductPayload>;

export interface ProductQueryParams extends PaginationParams {
  isActive?: boolean;
  search?: string;
}

// ── Period ─────────────────────────────────────────────────────────────────────
export interface ClosePeriodPayload {
  date: string;
}

export interface PeriodResult {
  closedDate: string | null;
  previousClosedDate: string | null;
}

// ── Reports ────────────────────────────────────────────────────────────────────
export interface LedgerRow {
  date: string;
  voucherNumber: string;
  concept: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface LedgerQueryParams extends PaginationParams {
  accountId: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface LedgerResponse {
  account: Pick<Account, '_id' | 'code' | 'name' | 'type'>;
  data: LedgerRow[];
  pagination: PaginationMeta;
}

export interface TrialBalanceRow {
  accountId: string;
  code: string;
  name: string;
  type: CuentaType;
  totalDebit: number;
  totalCredit: number;
  balance: number;
}

export interface TrialBalanceQueryParams {
  dateFrom?: string;
  dateTo?: string;
}


export interface BalanceSheetAccount extends TrialBalanceRow {
  parentAccount?: string;
}

export interface BalanceSheetData {
  activo: BalanceSheetAccount[];
  pasivo: BalanceSheetAccount[];
  patrimonio: BalanceSheetAccount[];
}

export interface BalanceSheetQueryParams {
  asOfDate?: string;
}

export interface BalanceSheetResponse {
  asOfDate: string;
  data: BalanceSheetData;
  totals: {
    activo: number;
    pasivo: number;
    patrimonio: number;
    pasivoPatrimonio: number;
    balanceado: boolean;
  };
}

export interface IncomeStatementRow {
  accountId: string;
  code: string;
  name: string;
  type: 'Ingreso' | 'Gasto';
  totalDebit: number;
  totalCredit: number;
  balance: number;
}

export interface IncomeStatementData {
  ingresos: IncomeStatementRow[];
  gastos: IncomeStatementRow[];
}

export interface IncomeStatementQueryParams {
  dateFrom?: string;
  dateTo?: string;
}

export interface IncomeStatementResponse {
  dateFrom: string | null;
  dateTo: string | null;
  data: IncomeStatementData;
  totals: {
    ingresos: number;
    gastos: number;
    resultadoNeto: number;
  };
}

// ── Journal Entry / Asiento Contable ──────────────────────────────────────────
export type JournalType = 'Ingreso' | 'Egreso';

export interface JournalEntry {
  _id: string;
  voucherNumber: string;
  date: string;
  type: JournalType;
  concept: string;
  account: string | Pick<Account, '_id' | 'code' | 'name' | 'type'>;
  product?: string | Pick<Product, '_id' | 'name' | 'defaultPrice'> | null;
  amount: number;
  status: JournalStatus;
  createdBy: string | { _id: string; username: string; role: string };
  accountData?: Pick<Account, '_id' | 'code' | 'name' | 'type'>;
  productData?: Pick<Product, '_id' | 'name' | 'defaultPrice'> | null;
  createdByData?: { _id: string; username: string; role: string };
  createdAt: string;
  updatedAt: string;
}

export interface CreateJournalEntryPayload {
  date?: string;
  type: JournalType;
  concept: string;
  account: string;
  product?: string | null;
  amount: number;
}

export interface UpdateJournalEntryPayload {
  status: JournalStatus;
}

export interface JournalEntryQueryParams extends PaginationParams {
  dateFrom?: string;
  dateTo?: string;
  type?: JournalType;
  status?: JournalStatus;
  search?: string;
}

// ── ELIMINAR esto viejo ─────────────────────────────────────────────────────
// export interface JournalLine { ... }  ← BORRAR
// export type CreateJournalEntryPayload viejo con lines ← BORRAR

// ── Cash Closing ──────────────────────────────────────────────────────
export interface CashDenomination {
  denomination: number;
  quantity: number;
  subtotal: number;
}

export interface CashClosing {
  _id: string;
  date: string;
  reference: string;
  concept: string;
  denominations: CashDenomination[];
  totalCalculated: number;
  expectedBalance: number;
  difference: number;
  notes?: string;
  createdBy: string | Pick<User, '_id' | 'username' | 'role'>;
  createdByData?: Pick<User, '_id' | 'username' | 'role'>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCashClosingPayload {
  date?: string;
  concept?: string;
  denominations: Omit<CashDenomination, 'subtotal'>[];
  notes?: string;
}

export interface CashClosingQueryParams extends PaginationParams {
  dateFrom?: string;
  dateTo?: string;
}

// Actualizar TrialBalanceRow (estaba usando totalDebit/totalCredit, ahora usa totalIngresos/totalEgresos)
export interface TrialBalanceRow {
  accountId: string;
  code: string;
  name: string;
  type: CuentaType;
  totalIngresos: number;
  totalEgresos: number;
  balance: number;
}

export interface TrialBalanceQueryParams {
  dateFrom?: string;
  dateTo?: string;
}

export interface TrialBalanceResponse {
  data: TrialBalanceRow[];
  totals: { totalIngresos: number; totalEgresos: number; saldoNeto: number };
}

// Actualizar IncomeStatementRow
export interface IncomeStatementRow {
  accountId: string;
  code: string;
  name: string;
  type: 'Ingreso' | 'Gasto';
  totalIngresos: number;
  totalEgresos: number;
  balance: number;
}

// Actualizar BalanceSheetAccount
export interface BalanceSheetAccount {
  accountId: string;
  code: string;
  name: string;
  type: 'Activo' | 'Pasivo' | 'Patrimonio';
  parentAccount?: string;
  totalIngresos: number;
  totalEgresos: number;
  balance: number;
}