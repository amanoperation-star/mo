import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Student, Course, Expense, StaffMember, AuditLog, AppNotification, CenterSettings } from '../types';
import { getStoredSupabaseConfig, saveStoredStudents, saveStoredCourses, saveStoredExpenses, saveStoredStaff, saveStoredLogs, saveStoredNotifications, saveStoredCenterSettings } from './storage';
import { RealtimeSyncPayload, broadcastRealtimeEvent } from './realtimeBroadcast';

export const DEFAULT_SUPABASE_URL = 'https://oolhvtpjjatmatarzdun.supabase.co';
export const DEFAULT_SUPABASE_KEY = 'sb_publishable_BedohuvkdaCeq1H9AeltVg_p5YTyM4z';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const config = getStoredSupabaseConfig();
  const url = config.projectUrl || DEFAULT_SUPABASE_URL;
  const key = config.publishableKey || config.anonKey || DEFAULT_SUPABASE_KEY;

  if (!url || !key) return null;

  try {
    if (!supabaseInstance) {
      supabaseInstance = createClient(url, key, {
        auth: { persistSession: false },
        realtime: {
          params: { eventsPerSecond: 20 },
        },
      });
    }
    return supabaseInstance;
  } catch (e) {
    console.error('Error initializing Supabase Client:', e);
    return null;
  }
}

export function resetSupabaseClient() {
  if (realtimeChannel && supabaseInstance) {
    try {
      supabaseInstance.removeChannel(realtimeChannel);
    } catch (e) {}
  }
  realtimeChannel = null;
  supabaseInstance = null;
}

function safeIsoDate(val?: string): string {
  if (!val) return new Date().toISOString();
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return new Date().toISOString();
    return d.toISOString();
  } catch {
    return new Date().toISOString();
  }
}

// ==========================================
// MAPPERS: App Model <-> Database Row
// ==========================================

export function studentToDb(s: Student) {
  return {
    id: s.id,
    code: s.code,
    name: s.name,
    phone: s.phone || null,
    parent_whatsapp: s.parentWhatsapp || null,
    grade: s.grade || null,
    course: s.course || null,
    course_schedule: s.courseSchedule || null,
    attendance_mode: s.attendanceMode || 'حضور سنتر',
    amount_paid: s.amountPaid || 0,
    payment_method: s.paymentMethod || 'نقدي كاش',
    confirmed_by: s.confirmedBy || null,
    receipt_url: s.receiptUrl || null,
    status: s.status || 'active',
    payment_type: s.paymentType || 'full',
    total_course_fee: s.totalCourseFee || 0,
    installment_status: s.installmentStatus || 'paid_in_full',
    remaining_amount: s.remainingAmount || 0,
    installment_due_date: s.installmentDueDate || null,
    installment_notes: s.installmentNotes || null,
    created_at: safeIsoDate(s.createdAt),
  };
}

export function studentFromDb(row: any): Student {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    phone: row.phone || '',
    parentWhatsapp: row.parent_whatsapp || '',
    grade: row.grade || '',
    course: row.course || '',
    courseSchedule: row.course_schedule || '',
    attendanceMode: row.attendance_mode || 'حضور سنتر',
    amountPaid: Number(row.amount_paid) || 0,
    paymentMethod: row.payment_method || 'نقدي كاش',
    confirmedBy: row.confirmed_by || '',
    receiptUrl: row.receipt_url || undefined,
    createdAt: row.created_at ? row.created_at.replace('T', ' ').slice(0, 16) : new Date().toISOString().slice(0, 16),
    status: row.status === 'suspended' ? 'suspended' : row.status === 'pending' ? 'pending' : 'active',
    paymentType: row.payment_type || 'full',
    totalCourseFee: Number(row.total_course_fee) || 0,
    installmentStatus: row.installment_status || 'paid_in_full',
    remainingAmount: Number(row.remaining_amount) || 0,
    installmentDueDate: row.installment_due_date || undefined,
    installmentNotes: row.installment_notes || undefined,
  };
}

