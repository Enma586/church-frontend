// Response about api request, with optional data and pagination info

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
  endDateTime?: string; // MODIFICADO: Opcional
  extras?: string; // NUEVO: Reemplaza suggestions y observations
  googleEventId?: string;
  syncStatus: SyncStatus;
  status: AppointmentStatus;
  createdBy: string | Pick<User, '_id' | 'username' | 'role'>;
  createdAt: string;
  updatedAt: string;

  member?: Pick<Member, '_id' | 'fullName' | 'phone' | 'email'>;
  participantsList?: Pick<Member, '_id' | 'fullName' | 'phone' | 'email'>[];
  creator?: Pick<User, '_id' | 'username' | 'role'>;
}

export interface CreateAppointmentPayload {
  type?: EventType; // NUEVO
  memberId?: string; // MODIFICADO: Opcional
  participants?: string[]; // NUEVO
  title: string;
  description?: string;
  allDayDate?: string; // NUEVO
  startDateTime?: string; // MODIFICADO: Opcional
  endDateTime?: string; // MODIFICADO: Opcional
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
  createdAt: string;
  updatedAt: string;
}

export type UpdateConfigurationPayload = Partial<Omit<Configuration, '_id' | 'createdAt' | 'updatedAt'>>;