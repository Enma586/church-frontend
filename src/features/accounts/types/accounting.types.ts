/**
 * Accounting domain types.
 * Re-exports from the global types module so feature code
 * only imports from its own domain barrel.
 */
export type {
  // ── Enums ──
  CuentaType,
  JournalStatus,
  // ── Account ──
  Account,
  CreateAccountPayload,
  UpdateAccountPayload,
  AccountQueryParams,
  // ── Journal Entry ──
  JournalLine,
  JournalEntry,
  CreateJournalEntryPayload,
  UpdateJournalEntryPayload,
  JournalEntryQueryParams,
  // ── Product ──
  Product,
  CreateProductPayload,
  UpdateProductPayload,
  ProductQueryParams,
  // ── Period ──
  ClosePeriodPayload,
  PeriodResult,
  // ── Reports ──
  LedgerRow,
  LedgerQueryParams,
  LedgerResponse,
  TrialBalanceRow,
  TrialBalanceQueryParams,
  TrialBalanceResponse,
  BalanceSheetAccount,
  BalanceSheetData,
  BalanceSheetQueryParams,
  BalanceSheetResponse,
  IncomeStatementRow,
  IncomeStatementData,
  IncomeStatementQueryParams,
  IncomeStatementResponse,
} from '@/types';