export function courseToDb(c: Course) {
  return {
    id: c.id,
    name: c.name,
    grade: c.grade,
    price: c.price,
    enrolled_count: c.enrolledCount,
    is_active: c.isActive,
    schedule: c.schedule || null,
  };
}

export function courseFromDb(row: any): Course {
  return {
    id: row.id,
    name: row.name,
    grade: row.grade,
    price: Number(row.price) || 0,
    enrolledCount: Number(row.enrolled_count) || 0,
    isActive: row.is_active ?? true,
    schedule: row.schedule || undefined,
  };
}

export function expenseToDb(e: Expense) {
  return {
    id: e.id,
    title: e.title,
    category: e.category,
    amount: e.amount,
    date: e.date,
    paid_by: e.paidBy,
    notes: e.notes || null,
  };
}

export function expenseFromDb(row: any): Expense {
  return {
    id: row.id,
    title: row.title,
    category: row.category || 'أخرى',
    amount: Number(row.amount) || 0,
    date: row.date || new Date().toISOString().slice(0, 10),
    paidBy: row.paid_by || '',
    notes: row.notes || undefined,
  };
}

export function staffToDb(s: StaffMember) {
  return {
    id: s.id,
    name: s.name,
    role: s.role,
    phone: s.phone,
    base_salary: s.baseSalary,
    bonus: s.bonus,
    status: s.status,
    permissions: s.permissions || [],
    username: s.username || null,
    password: s.password || null,
  };
}

export function staffFromDb(row: any): StaffMember {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    phone: row.phone || '',
    baseSalary: Number(row.base_salary) || 0,
    bonus: Number(row.bonus) || 0,
    status: row.status === 'مدفوع' ? 'مدفوع' : 'معلق',
    permissions: row.permissions || [],
    username: row.username || undefined,
    password: row.password || undefined,
  };
}

export function logToDb(l: AuditLog) {
  return {
    id: l.id,
    action: l.action,
    user_name: l.user,
    timestamp: l.timestamp,
    details: l.details,
    type: l.type,
  };
}

export function logFromDb(row: any): AuditLog {
  return {
    id: row.id,
    action: row.action,
    user: row.user_name || row.user || 'المسؤول',
    timestamp: row.timestamp || new Date().toISOString().slice(0, 19),
    details: row.details || '',
    type: row.type || 'info',
  };
}

export function notificationToDb(n: AppNotification) {
  return {
    id: n.id,
    title: n.title,
    details: n.details,
    user_name: n.user,
    timestamp: n.timestamp,
    type: n.type,
    is_read: n.read,
    link_screen: n.linkScreen || null,
  };
}

export function notificationFromDb(row: any): AppNotification {
  return {
    id: row.id,
    title: row.title,
    details: row.details || '',
    user: row.user_name || row.user || 'المسؤول',
    timestamp: row.timestamp || 'الآن',
    type: row.type || 'info',
    read: row.is_read ?? false,
    linkScreen: row.link_screen || undefined,
  };
}

// ==========================================
// ASYNC CLOUD SYNC OPERATIONS
// ==========================================

