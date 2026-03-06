'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import {
  collection, addDoc, getDocs, deleteDoc,
  doc, orderBy, query, serverTimestamp,
} from 'firebase/firestore';

interface HealthRecord {
  id: string;
  petName: string;
  type: 'weight' | 'vaccine' | 'medicine' | 'vet_visit' | 'other';
  value: string;
  unit: string;
  date: string;
  note: string;
  createdAt: any;
}

const RECORD_TYPES = [
  { value: 'weight',    label: 'น้ำหนัก',       icon: '⚖️', color: '#0d9488', bg: '#f0fdfa' },
  { value: 'vaccine',   label: 'วัคซีน',         icon: '💉', color: '#7c3aed', bg: '#f3e8ff' },
  { value: 'medicine',  label: 'ยา',             icon: '💊', color: '#d97706', bg: '#fffbeb' },
  { value: 'vet_visit', label: 'ไปหาสัตวแพทย์', icon: '🏥', color: '#2563eb', bg: '#eff6ff' },
  { value: 'other',     label: 'อื่นๆ',          icon: '📝', color: '#6b7280', bg: '#f9fafb' },
];

const getType = (value: string) => RECORD_TYPES.find(t => t.value === value) || RECORD_TYPES[4];

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function TrackerPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [pets, setPets] = useState<string[]>([]);
  const [selectedPet, setSelectedPet] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [fetching, setFetching] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDeletePet, setConfirmDeletePet] = useState('');

  const [form, setForm] = useState({
    petName: '',
    type: 'weight' as HealthRecord['type'],
    value: '',
    unit: 'kg',
    date: new Date().toISOString().split('T')[0],
    note: '',
  });

  useEffect(() => {
    if (!user) return;
    fetchRecords();
  }, [user]);

  const fetchRecords = async () => {
    if (!user) return;
    setFetching(true);
    try {
      const q = query(
        collection(db, 'users', user.uid, 'healthRecords'),
        orderBy('date', 'desc')
      );
      const snap = await getDocs(q);
      const data: HealthRecord[] = snap.docs.map(d => {
        const raw = d.data();
        return {
          id: d.id,
          petName: raw.petName,
          type: raw.type,
          value: raw.value,
          unit: raw.unit ?? '',
          date: raw.date,
          note: raw.note ?? '',
          createdAt: raw.createdAt,
        };
      });
      setRecords(data);
      const uniquePets = [...new Set(data.map(r => r.petName))].filter(Boolean);
      setPets(uniquePets);
      if (uniquePets.length > 0 && !selectedPet) setSelectedPet(uniquePets[0]);
    } catch (e) { console.error(e); }
    setFetching(false);
  };

  const handleSave = async () => {
    if (!user || !form.petName.trim() || !form.value.trim() || !form.date) return;
    setSaving(true);
    try {
      const displayValue = form.type === 'weight'
        ? `${form.value} ${form.unit}`
        : form.value;

      await addDoc(collection(db, 'users', user.uid, 'healthRecords'), {
        petName: form.petName.trim(),
        type: form.type,
        value: displayValue,
        unit: form.type === 'weight' ? form.unit : '',
        date: form.date,
        note: form.note.trim(),
        createdAt: serverTimestamp(),
      });
      setForm(f => ({ ...f, value: '', note: '', date: new Date().toISOString().split('T')[0] }));
      setShowForm(false);
      const petName = form.petName.trim();
      await fetchRecords();
      setSelectedPet(petName);
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const handleDeleteRecord = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'healthRecords', id));
    setRecords(r => r.filter(x => x.id !== id));
  };

  // ลบสัตว์เลี้ยงทั้งหมด (ลบทุก record ของสัตว์นั้น)
  // ฟังก์ชันนี้ยังคงเดิม แต่เราจะเรียกจากปุ่มโดยตรง
