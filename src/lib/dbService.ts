import prisma from './db';
import { mockDb } from './mockDb';
import bcrypt from 'bcryptjs';

export const dbService = {
  // --- USERS ---
  async getUserByEmail(email: string) {
    if (prisma) {
      try {
        return await prisma.user.findUnique({
          where: { email },
          include: { profile: true, payroll: true },
        });
      } catch (e) {
        console.error("Prisma error in getUserByEmail, using mock:", e);
      }
    }
    const user = mockDb.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return null;
    const profile = mockDb.profiles.find(p => p.userId === user.id);
    const payroll = mockDb.payrollChecklists.find(pc => pc.userId === user.id);
    return { ...user, profile: profile || null, payroll: payroll || null };
  },

  async getUserById(id: string) {
    if (prisma) {
      try {
        return await prisma.user.findUnique({
          where: { id },
          include: { profile: true, payroll: true },
        });
      } catch (e) {
        console.error("Prisma error in getUserById, using mock:", e);
      }
    }
    const user = mockDb.users.find(u => u.id === id);
    if (!user) return null;
    const profile = mockDb.profiles.find(p => p.userId === user.id);
    const payroll = mockDb.payrollChecklists.find(pc => pc.userId === user.id);
    return { ...user, profile: profile || null, payroll: payroll || null };
  },

  async createUser(data: { email: string; name: string; passwordRaw: string; role: string; firstName: string; lastName: string; department?: string; jobTitle?: string }) {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(data.passwordRaw, salt);
    const roleEnum = (data.role || 'USER') as any;

    if (prisma) {
      try {
        return await prisma.user.create({
          data: {
            email: data.email,
            name: data.name,
            passwordHash,
            role: roleEnum,
            profile: {
              create: {
                firstName: data.firstName,
                lastName: data.lastName,
                department: data.department || 'Delivery Solutions',
                jobTitle: data.jobTitle || 'Associate',
              }
            },
            payroll: roleEnum !== 'ADMIN' ? {
              create: {
                visaStatus: 'PENDING',
                directDepositSet: false,
                stateRegistered: true,
                payrollHold: true
              }
            } : undefined
          },
          include: { profile: true, payroll: true }
        });
      } catch (e) {
        console.error("Prisma error in createUser, using mock:", e);
      }
    }

    // Mock implementation
    const userId = `user-id-${Math.random().toString(36).substr(2, 9)}`;
    const newUser = {
      id: userId,
      name: data.name,
      email: data.email,
      passwordHash,
      role: roleEnum,
      status: 'ACTIVE' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const newProfile = {
      id: `profile-id-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: '',
      department: data.department || 'Delivery Solutions',
      jobTitle: data.jobTitle || 'Associate',
      joinedDate: new Date(),
    };

    mockDb.users.push(newUser);
    mockDb.profiles.push(newProfile);

    let newPayroll = null;
    if (roleEnum !== 'ADMIN') {
      newPayroll = {
        id: `payroll-id-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        visaStatus: 'PENDING' as const,
        visaExpiry: null,
        directDepositSet: false,
        stateRegistered: true,
        payrollHold: true,
        lastChecked: new Date(),
      };
      mockDb.payrollChecklists.push(newPayroll);
    }

    return { ...newUser, profile: newProfile, payroll: newPayroll };
  },

  async getUsers() {
    if (prisma) {
      try {
        return await prisma.user.findMany({
          include: { profile: true, payroll: true },
          orderBy: { createdAt: 'desc' }
        });
      } catch (e) {
        console.error("Prisma error in getUsers, using mock:", e);
      }
    }
    
    return mockDb.users.map(user => {
      const profile = mockDb.profiles.find(p => p.userId === user.id);
      const payroll = mockDb.payrollChecklists.find(pc => pc.userId === user.id);
      return { ...user, profile: profile || null, payroll: payroll || null };
    });
  },

  async updateUserRole(userId: string, role: string) {
    const roleEnum = role as any;
    if (prisma) {
      try {
        return await prisma.user.update({
          where: { id: userId },
          data: { role: roleEnum },
        });
      } catch (e) {
        console.error("Prisma error in updateUserRole, using mock:", e);
      }
    }
    
    const user = mockDb.users.find(u => u.id === userId);
    if (user) {
      user.role = roleEnum;
      user.updatedAt = new Date();
    }
    return user;
  },

  async updateUserStatus(userId: string, status: string) {
    if (prisma) {
      try {
        return await prisma.user.update({
          where: { id: userId },
          data: { status },
        });
      } catch (e) {
        console.error("Prisma error in updateUserStatus, using mock:", e);
      }
    }

    const user = mockDb.users.find(u => u.id === userId);
    if (user) {
      user.status = status as any;
      user.updatedAt = new Date();
    }
    return user;
  },

  // --- PAYROLL CHECKLISTS ---
  async getPayrollChecklists() {
    if (prisma) {
      try {
        return await prisma.payrollChecklist.findMany({
          include: { user: { include: { profile: true } } }
        });
      } catch (e) {
        console.error("Prisma error in getPayrollChecklists, using mock:", e);
      }
    }

    return mockDb.payrollChecklists.map(pc => {
      const user = mockDb.users.find(u => u.id === pc.userId);
      const profile = user ? mockDb.profiles.find(p => p.userId === user.id) : null;
      return {
        ...pc,
        user: user ? { ...user, profile: profile || null } : null
      };
    });
  },

  async updatePayrollChecklist(id: string, data: { visaStatus?: string; visaExpiry?: Date | null; directDepositSet?: boolean; stateRegistered?: boolean; payrollHold?: boolean }) {
    if (prisma) {
      try {
        return await prisma.payrollChecklist.update({
          where: { id },
          data: {
            ...data,
            lastChecked: new Date()
          }
        });
      } catch (e) {
        console.error("Prisma error in updatePayrollChecklist, using mock:", e);
      }
    }

    const pc = mockDb.payrollChecklists.find(p => p.id === id);
    if (pc) {
      if (data.visaStatus !== undefined) pc.visaStatus = data.visaStatus as any;
      if (data.visaExpiry !== undefined) pc.visaExpiry = data.visaExpiry;
      if (data.directDepositSet !== undefined) pc.directDepositSet = data.directDepositSet;
      if (data.stateRegistered !== undefined) pc.stateRegistered = data.stateRegistered;
      if (data.payrollHold !== undefined) pc.payrollHold = data.payrollHold;
      pc.lastChecked = new Date();
    }
    return pc;
  },

  // --- OFFER LETTERS ---
  async getOfferLetters() {
    if (prisma) {
      try {
        return await prisma.offerLetter.findMany({
          orderBy: { createdAt: 'desc' }
        });
      } catch (e) {
        console.error("Prisma error in getOfferLetters, using mock:", e);
      }
    }

    return [...mockDb.offerLetters].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  async createOfferLetter(data: { candidateName: string; candidateEmail: string; roleTitle: string; salary: number; createdBy: string }) {
    if (prisma) {
      try {
        return await prisma.offerLetter.create({
          data: {
            ...data,
            status: 'DRAFT'
          }
        });
      } catch (e) {
        console.error("Prisma error in createOfferLetter, using mock:", e);
      }
    }

    const newOffer = {
      id: `offer-id-${Math.random().toString(36).substr(2, 9)}`,
      candidateName: data.candidateName,
      candidateEmail: data.candidateEmail,
      roleTitle: data.roleTitle,
      salary: data.salary,
      status: 'DRAFT' as const,
      createdBy: data.createdBy,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockDb.offerLetters.push(newOffer);
    return newOffer;
  },

  async updateOfferLetterStatus(id: string, status: string) {
    if (prisma) {
      try {
        return await prisma.offerLetter.update({
          where: { id },
          data: { status, updatedAt: new Date() }
        });
      } catch (e) {
        console.error("Prisma error in updateOfferLetterStatus, using mock:", e);
      }
    }

    const offer = mockDb.offerLetters.find(o => o.id === id);
    if (offer) {
      offer.status = status as any;
      offer.updatedAt = new Date();
    }
    return offer;
  },

  // --- DISPUTES ---
  async getPaymentDisputes() {
    if (prisma) {
      try {
        return await prisma.paymentDispute.findMany({
          include: { user: { include: { profile: true } } },
          orderBy: { createdAt: 'desc' }
        });
      } catch (e) {
        console.error("Prisma error in getPaymentDisputes, using mock:", e);
      }
    }

    return [...mockDb.disputes].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).map(d => {
      const user = mockDb.users.find(u => u.id === d.userId);
      const profile = user ? mockDb.profiles.find(p => p.userId === user.id) : null;
      return {
        ...d,
        user: user ? { ...user, profile: profile || null } : null
      };
    });
  },

  async createPaymentDispute(data: { userId: string; amount: number; disputeReason: string }) {
    if (prisma) {
      try {
        return await prisma.paymentDispute.create({
          data: {
            ...data,
            status: 'OPEN'
          }
        });
      } catch (e) {
        console.error("Prisma error in createPaymentDispute, using mock:", e);
      }
    }

    const newDispute = {
      id: `dispute-id-${Math.random().toString(36).substr(2, 9)}`,
      userId: data.userId,
      amount: data.amount,
      status: 'OPEN' as const,
      disputeReason: data.disputeReason,
      resolution: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockDb.disputes.push(newDispute);
    return newDispute;
  },

  async updatePaymentDisputeStatus(id: string, status: string, resolution?: string) {
    if (prisma) {
      try {
        return await prisma.paymentDispute.update({
          where: { id },
          data: {
            status,
            resolution,
            updatedAt: new Date()
          }
        });
      } catch (e) {
        console.error("Prisma error in updatePaymentDisputeStatus, using mock:", e);
      }
    }

    const dispute = mockDb.disputes.find(d => d.id === id);
    if (dispute) {
      dispute.status = status as any;
      if (resolution !== undefined) dispute.resolution = resolution;
      dispute.updatedAt = new Date();
    }
    return dispute;
  },

  // --- AUDIT LOGS ---
  async getAuditLogs() {
    if (prisma) {
      try {
        return await prisma.auditLog.findMany({
          include: { user: { include: { profile: true } } },
          orderBy: { timestamp: 'desc' }
        });
      } catch (e) {
        console.error("Prisma error in getAuditLogs, using mock:", e);
      }
    }

    return [...mockDb.auditLogs].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).map(l => {
      const user = l.userId ? mockDb.users.find(u => u.id === l.userId) : null;
      const profile = user ? mockDb.profiles.find(p => p.userId === user.id) : null;
      return {
        ...l,
        user: user ? { ...user, profile: profile || null } : null
      };
    });
  },

  async createAuditLog(data: { userId: string | null; action: string; resource: string; details: string }) {
    if (prisma) {
      try {
        return await prisma.auditLog.create({
          data: {
            userId: data.userId,
            action: data.action,
            resource: data.resource,
            details: data.details,
          }
        });
      } catch (e) {
        console.error("Prisma error in createAuditLog, using mock:", e);
      }
    }

    let userName = 'System';
    if (data.userId) {
      const u = mockDb.users.find(user => user.id === data.userId);
      if (u) userName = u.name;
    }

    const newLog = {
      id: `log-id-${Math.random().toString(36).substr(2, 9)}`,
      userId: data.userId,
      userName,
      action: data.action,
      resource: data.resource,
      details: data.details,
      timestamp: new Date()
    };
    mockDb.auditLogs.push(newLog);
    return newLog;
  }
};