export async function fetchAllCloudData() {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const [stdRes, crsRes, expRes, stfRes, logRes, ntfRes, setRes] = await Promise.all([
      supabase.from('students').select('*').order('created_at', { ascending: false }),
      supabase.from('courses').select('*'),
      supabase.from('expenses').select('*'),
      supabase.from('staff').select('*'),
      supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('center_settings').select('*').eq('id', 'default').maybeSingle(),
    ]);

    const result: any = {};

    if (!stdRes.error && Array.isArray(stdRes.data)) {
      result.students = stdRes.data.map(studentFromDb);
      saveStoredStudents(result.students);
    }

    if (!crsRes.error && Array.isArray(crsRes.data) && crsRes.data.length > 0) {
      result.courses = crsRes.data.map(courseFromDb);
      saveStoredCourses(result.courses);
    }

    if (!expRes.error && Array.isArray(expRes.data)) {
      result.expenses = expRes.data.map(expenseFromDb);
      saveStoredExpenses(result.expenses);
    }

    if (!stfRes.error && Array.isArray(stfRes.data) && stfRes.data.length > 0) {
      result.staff = stfRes.data.map(staffFromDb);
      saveStoredStaff(result.staff);
    }

    if (!logRes.error && Array.isArray(logRes.data)) {
      result.logs = logRes.data.map(logFromDb);
      saveStoredLogs(result.logs);
    }

    if (!ntfRes.error && Array.isArray(ntfRes.data)) {
      result.notifications = ntfRes.data.map(notificationFromDb);
      saveStoredNotifications(result.notifications);
    }

    if (setRes.data) {
      const row = setRes.data;
      result.centerSettings = {
        centerName: row.center_name || '',
        phoneNumber: row.phone_number || '',
        platformUrl: row.platform_url || '',
        academicYear: row.academic_year || '',
        teacherName: row.teacher_name || '',
        managerName: row.manager_name || '',
        systemDescription: row.system_description || '',
        receiptSystemTitle: row.receipt_system_title || '',
        receiptFooterText: row.receipt_footer_text || '',
      };
      saveStoredCenterSettings(result.centerSettings);
    }

    return result;
  } catch (e) {
    console.error('Error fetching all cloud data from Supabase:', e);
    return null;
  }
}

export async function syncStudentToCloud(student: Student) {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    const payload = studentToDb(student);
    const { error } = await supabase.from('students').upsert(payload, { onConflict: 'id' });
    if (error) {
      console.warn('Supabase student upsert warning, attempting basic columns:', error.message);
      await supabase.from('students').upsert({
        id: student.id,
        code: student.code,
        name: student.name,
        phone: student.phone || '',
        grade: student.grade || '',
        course: student.course || '',
        amount_paid: student.amountPaid || 0,
        payment_method: student.paymentMethod || 'نقدي كاش',
        confirmed_by: student.confirmedBy || '',
        status: student.status || 'active',
      }, { onConflict: 'id' });
    }
  } catch (e) {
    console.error('Error syncing student to Supabase:', e);
  }
}

export async function deleteStudentFromCloud(id: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    await supabase.from('students').delete().eq('id', id);
  } catch (e) {
    console.error('Error deleting student from Supabase:', e);
  }
}

export async function deleteAllStudentsFromCloud() {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    await supabase.from('students').delete().neq('id', 'sentinel_none');
  } catch (e) {
    console.error('Error deleting all students from Supabase:', e);
  }
}

export async function syncCourseToCloud(course: Course) {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    await supabase.from('courses').upsert(courseToDb(course), { onConflict: 'id' });
  } catch (e) {
    console.error('Error syncing course to Supabase:', e);
  }
}

export async function deleteCourseFromCloud(id: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    await supabase.from('courses').delete().eq('id', id);
  } catch (e) {
    console.error('Error deleting course from Supabase:', e);
  }
}

export async function syncExpenseToCloud(expense: Expense) {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    await supabase.from('expenses').upsert(expenseToDb(expense), { onConflict: 'id' });
  } catch (e) {
    console.error('Error syncing expense to Supabase:', e);
  }
}

export async function deleteExpenseFromCloud(id: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    await supabase.from('expenses').delete().eq('id', id);
  } catch (e) {
    console.error('Error deleting expense from Supabase:', e);
  }
}

export async function syncStaffToCloud(staff: StaffMember) {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    await supabase.from('staff').upsert(staffToDb(staff), { onConflict: 'id' });
  } catch (e) {
    console.error('Error syncing staff to Supabase:', e);
  }
}

export async function deleteStaffFromCloud(id: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    await supabase.from('staff').delete().eq('id', id);
  } catch (e) {
    console.error('Error deleting staff from Supabase:', e);
  }
}