const handleDeletePet = async (petName: string) => {
  if (!user) return;
  const toDelete = records.filter(r => r.petName === petName);
  await Promise.all(toDelete.map(r => deleteDoc(doc(db, 'users', user.uid, 'healthRecords', r.id))));
  const newRecords = records.filter(r => r.petName !== petName);
  setRecords(newRecords);
  const newPets = [...new Set(newRecords.map(r => r.petName))].filter(Boolean);
  setPets(newPets);
  setSelectedPet(newPets[0] ?? '');
  setConfirmDeletePet(''); // เพิ่มบรรทัดนี้
};

  if (!user) return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', gap: '16px' }}>
      <p style={{ fontSize: '32px' }}>🐾</p>
      <p style={{ color: '#374151', fontSize: '16px', fontWeight: '600', margin: 0 }}>ต้องเข้าสู่ระบบก่อน</p>
      <button onClick={() => router.push('/login')} style={{ background: '#0d9488', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 28px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
        เข้าสู่ระบบ
      </button>
    </div>
  );

  const filteredRecords = records.filter(r => {
    const petMatch = selectedPet ? r.petName === selectedPet : true;
    const typeMatch = filterType === 'all' ? true : r.type === filterType;
    return petMatch && typeMatch;
  });

  const petRecords = records.filter(r => r.petName === selectedPet);
  const latestWeight = petRecords.filter(r => r.type === 'weight').sort((a, b) => b.date.localeCompare(a.date))[0];
  const latestVaccine = petRecords.filter(r => r.type === 'vaccine').sort((a, b) => b.date.localeCompare(a.date))[0];
  const totalVisits = petRecords.filter(r => r.type === 'vet_visit').length;

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif' }}>
      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', letterSpacing: '-0.03em', margin: '0 0 4px' }}>Health Tracker 🐾</h1>
            <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>บันทึกและติดตามสุขภาพสัตว์เลี้ยง</p>
          </div>
          <button onClick={() => setShowForm(true)} style={{ background: '#0d9488', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 18px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
            + บันทึกใหม่
          </button>
        </div>

        {/* Pet Tabs */}
        {pets.length > 0 && (
  <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
    {pets.map(pet => (
      <div key={pet} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {/* ปุ่มชื่อสัตว์ */}
        <button
          onClick={() => setSelectedPet(pet)}
          style={{
            padding: '7px 14px',
            borderRadius: '999px',
            border: '1.5px solid',
            borderColor: selectedPet === pet ? '#0d9488' : '#e5e7eb',
            background: selectedPet === pet ? '#f0fdfa' : 'white',
            color: selectedPet === pet ? '#0d9488' : '#6b7280',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'all 0.15s',
          }}
        >
          🐾 {pet}
        </button>

        {/* แสดงปุ่มยืนยัน/ยกเลิกเมื่ออยู่ในโหมดลบ */}
        {confirmDeletePet === pet ? (
          <>
            <button
              onClick={() => handleDeletePet(pet)}
              style={{
                padding: '7px 12px',
                borderRadius: '999px',
                border: '1.5px solid #ef4444',
                background: '#fee2e2',
                color: '#ef4444',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                fontFamily: 'inherit',
                whiteSpace: 'nowrap',
              }}
            >
              ลบจริงๆ?
            </button>
            <button
              onClick={() => setConfirmDeletePet('')}
              style={{
                padding: '7px 12px',
                borderRadius: '999px',
                border: '1.5px solid #e5e7eb',
                background: 'white',
                color: '#6b7280',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                fontFamily: 'inherit',
                whiteSpace: 'nowrap',
              }}
            >
              ยกเลิก
            </button>
          </>
        ) : (
          /* ปุ่มลบ (กากบาท) สำหรับเรียกโหมดยืนยัน */
          <button
            onClick={() => setConfirmDeletePet(pet)}
            title={`ลบ ${pet}`}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '1.5px solid #e5e7eb',
              background: 'white',
              color: '#9ca3af',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#fee2e2';
              e.currentTarget.style.borderColor = '#fecaca';
              e.currentTarget.style.color = '#ef4444';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.color = '#9ca3af';
            }}
          >
            ✕
          </button>
        )}
      </div>
    ))}

    {/* ปุ่มเพิ่มสัตว์เลี้ยง */}
    <button
      onClick={() => { setShowForm(true); setForm(f => ({ ...f, petName: '' })); }}
      style={{
        padding: '7px 16px',
        borderRadius: '999px',
        border: '1.5px dashed #d1d5db',
        background: 'white',
        color: '#9ca3af',
        fontSize: '13px',
        fontWeight: '500',
        cursor: 'pointer',
        fontFamily: 'inherit'
      }}
    >
      + เพิ่มสัตว์เลี้ยง
    </button>
  </div>
)}

        {/* Stats Cards */}
        {selectedPet && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
            {[
              { label: 'น้ำหนักล่าสุด', value: latestWeight ? latestWeight.value : '—', sub: latestWeight ? formatDate(latestWeight.date) : 'ยังไม่มีข้อมูล', icon: '⚖️', color: '#0d9488' },
              { label: 'วัคซีนล่าสุด', value: latestVaccine ? latestVaccine.value : '—', sub: latestVaccine ? formatDate(latestVaccine.date) : 'ยังไม่มีข้อมูล', icon: '💉', color: '#7c3aed' },
              { label: 'ไปหาสัตวแพทย์', value: `${totalVisits} ครั้ง`, sub: 'ทั้งหมด', icon: '🏥', color: '#2563eb' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'white', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: '20px', marginBottom: '8px' }}>{s.icon}</div>
                <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 4px' }}>{s.label}</p>
                <p style={{ fontSize: '15px', fontWeight: '700', color: s.color, margin: '0 0 2px', wordBreak: 'break-word' }}>{s.value}</p>
                <p style={{ fontSize: '11px', color: '#d1d5db', margin: 0 }}>{s.sub}</p>
              </div>
            ))}
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '24px' }}>
            <div style={{ background: 'white', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: 0 }}>บันทึกสุขภาพ</h2>
                <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '20px', cursor: 'pointer', lineHeight: 1 }}>✕</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Pet Name */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>ชื่อสัตว์เลี้ยง *</label>
                  <input
                    list="pet-names"
                    value={form.petName}
                    onChange={e => setForm(f => ({ ...f, petName: e.target.value }))}
                    placeholder="เช่น เจ้าโต, น้องมะนาว"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', color: '#111827' }}
                    onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#0d9488'}
                    onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#e5e7eb'}
                  />
                  <datalist id="pet-names">
                    {pets.map(p => <option key={p} value={p} />)}
                  </datalist>
                </div>

                {/* Type */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>ประเภท *</label>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {RECORD_TYPES.map(t => (
                      <button key={t.value} onClick={() => setForm(f => ({ ...f, type: t.value as HealthRecord['type'] }))} style={{ padding: '6px 12px', borderRadius: '8px', border: '1.5px solid', borderColor: form.type === t.value ? t.color : '#e5e7eb', background: form.type === t.value ? t.bg : 'white', color: form.type === t.value ? t.color : '#6b7280', fontSize: '12px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                        {t.icon} {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Value + Unit */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>
                    {form.type === 'weight' ? 'น้ำหนัก *' :
                     form.type === 'vaccine' ? 'วัคซีนที่ฉีด * (เช่น FVRCP, พิษสุนัขบ้า)' :
                     form.type === 'medicine' ? 'ยาที่ได้รับ * (เช่น Drontal Plus)' :
                     form.type === 'vet_visit' ? 'เหตุผลที่ไป * (เช่น ตรวจสุขภาพประจำปี)' : 'รายละเอียด *'}
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      value={form.value}
                      onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                      placeholder={
                        form.type === 'weight' ? '4.2' :
                        form.type === 'vaccine' ? 'FVRCP' :
                        form.type === 'medicine' ? 'Drontal Plus' :
                        form.type === 'vet_visit' ? 'ตรวจสุขภาพประจำปี' : 'รายละเอียด'
                      }
                      type={form.type === 'weight' ? 'number' : 'text'}
                      step={form.type === 'weight' ? '0.1' : undefined}
                      style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '14px', fontFamily: 'inherit', outline: 'none', color: '#111827' }}
                      onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#0d9488'}
                      onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#e5e7eb'}
                    />
                    {/* ✅ Unit selector — แสดงเฉพาะตอนเลือก weight */}
                    {form.type === 'weight' && (
                      <select
                        value={form.unit}
                        onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                        style={{ padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '14px', fontFamily: 'inherit', outline: 'none', color: '#374151', background: 'white', cursor: 'pointer', fontWeight: '600' }}
                      >
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                      </select>
                    )}
                  </div>
                  {form.type === 'weight' && form.value && (
                    <p style={{ fontSize: '12px', color: '#0d9488', margin: '4px 0 0', fontWeight: '500' }}>
                      จะบันทึกเป็น: {form.value} {form.unit}
                    </p>
                  )}
                </div>

                {/* Date */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>วันที่ *</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', color: '#111827' }}
                    onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#0d9488'}
                    onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#e5e7eb'}
                  />
                </div>

                {/* Note */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>หมายเหตุ (ไม่จำเป็น)</label>
                  <textarea
                    value={form.note}
                    onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                    placeholder="บันทึกเพิ่มเติม..."
                    rows={2}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '14px', fontFamily: 'inherit', outline: 'none', resize: 'none', boxSizing: 'border-box', color: '#111827' }}
                    onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = '#0d9488'}
                    onBlur={e => (e.target as HTMLTextAreaElement).style.borderColor = '#e5e7eb'}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: '11px', borderRadius: '10px', border: '1.5px solid #e5e7eb', background: 'white', color: '#374151', fontSize: '14px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>ยกเลิก</button>
                  <button onClick={handleSave} disabled={saving || !form.petName.trim() || !form.value.trim()} style={{ flex: 2, padding: '11px', borderRadius: '10px', border: 'none', background: saving || !form.petName.trim() || !form.value.trim() ? '#e5e7eb' : '#0d9488', color: saving || !form.petName.trim() || !form.value.trim() ? '#9ca3af' : 'white', fontSize: '14px', fontWeight: '600', cursor: saving || !form.petName.trim() || !form.value.trim() ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                    {saving ? 'กำลังบันทึก...' : 'บันทึก'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter */}
        {records.length > 0 && (
          <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <button onClick={() => setFilterType('all')} style={{ padding: '5px 14px', borderRadius: '999px', border: '1px solid', borderColor: filterType === 'all' ? '#0d9488' : '#e5e7eb', background: filterType === 'all' ? '#f0fdfa' : 'white', color: filterType === 'all' ? '#0d9488' : '#6b7280', fontSize: '12px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>
              ทั้งหมด
            </button>
            {RECORD_TYPES.map(t => (
              <button key={t.value} onClick={() => setFilterType(t.value)} style={{ padding: '5px 14px', borderRadius: '999px', border: '1px solid', borderColor: filterType === t.value ? t.color : '#e5e7eb', background: filterType === t.value ? t.bg : 'white', color: filterType === t.value ? t.color : '#6b7280', fontSize: '12px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        )}

        {/* Timeline */}
        {fetching ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af', fontSize: '14px' }}>กำลังโหลด...</div>
        ) : records.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: '40px', margin: '0 0 12px' }}>🐾</p>
            <p style={{ fontSize: '15px', fontWeight: '600', color: '#374151', margin: '0 0 6px' }}>ยังไม่มีข้อมูลสุขภาพ</p>
            <p style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 20px' }}>เริ่มบันทึกน้ำหนัก วัคซีน หรือประวัติการรักษาได้เลย</p>
            <button onClick={() => setShowForm(true)} style={{ background: '#0d9488', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 24px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
              + บันทึกรายการแรก
            </button>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 24px', background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
            <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>ไม่มีข้อมูลในหมวดนี้</p>
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '19px', top: '24px', bottom: '24px', width: '2px', background: '#f3f4f6', zIndex: 0 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredRecords.map(record => {
                const t = getType(record.type);
                return (
                  <div key={record.id} style={{ display: 'flex', gap: '16px', position: 'relative', zIndex: 1 }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'white', border: `2px solid ${t.color}`, boxShadow: `0 0 0 3px ${t.bg}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                      {t.icon}
                    </div>
                    <div style={{ flex: 1, background: 'white', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '14px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>{record.petName}</span>
                          <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '999px', background: t.bg, color: t.color }}>{t.label}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                          <span style={{ fontSize: '11px', color: '#9ca3af' }}>{formatDate(record.date)}</span>
                          <button onClick={() => handleDeleteRecord(record.id)} style={{ background: 'none', border: 'none', color: '#d1d5db', fontSize: '13px', cursor: 'pointer', padding: '2px', transition: 'color 0.15s', lineHeight: 1 }}
                            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'}
                            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = '#d1d5db'}
                          >✕</button>
                        </div>
                      </div>
                      <p style={{ fontSize: '15px', fontWeight: '600', color: t.color, margin: '4px 0' }}>{record.value}</p>
                      {record.note && <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0, lineHeight: '1.5' }}>{record.note}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}