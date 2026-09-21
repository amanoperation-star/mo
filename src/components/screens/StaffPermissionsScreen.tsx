import React, { useState } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  Plus,
  Lock,
  Phone,
  User,
  DollarSign,
  ShieldAlert
} from 'lucide-react';
import { StaffMember } from '../../types';

interface StaffPermissionsScreenProps {
  staff: StaffMember[];
  onAddStaff: (newStaff: Omit<StaffMember, 'id'>) => void;
  onUpdateStaff: (id: string, updatedData: Partial<StaffMember>) => void;
  onDeleteStaff: (id: string) => void;
}

const AVAILABLE_PERMISSIONS = [
  'التحكم الكامل',
  'البيانات المالية',
  'تأكيد الإيصالات',
  'إدارة الكورسات',
  'متابعة الطلاب',
  'إرسال الواتساب',
  'رصد الدرجات',
  'تعديل المصروفات',
  'إدارة فريق العمل'
];

export const StaffPermissionsScreen: React.FC<StaffPermissionsScreenProps> = ({
  staff,
  onAddStaff,
  onUpdateStaff,
  onDeleteStaff,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [baseSalary, setBaseSalary] = useState<number>(3000);
  const [bonus, setBonus] = useState<number>(0);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // Quick permission editor inline for a card
  const [quickEditingPermsId, setQuickEditingPermsId] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingStaffId(null);
    setName('');
    setRole('مساعد تدريس وإشراف');
    setPhone('');
    setBaseSalary(3000);
    setBonus(0);
    setSelectedPermissions(['متابعة الطلاب', 'تأكيد الإيصالات']);
    setShowModal(true);
  };

  const handleOpenEdit = (member: StaffMember) => {
    setEditingStaffId(member.id);
    setName(member.name);
    setRole(member.role);
    setPhone(member.phone);
    setBaseSalary(member.baseSalary || 0);
    setBonus(member.bonus || 0);
    setSelectedPermissions(member.permissions || []);
    setShowModal(true);
  };

  const togglePermissionSelection = (perm: string) => {
    if (selectedPermissions.includes(perm)) {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== perm));
    } else {
      setSelectedPermissions([...selectedPermissions, perm]);
    }
  };

  const handleToggleCardPermission = (member: StaffMember, perm: string) => {
    const currentPerms = member.permissions || [];
    const updated = currentPerms.includes(perm)
      ? currentPerms.filter((p) => p !== perm)
      : [...currentPerms, perm];
    onUpdateStaff(member.id, { permissions: updated });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) return;

    if (editingStaffId) {
      onUpdateStaff(editingStaffId, {
        name: name.trim(),
        role: role.trim(),
        phone: phone.trim(),
        baseSalary: Number(baseSalary),
        bonus: Number(bonus),
        permissions: selectedPermissions,
      });
    } else {
      onAddStaff({
        name: name.trim(),
        role: role.trim(),
        phone: phone.trim() || '01000000000',
        baseSalary: Number(baseSalary) || 0,
        bonus: Number(bonus) || 0,
        status: 'معلق',
        permissions: selectedPermissions.length > 0 ? selectedPermissions : ['متابعة الطلاب'],
      });
    }

    setShowModal(false);
    setEditingStaffId(null);
  };

  return (
    <div
      id="staff-permissions-screen"
      className="bg-[#0b1320] border border-[#192b42] rounded-2xl p-4 md:p-7 shadow-2xl flex-1 flex flex-col transition-all"
    >
      {/* Header with Title and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#16253b]">
        <div>
          <h2 className="text-lg md:text-xl font-extrabold text-white flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <span>فريق العمل والصلاحيات الإدارية</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            إضافة وتعديل أدوار المساعدين، والمشرفين، وتعيين صلاحيات تأكيد الإيصالات ورصد الدرجات
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          type="button"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs px-4 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-blue-600/20 cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>إضافة عضو جديد وتحديد الصلاحيات</span>
        </button>
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5 mt-5">
        {staff.map((member) => {
          const isQuickEditing = quickEditingPermsId === member.id;

          return (
            <div
              key={member.id}
              className="bg-[#080f1a] border border-[#17273f] rounded-xl p-5 flex flex-col justify-between gap-4 shadow-sm hover:border-[#1f385c] transition-all"
            >
              <div>
                {/* Member Top Bar with Action Buttons */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-black text-base shrink-0">
                      {member.name.trim().split(' ')[0]?.[0] || 'ع'}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-white text-sm leading-snug">{member.name}</h3>
                      <p className="text-xs text-amber-400 font-bold mt-0.5">{member.role}</p>
                    </div>
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(member)}
                      title="تعديل العضو والصلاحيات"
                      type="button"
                      className="p-1.5 rounded-lg bg-[#122033] hover:bg-blue-600 hover:text-white text-blue-300 border border-[#1d3350] transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`هل أنت متأكد من حذف (${member.name}) من فريق العمل؟`)) {
                          onDeleteStaff(member.id);
                        }
                      }}
                      title="حذف العضو"
                      type="button"
                      className="p-1.5 rounded-lg bg-[#122033] hover:bg-red-600 hover:text-white text-red-400 border border-[#1d3350] transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Permissions Section */}
                <div className="mt-4 pt-3 border-t border-[#132238] flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-blue-400" />
                      <span>الصلاحيات الممنوحة ({member.permissions?.length || 0}):</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuickEditingPermsId(isQuickEditing ? null : member.id)}
                      className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold cursor-pointer underline"
                    >
                      {isQuickEditing ? 'تم' : 'تعديل سريع'}
                    </button>
                  </div>

                  {/* Regular badges or Quick toggle badges */}
                  {!isQuickEditing ? (
                    <div className="flex flex-wrap gap-1.5 min-h-[50px]">
                      {member.permissions && member.permissions.length > 0 ? (
                        member.permissions.map((perm, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-md bg-[#101b2a] border border-[#1a2f4a] text-[11px] text-blue-300 font-medium flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span>{perm}</span>
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500 italic">لا توجد صلاحيات معينة حالياً</span>
                      )}
                    </div>
                  ) : (
                    /* Interactive Quick Checkboxes */
                    <div className="p-2.5 bg-[#050a12] border border-blue-500/30 rounded-lg flex flex-col gap-1.5 animate-in fade-in">
                      <div className="text-[10px] text-slate-400 font-semibold mb-1">انقر لإضافة أو سحب الصلاحية فوراً:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {AVAILABLE_PERMISSIONS.map((perm) => {
                          const hasIt = member.permissions?.includes(perm);
                          return (
                            <button
                              key={perm}
                              type="button"
                              onClick={() => handleToggleCardPermission(member, perm)}
                              className={`text-[10px] px-2 py-1 rounded border flex items-center gap-1 font-semibold transition-all cursor-pointer ${
                                hasIt
                                  ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                                  : 'bg-[#0f172a] border-slate-700/60 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              {hasIt ? <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" /> : <Plus className="w-2.5 h-2.5" />}
                              <span>{perm}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer info: Phone & Salary */}
              <div className="pt-3 border-t border-[#132238] flex flex-col gap-1.5 text-[11px] text-slate-400">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>رقم الهاتف:</span>
                  </span>
                  <span className="font-mono text-slate-200 font-semibold">{member.phone || 'غير مسجل'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-emerald-400" />
                    <span>الراتب الأساسي:</span>
                  </span>
                  <span className="font-mono text-emerald-400 font-bold" dir="ltr">
                    {(member.baseSalary || 0).toLocaleString('en-US')} <span className="font-sans text-xs font-normal">ج.م</span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0b1320] border border-[#1b2f48] rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-5 text-right">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#16253b]">
              <button
                onClick={() => setShowModal(false)}
                type="button"
                className="p-1 hover:bg-[#152336] text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-extrabold text-white">
                  {editingStaffId ? 'تعديل بيانات وصلاحيات العضو' : 'إضافة عضو جديد وتحديد الصلاحيات'}
                </h3>
              </div>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-300">اسم الموظف / المساعد الثلاثي *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: د. أحمد كمال الشافعي"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-[#070d17] border border-[#1c2e47] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-300">المسمى الوظيفي / الدور *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: مشرف مراجعات واختبارات"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="bg-[#070d17] border border-[#1c2e47] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-300">رقم الهاتف / الواتساب</label>
                  <input
                    type="text"
                    placeholder="010XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-[#070d17] border border-[#1c2e47] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition-all font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-300">الراتب الأساسي (ج.م)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="3000"
                    value={baseSalary || ''}
                    onChange={(e) => setBaseSalary(Number(e.target.value))}
                    className="bg-[#070d17] border border-[#1c2e47] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition-all font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-300">المكافأة الشهرية المتوقعة (ج.م)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={bonus || ''}
                    onChange={(e) => setBonus(Number(e.target.value))}
                    className="bg-[#070d17] border border-[#1c2e47] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition-all font-mono"
                  />
                </div>
              </div>

              {/* Permissions Checklist */}
              <div className="flex flex-col gap-2 pt-2 border-t border-[#16253b]">
                <label className="text-xs font-bold text-blue-300 flex items-center justify-between">
                  <span>الصلاحيات الإدارية والتشغيلية الممنوحة:</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    (اختر الصلاحيات المناسبة للدور)
                  </span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-[#070d17] border border-[#1c2e47] rounded-xl max-h-48 overflow-y-auto">
                  {AVAILABLE_PERMISSIONS.map((perm) => {
                    const isChecked = selectedPermissions.includes(perm);
                    return (
                      <button
                        key={perm}
                        type="button"
                        onClick={() => togglePermissionSelection(perm)}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-xs text-right transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-blue-600/20 border-blue-500/60 text-blue-300 font-bold'
                            : 'bg-[#0b1320] border-[#182a40] text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
                            isChecked
                              ? 'bg-blue-600 border-blue-500 text-white'
                              : 'border-slate-600 bg-transparent'
                          }`}
                        >
                          {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                        <span className="truncate">{perm}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#16253b]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-[#152336] text-slate-300 text-xs px-4 py-2.5 rounded-xl font-semibold hover:bg-[#1a2e48] transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-6 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-blue-600/30 cursor-pointer"
                >
                  {editingStaffId ? 'حفظ التعديلات' : 'إضافة الموظف والصلاحيات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
