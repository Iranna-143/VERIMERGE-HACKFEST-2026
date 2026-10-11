import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export const API_BASE_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface DocumentItem {
  id: string;
  title: string;
  originalName: string;
  mimeType: string;
  size: number;
  fileHash?: string;
  classification: 'Internal' | 'Restricted' | 'Public';
  status: string;
  extractionStatus: string;
  extractedText?: string;
  pageCount: number;
  wordCount: number;
  limitationNotes?: string;
  createdAt: string;
  workspace?: { id: string; name: string };
  citations?: Array<{ id: string; claimId: string; location: string; excerpt: string }>;
}

export interface ClaimItem {
  id: string;
  workspaceId: string;
  claimText: string;
  entity: string;
  attribute: string;
  value: string;
  status: 'Corroborated' | 'Source Match' | 'Verified' | 'Conflicting' | 'Needs Review' | 'Unverified' | 'Invalidated';
  confidence: number;
  verificationReason?: string;
  isDuplicate: boolean;
  citations: Array<{
    id: string;
    documentId: string;
    excerpt: string;
    location: string;
    charStart?: number;
    charEnd?: number;
    verifiedInText: boolean;
    document: { id: string; title: string; classification: string };
  }>;
}

export interface ConflictItem {
  id: string;
  workspaceId: string;
  entity: string;
  attribute: string;
  description: string;
  status: 'Open' | 'Resolved' | 'Dismissed' | 'Invalid';
  claim1: ClaimItem;
  claim2: ClaimItem;
  createdAt: string;
}

export interface WorkspaceItem {
  id: string;
  name: string;
  description?: string;
  isDemo: boolean;
  createdAt: string;
  _count?: {
    documents: number;
    claims: number;
    conflicts: number;
    reports: number;
  };
}

export interface ReportItem {
  id: string;
  workspaceId: string;
  title: string;
  executiveSummary?: string;
  markdownContent: string;
  verificationSummaryJson?: string;
  createdAt: string;
}
