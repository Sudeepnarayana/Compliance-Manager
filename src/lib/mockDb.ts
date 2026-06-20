import bcrypt from 'bcryptjs';

export interface MockUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'ADMIN' | 'HR' | 'PAYROLL' | 'RECRUITER' | 'ACCOUNTING' | 'MANAGER' | 'USER';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

export interface MockProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone: string;
  department: string;
  jobTitle: string;
  joinedDate: Date;
}

export interface MockPayrollChecklist {
  id: string;
  userId: string;
  visaStatus: 'PENDING' | 'VERIFIED' | 'EXPIRED' | 'NOT_REQUIRED';
  visaExpiry: Date | null;
  directDepositSet: boolean;
  stateRegistered: boolean;
  payrollHold: boolean;
  lastChecked: Date;
}

export interface MockOfferLetter {
  id: string;
  candidateName: string;
  candidateEmail: string;
  roleTitle: string;
  salary: number;
  status: 'DRAFT' | 'SENT' | 'HR_APPROVED' | 'CANDIDATE_ACCEPTED' | 'REJECTED';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockPaymentDispute {
  id: string;
  userId: string;
  amount: number;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED';
  disputeReason: string;
  resolution: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockAuditLog {
  id: string;
  userId: string | null;
  userName?: string;
  action: string;
  resource: string;
  details: string;
  timestamp: Date;
}

// In-Memory store
class MockDatabase {
  users: MockUser[] = [];
  profiles: MockProfile[] = [];
  payrollChecklists: MockPayrollChecklist[] = [];
  offerLetters: MockOfferLetter[] = [];
  disputes: MockPaymentDispute[] = [];
  auditLogs: MockAuditLog[] = [];

  constructor() {
    this.seed();
  }

  private seed() {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync('password123', salt);

    // 1. Seed Users for 6 roles
    const roles: Array<'ADMIN' | 'HR' | 'PAYROLL' | 'RECRUITER' | 'ACCOUNTING' | 'MANAGER'> = ['ADMIN', 'HR', 'PAYROLL', 'RECRUITER', 'ACCOUNTING', 'MANAGER'];
    const names = {
      ADMIN: 'Srilatha Rayani',
      HR: 'John HR Specialist',
      PAYROLL: 'Sarah Payroll Lead',
      RECRUITER: 'Emma Recruiter Pro',
      ACCOUNTING: 'Mark Accountant',
      MANAGER: 'David Division Manager',
    };

    roles.forEach((role, i) => {
      const email = `${role.toLowerCase()}@enterprise.com`;
      const userId = `user-id-${role.toLowerCase()}`;
      
      this.users.push({
        id: userId,
        name: names[role],
        email,
        passwordHash,
        role,
        status: 'ACTIVE',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        updatedAt: new Date(),
      });

      this.profiles.push({
        id: `profile-id-${role.toLowerCase()}`,
        userId,
        firstName: names[role].split(' ')[0],
        lastName: names[role].split(' ').slice(1).join(' ') || 'User',
        phone: `+1 (555) 010-000${i + 1}`,
        department: role === 'ADMIN' ? 'Tech Operations' : `${role} Operations`,
        jobTitle: role === 'ADMIN' ? 'Onshore Technical Lead' : `${role} Specialist`,
        joinedDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      });

      // Seed payroll checklist for everyone except admin
      if (role !== 'ADMIN') {
        this.payrollChecklists.push({
          id: `payroll-id-${role.toLowerCase()}`,
          userId,
          visaStatus: role === 'RECRUITER' ? 'EXPIRED' : 'VERIFIED',
          visaExpiry: role === 'RECRUITER' ? new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) : new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
          directDepositSet: role !== 'HR',
          stateRegistered: true,
          payrollHold: role === 'RECRUITER' || role === 'HR', // recruiters have visa issues, hr has direct deposit issues
          lastChecked: new Date(),
        });
      }
    });

    // Seed additional mock users as standard employees for HR/Payroll management
    const mockEmployees = [
      { id: 'emp-1', name: 'Alice Smith', email: 'alice@example.com', visaStatus: 'VERIFIED', visaExpiry: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), hold: false },
      { id: 'emp-2', name: 'Bob Johnson', email: 'bob@example.com', visaStatus: 'PENDING', visaExpiry: null, hold: true },
      { id: 'emp-3', name: 'Carlos Mendez', email: 'carlos@example.com', visaStatus: 'EXPIRED', visaExpiry: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), hold: true },
      { id: 'emp-4', name: 'Diana Prince', email: 'diana@example.com', visaStatus: 'NOT_REQUIRED', visaExpiry: null, hold: false }
    ];

