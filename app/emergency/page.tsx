'use client';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function EmergencyPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push('/login');
  }, [user]);

  if (!user) return null;

  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="max-w-4xl mx-auto px-6 py-8">

        {/* Header Banner */}
        <div className="bg-red-600 text-white rounded-xl p-6 mb-6">
          <h1 className="text-2xl font-bold mb-1">🚨 ศูนย์ข้อมูลฉุกเฉิน</h1>
          <p className="text-red-100 text-sm">หากสัตว์เลี้ยงของคุณมีอาการฉุกเฉิน กรุณาติดต่อสัตวแพทย์ทันที อย่ารอ!</p>
        </div>

        {/* Emergency Contacts */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <h2 className="font-bold text-gray-900 text-lg mb-4">📞 เบอร์ติดต่อฉุกเฉิน</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'สายด่วนสัตวแพทย์', number: '1669', status: 'open', desc: '24 ชั่วโมง' },
              { name: 'คลินิกสัตว์ฉุกเฉิน', number: '02-123-4567', status: 'open', desc: 'เปิด 24 ชม.' },
              { name: 'โรงพยาบาลสัตว์จุฬา', number: '02-218-9740', status: 'busy', desc: 'จันทร์-ศุกร์ 8-20น.' },
              { name: 'โรงพยาบาลสัตว์กาสิกร', number: '02-579-7692', status: 'open', desc: 'เปิด 24 ชม.' },
            ].map((contact, i) => (
              <a
                key={i}
                href={`tel:${contact.number}`}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition"
              >
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{contact.name}</p>
                  <p className="text-gray-500 text-xs">{contact.desc}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-red-600">{contact.number}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full text-white ${
                    contact.status === 'open' ? 'bg-green-500' : 'bg-yellow-500'
                  }`}>
                    {contact.status === 'open' ? 'เปิดอยู่' : 'ยุ่ง'}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Emergency Symptoms */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <h2 className="font-bold text-gray-900 text-lg mb-4">⚠️ อาการที่ต้องไปหาสัตวแพทย์ทันที</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { icon: '🤢', text: 'กินสารพิษหรือยาเข้าไป', priority: 'critical' },
              { icon: '😵', text: 'ชักหรือหมดสติ', priority: 'critical' },
              { icon: '😮‍💨', text: 'หายใจลำบากหรือหอบ', priority: 'critical' },
              { icon: '🩸', text: 'เลือดออกไม่หยุด', priority: 'critical' },
              { icon: '🤕', text: 'ได้รับบาดเจ็บรุนแรง', priority: 'high' },
              { icon: '🌡️', text: 'ไข้สูงมากหรืออุณหภูมิต่ำผิดปกติ', priority: 'high' },
              { icon: '🚫', text: 'ไม่กินอาหารหรือน้ำเกิน 24 ชม.', priority: 'high' },
              { icon: '😿', text: 'เจ็บปวดรุนแรง ร้องไม่หยุด', priority: 'high' },
            ].map((symptom, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 p-3 rounded-lg border-l-4 ${
                  symptom.priority === 'critical'
                    ? 'bg-red-50 border-l-red-500'
                    : 'bg-yellow-50 border-l-yellow-500'
                }`}
              >
                <span className="text-xl">{symptom.icon}</span>
                <span className="text-sm text-gray-800">{symptom.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* First Aid Guide */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <h2 className="font-bold text-gray-900 text-lg mb-4">🩺 สิ่งที่ควรทำก่อนถึงสัตวแพทย์</h2>
          <div className="space-y-3">
            {[
              { step: '1', text: 'ตั้งสติ อย่าตื่นตกใจ สัตว์เลี้ยงจะรู้สึกได้ถึงความตื่นตระหนก' },
              { step: '2', text: 'โทรแจ้งสัตวแพทย์ก่อนเดินทาง เพื่อให้เตรียมพร้อมรับ' },
              { step: '3', text: 'อย่าให้อาหารหรือน้ำ ถ้าสัตว์มีอาการอาเจียนหรือชัก' },
              { step: '4', text: 'ห่อตัวด้วยผ้านุ่มๆ เพื่อให้อบอุ่นและลดการดิ้น' },
              { step: '5', text: 'เดินทางให้เร็วที่สุด ทุกนาทีมีความสำคัญ' },
            ].map((guide, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-7 h-7 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {guide.step}
                </div>
                <p className="text-sm text-gray-700 pt-1">{guide.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-red-600 text-white rounded-xl p-6 text-center">
          <p className="font-bold text-lg mb-2">หากไม่แน่ใจ ให้ไปหาสัตวแพทย์ทันที</p>
          <p className="text-red-100 text-sm mb-4">ดีกว่ารอจนอาการหนักขึ้น</p>
          <a
            href="tel:1669"
            className="bg-white text-red-600 font-bold px-8 py-3 rounded-lg inline-block hover:bg-red-50 transition"
          >
            📞 โทร 1669 ทันที
          </a>
        </div>

      </main>
    </div>
  );
}