export async function syncLogToCloud(log: AuditLog) {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    await supabase.from('audit_logs').upsert(logToDb(log), { onConflict: 'id' });
  } catch (e) {
    console.error('Error syncing log to Supabase:', e);
  }
}

export async function syncNotificationToCloud(notification: AppNotification) {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    await supabase.from('notifications').upsert(notificationToDb(notification), { onConflict: 'id' });
  } catch (e) {
    console.error('Error syncing notification to Supabase:', e);
  }
}

export async function syncCenterSettingsToCloud(settings: CenterSettings) {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    await supabase.from('center_settings').upsert(
      {
        id: 'default',
        center_name: settings.centerName,
        phone_number: settings.phoneNumber,
        platform_url: settings.platformUrl,
        academic_year: settings.academicYear,
        teacher_name: settings.teacherName,
        manager_name: settings.managerName,
        system_description: settings.systemDescription,
        receipt_system_title: settings.receiptSystemTitle,
        receipt_footer_text: settings.receiptFooterText,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
  } catch (e) {
    console.error('Error syncing center settings to Supabase:', e);
  }
}

// ==========================================
// SUPABASE REALTIME WEBSOCKET ENGINE
// ==========================================

const cloudEventListeners = new Set<(payload: RealtimeSyncPayload) => void>();
const dbSyncListeners = new Set<() => void>();
let realtimeChannel: any = null;

export function getRealtimeChannel() {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  if (realtimeChannel) {
    return realtimeChannel;
  }

  try {
    const channel = supabase.channel('el_saqqa_global_room', {
      config: {
        broadcast: { ack: false, self: false },
      },
    });

    // 1. Attach broadcast handler BEFORE subscribe()
    channel.on('broadcast', { event: 'TEAM_REALTIME_ACTION' }, (message: any) => {
      if (message?.payload) {
        cloudEventListeners.forEach((cb) => {
          try {
            cb(message.payload);
          } catch (err) {
            console.error('Error in cloud event listener callback:', err);
          }
        });
      }
    });

    // 2. Attach postgres_changes handlers BEFORE subscribe()
    channel.on('postgres_changes', { event: '*', schema: 'public' }, async (payload: any) => {
      console.log('📡 Realtime PostgreSQL Change received:', payload);
      try {
        await fetchAllCloudData();
      } catch (err) {
        console.warn('Error refetching cloud data after postgres change:', err);
      }
      dbSyncListeners.forEach((cb) => {
        try {
          cb();
        } catch (err) {
          console.error('Error in dbSyncListener callback:', err);
        }
      });
    });

    // 3. ONLY call subscribe() AFTER all callbacks are registered on the channel
    channel.subscribe((status: string, err: any) => {
      if (err) {
        console.warn('📡 Supabase Realtime Channel Subscription Error:', err);
      } else {
        console.log('📡 Supabase Realtime Channel Status:', status);
      }
    });

    realtimeChannel = channel;
    return realtimeChannel;
  } catch (e) {
    console.error('Error setting up Supabase Realtime channel:', e);
    return null;
  }
}

export function broadcastToCloudTeam(payload: RealtimeSyncPayload) {
  // 1. Instant WebSocket broadcast across ALL devices worldwide
  try {
    const channel = getRealtimeChannel();
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'TEAM_REALTIME_ACTION',
        payload,
      });
    }
  } catch (e) {
    console.error('Error sending Supabase broadcast:', e);
  }

  // 2. Also broadcast to same-machine browser tabs
  broadcastRealtimeEvent(payload);
}

export function subscribeToSupabaseRealtime(
  onCloudEvent: (payload: RealtimeSyncPayload) => void,
  onDbSync: () => void
): () => void {
  // Register listeners into sets
  cloudEventListeners.add(onCloudEvent);
  dbSyncListeners.add(onDbSync);

  // Ensure singleton channel is created and subscribed with all handlers attached
  getRealtimeChannel();

  return () => {
    cloudEventListeners.delete(onCloudEvent);
    dbSyncListeners.delete(onDbSync);
  };
}
