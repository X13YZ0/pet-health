'use client';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push('/login');
  }, [user]);

  if (!user) return null;

  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Left Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">📊 สถิติล่าสุด</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-teal-50 rounded-lg">
                  <span className="text-sm text-gray-600">คำถามวันนี้</span>
                  <span className="font-semibold text-teal-700">47</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm text-gray-600">AI ตอบแล้ว</span>
                  <span className="font-semibold text-blue-700">89%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm text-gray-600">ผู้ใช้ออนไลน์</span>
                  <span className="font-semibold text-green-700">1.2K</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 border-l-4 border-l-red-500">
              <h3 className="font-semibold text-red-700 mb-4">🚨 ติดต่อฉุกเฉิน</h3>
              <div className="space-y-3">
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="font-semibold text-red-900">สัตวแพทย์ฉุกเฉิน</p>
                  <p className="text-red-700 font-mono text-lg">1669</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="font-semibold text-red-900">คลินิก 24 ชม.</p>
                  <p className="text-red-700 font-mono">02-123-4567</p>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Feed */}
          <section className="lg:col-span-2 space-y-6">

            {/* Create Post Box */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex gap-4">
                <div className="w-9 h-9 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <textarea
                    placeholder="แบ่งปันประสบการณ์หรือถามคำถามเกี่ยวกับสัตว์เลี้ยง..."
                    className="w-full border-0 resize-none focus:outline-none text-sm placeholder-gray-400 min-h-[80px] bg-transparent"
                    rows={3}
                  />
                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                    <div className="flex gap-2">
                      <button className="p-2 text-gray-400 hover:text-teal-600 rounded-lg text-sm">📷 รูปภาพ</button>
                      <button className="p-2 text-gray-400 hover:text-teal-600 rounded-lg text-sm">😊 อิโมจิ</button>
                    </div>
                    <button
                      onClick={() => router.push('/community')}
                      className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700"
                    >
                      โพสต์
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sample Post 1 */}
            <article className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex gap-4">
                <div className="w-9 h-9 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">ม</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <h4 className="font-semibold text-gray-900">คุณมาลี รักสัตว์</h4>
                    <span className="text-sm text-gray-400">· 2 ชั่วโมงที่แล้ว</span>
                  </div>
                  <p className="text-gray-800 mb-3">ลูกแมวอายุ 2 เดือนเริ่มกินอาหารแข็งได้แล้ว! 🐱 มีคำแนะนำเรื่องอาหารลูกแมวไหมคะ?</p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">AI</div>
                      <span className="font-semibold text-sm text-gray-900">Pet AI Assistant</span>
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">✅ ยืนยันแล้ว</span>
                    </div>
                    <p className="text-gray-700 text-sm mb-2">ลูกแมวอายุ 2 เดือนควรได้รับอาหารสำหรับลูกแมวโดยเฉพาะที่มีโปรตีนสูง 30-35%</p>
                    <p className="text-xs text-blue-600">📚 อ้างอิง: PetMD, VCA Hospitals, International Cat Care</p>
                  </div>
                  <div className="flex items-center gap-6 pt-3 border-t border-gray-100">
                    <button className="flex items-center gap-1 text-gray-500 hover:text-teal-600 text-sm">💬 24</button>
                    <button className="flex items-center gap-1 text-gray-500 hover:text-red-500 text-sm">❤️ 127</button>
                  </div>
                </div>
              </div>
            </article>

            {/* Sample Post 2: Emergency */}
            <article className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex gap-4">
                <div className="w-9 h-9 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">ส</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <h4 className="font-semibold text-gray-900">คุณสมชาย ใจดี</h4>
                    <span className="text-sm text-gray-400">· 15 นาทีที่แล้ว</span>
                  </div>
                  <p className="text-gray-800 mb-3">สุนัขกินยาเบื่อเข้าไป!!! ตอนนี้มีอาการชักด้วย ทำไงดีครับ? 🆘</p>
                  <div className="bg-red-50 border border-red-300 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">⚠️</span>
                      <h5 className="font-bold text-red-900">ระบบตรวจจับเหตุฉุกเฉิน</h5>
                    </div>
                    <p className="text-red-800 text-sm mb-4">นี่คือภาวะฉุกเฉิน! ต้องการการช่วยเหลือทางการแพทย์ทันที</p>
                    <div className="grid grid-cols-2 gap-3">
                      <a href="tel:1669" className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium text-center hover:bg-red-600">📞 โทรฉุกเฉิน</a>
                      <button onClick={() => router.push('/emergency')} className="bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-800">🗺️ ข้อมูลฉุกเฉิน</button>
                    </div>
                  </div>
                </div>
              </div>
            </article>

          </section>

          {/* Right Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">🤖 ถาม Pet AI ด่วน</h3>
              <div className="space-y-2">
                {[
                  { icon: '🚫', text: 'สุนัขกินอะไรไม่ได้บ้าง?' },
                  { icon: '😿', text: 'แมวเครียดมีอาการอย่างไร?' },
                  { icon: '💉', text: 'ตารางวัคซีนสัตว์เลี้ยง' },
                  { icon: '🦴', text: 'อาหารที่เหมาะกับสัตว์อายุมาก' },
                  { icon: '🛁', text: 'วิธีการอาบน้ำสัตว์เลี้ยงที่ถูกต้อง' },
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={() => router.push('/chat')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg text-left"
                  >
                    <span>{item.icon}</span>
                    <span>{item.text}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">🔥 เทรนด์</h3>
              <div className="space-y-3">
                {[
                  { tag: '#แมวไม่กินข้าว', count: '2.3K การสนทนา' },
                  { tag: '#สุนัขท้องเสีย', count: '1.8K การสนทนา' },
                  { tag: '#ดูแลสัตว์วัยทอง', count: '945 การสนทนา' },
                ].map((item, i) => (
                  <div key={i} className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <p className="font-semibold text-sm text-gray-900">{item.tag}</p>
                    <p className="text-xs text-gray-500">{item.count}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>

        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center">
          <p className="text-sm text-gray-500">© 2024 Pet Health. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}