export type Role = 'CUSTOMER' | 'SUPPORT_AGENT' | 'OPERATIONS_MANAGER' | 'ADMIN';

export interface UserSession {
  user_id: string;
  email: string;
  name: string;
  role: Role;
  account_id: string | null;
  company_name?: string;
}

export const PRESET_USERS: Record<string, UserSession> = {
  northstar: {
    user_id: 'usr_northstar',
    email: 'support@northstarlogistics.com',
    name: 'Northstar Admin (Customer)',
    role: 'CUSTOMER',
    account_id: 'ACC-1001',
    company_name: 'Northstar Logistics',
  },
  lumenworks: {
    user_id: 'usr_lumenworks',
    email: 'ops@lumenworks.io',
    name: 'LumenWorks Ops (Customer)',
    role: 'CUSTOMER',
    account_id: 'ACC-1002',
    company_name: 'LumenWorks',
  },
  apex: {
    user_id: 'usr_apex',
    email: 'logistics@apexfreight.com',
    name: 'Apex Freight Manager (Customer)',
    role: 'CUSTOMER',
    account_id: 'ACC-1003',
    company_name: 'Apex Freight',
  },
  support_agent: {
    user_id: 'usr_support_agent',
    email: 'support@parcelpilot.demo',
    name: 'Sarah Connor (Support Agent)',
    role: 'SUPPORT_AGENT',
    account_id: null,
  },
  ops_manager: {
    user_id: 'usr_ops_manager',
    email: 'ops@parcelpilot.demo',
    name: 'Alex Mercer (Ops Manager)',
    role: 'OPERATIONS_MANAGER',
    account_id: null,
  },
  admin: {
    user_id: 'usr_admin',
    email: 'admin@parcelpilot.demo',
    name: 'System Admin',
    role: 'ADMIN',
    account_id: null,
  },
};

export function authorizeAccountAccess(session: UserSession, targetAccountId: string): boolean {
  if (session.role === 'ADMIN' || session.role === 'OPERATIONS_MANAGER' || session.role === 'SUPPORT_AGENT') {
    return true;
  }
  if (session.role === 'CUSTOMER') {
    return session.account_id === targetAccountId;
  }
  return false;
}
