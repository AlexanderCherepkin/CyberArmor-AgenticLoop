export interface RFQCreate {
  contact_email: string;
  company_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  seats_min: number;
  seats_max?: number | null;
  infrastructure?: 'on-premise' | 'hybrid-cloud' | 'air-gapped' | 'cloud-native' | null;
  compliance_frameworks?: string[];
  use_case?: string | null;
  timeline?: 'asap' | '1-3-months' | '3-6-months' | '6-12-months' | 'exploratory' | null;
}

export interface RFQRead {
  id: string;
  contact_email: string;
  company_name: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  seats_min: number;
  seats_max: number | null;
  infrastructure: string | null;
  compliance_frameworks: string | null;
  use_case: string | null;
  timeline: string | null;
  urgency_score: number;
  status: string;
  crm_status: string | null;
  is_converted: boolean;
  created_at: string;
  updated_at: string;
}