    mockEmployees.forEach((emp, i) => {
      this.users.push({
        id: emp.id,
        name: emp.name,
        email: emp.email,
        passwordHash,
        role: 'USER',
        status: 'ACTIVE',
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      });

      this.profiles.push({
        id: `profile-${emp.id}`,
        userId: emp.id,
        firstName: emp.name.split(' ')[0],
        lastName: emp.name.split(' ')[1],
        phone: `+1 (555) 020-000${i + 1}`,
        department: 'Delivery Solutions',
        jobTitle: 'Software Consultant',
        joinedDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      });

      this.payrollChecklists.push({
        id: `payroll-${emp.id}`,
        userId: emp.id,
        visaStatus: emp.visaStatus as any,
        visaExpiry: emp.visaExpiry,
        directDepositSet: i !== 1, // bob doesn't have direct deposit
        stateRegistered: true,
        payrollHold: emp.hold,
        lastChecked: new Date(),
      });
    });

    // 2. Seed Offer Letters
    this.offerLetters = [
      {
        id: 'offer-1',
        candidateName: 'Jane Doe',
        candidateEmail: 'jane.doe@gmail.com',
        roleTitle: 'Senior System Engineer',
        salary: 125000,
        status: 'HR_APPROVED',
        createdBy: 'user-id-recruiter',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'offer-2',
        candidateName: 'Marcus Aurelius',
        candidateEmail: 'marcus@philosophy.org',
        roleTitle: 'Strategy Director',
        salary: 195000,
        status: 'CANDIDATE_ACCEPTED',
        createdBy: 'user-id-recruiter',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'offer-3',
        candidateName: 'Bruce Wayne',
        candidateEmail: 'bruce@waynecorp.com',
        roleTitle: 'Security consultant',
        salary: 80000,
        status: 'DRAFT',
        createdBy: 'user-id-recruiter',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    // 3. Seed Payment Disputes
    this.disputes = [
      {
        id: 'dispute-1',
        userId: 'emp-1',
        amount: 1450,
        status: 'OPEN',
        disputeReason: 'Overtime hours for the billing cycle ending June 10th were not calculated in the final payroll paystub.',
        resolution: null,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'dispute-2',
        userId: 'emp-2',
        amount: 820,
        status: 'UNDER_REVIEW',
        disputeReason: 'Incorrect state tax withholding applied to recent paycheck after moving from NY to TX state.',
        resolution: 'Under review by payroll department to adjust state tax registry settings.',
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'dispute-3',
        userId: 'emp-3',
        amount: 3200,
        status: 'RESOLVED',
        disputeReason: 'Double deduction of health benefit premium during the onboarding transition phase.',
        resolution: 'Reimbursed double premium deduction in the cycle payload on June 15th. Confirmed with candidate.',
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      }
    ];

    // 4. Seed Audit Logs
    this.auditLogs = [
      {
        id: 'log-1',
        userId: 'user-id-admin',
        userName: 'Srilatha Rayani',
        action: 'USER_LOGIN',
        resource: 'Auth',
        details: 'Admin user successfully logged in from IP 192.168.1.45',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
      {
        id: 'log-2',
        userId: 'user-id-recruiter',
        userName: 'Emma Recruiter Pro',
        action: 'CREATE_OFFER',
        resource: 'OfferLetter',
        details: 'Offer letter draft created for candidate Jane Doe ($125,000)',
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'log-3',
        userId: 'user-id-manager',
        userName: 'David Division Manager',
        action: 'APPROVE_OFFER',
        resource: 'OfferLetter',
        details: 'Manager approved offer letter for candidate Jane Doe',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'log-4',
        userId: 'user-id-accounting',
        userName: 'Mark Accountant',
        action: 'RESOLVE_DISPUTE',
        resource: 'PaymentDispute',
        details: 'Dispute dispute-3 resolved with refund reimbursement notes',
        timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      }
    ];
  }
}

export const mockDb = new MockDatabase();
