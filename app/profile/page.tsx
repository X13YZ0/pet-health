'use client';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

interface Post {
  id: string;
  content: string;
  petType: string;
  createdAt: any;
  likes: string[];
}

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchMyPosts();
  }, [user]);

  const fetchMyPosts = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, 'posts'),
        where('authorEmail', '==', user.email),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      setPosts(snapshot.docs.map(d => ({ id: d.id, likes: [], ...d.data() })) as unknown as Post[]);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleDelete = async (postId: string) => {
    await deleteDoc(doc(db, 'posts', postId));
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  const timeAgo = (ts: any) => {
    if (!ts?.toDate) return 'เมื่อกี้';
    const s = Math.floor((Date.now() - ts.toDate()) / 1000);
    if (s < 60) return 'เมื่อกี้';
    if (s < 3600) return `${Math.floor(s / 60)} นาทีที่แล้ว`;
    if (s < 86400) return `${Math.floor(s / 3600)} ชั่วโมงที่แล้ว`;
    return `${Math.floor(s / 86400)} วันที่แล้ว`;
  };

  if (!user) return (
    <div style={{ textAlign: 'center', padding: '80px 24px', fontFamily: 'system-ui, sans-serif' }}>
      <p style={{ color: '#9ca3af', marginBottom: '16px' }}>กรุณาเข้าสู่ระบบก่อน</p>
      <a href="/login" style={{ background: '#0d9488', color: 'white', padding: '8px 20px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px' }}>เข้าสู่ระบบ</a>
    </div>
  );

  const dogCount = posts.filter(p => p.petType === 'dog').length;
  const catCount = posts.filter(p => p.petType === 'cat').length;
  const otherCount = posts.filter(p => p.petType === 'other').length;

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif' }}>
      <main style={{ maxWidth: '600px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Profile Card */}
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '24px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#0d9488', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: '700', flexShrink: 0 }}>
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: '0 0 3px', letterSpacing: '-0.02em' }}>
                {user.displayName || user.email?.split('@')[0]}
              </h1>
              <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>{user.email}</p>
            </div>
            <button
              onClick={() => { signOut(auth); router.push('/'); }}
              style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', background: 'white', color: '#9ca3af', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
            >
              ออกจากระบบ
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', paddingTop: '20px', borderTop: '1px solid #f3f4f6' }}>
            {[
              { label: 'โพสต์ทั้งหมด', value: posts.length, color: '#0d9488' },
              { label: '🐶 สุนัข', value: dogCount, color: '#f59e0b' },
              { label: '🐱 แมว', value: catCount, color: '#8b5cf6' },
              { label: '🐾 อื่นๆ', value: otherCount, color: '#6b7280' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '12px 8px', borderRadius: '10px', background: '#f9fafb' }}>
                <p style={{ fontSize: '20px', fontWeight: '700', color: s.color, margin: '0 0 4px' }}>{s.value}</p>
                <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Posts */}
        <div>
          <h2 style={{ fontSize: '14px', fontWeight: '700', color: '#111827', margin: '0 0 14px', letterSpacing: '-0.01em' }}>
            โพสต์ของฉัน
          </h2>

          {loading && (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af', fontSize: '14px' }}>กำลังโหลด...</div>
          )}

          {!loading && posts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 24px', background: 'white', borderRadius: '14px', border: '1px solid #e5e7eb' }}>
              <p style={{ fontSize: '32px', margin: '0 0 8px' }}>🐾</p>
              <p style={{ color: '#9ca3af', fontSize: '14px', margin: '0 0 16px' }}>ยังไม่มีโพสต์</p>
              <a href="/community" style={{ background: '#0d9488', color: 'white', padding: '8px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', textDecoration: 'none' }}>
                ไปโพสต์เลย
              </a>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {posts.map(post => (
              <article key={post.id} style={{ background: 'white', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '14px' }}>
                        {post.petType === 'dog' ? '🐶' : post.petType === 'cat' ? '🐱' : '🐾'}
                      </span>
                      <span style={{ fontSize: '12px', color: '#9ca3af' }}>{timeAgo(post.createdAt)}</span>
                      {post.likes?.length > 0 && (
                        <span style={{ fontSize: '12px', color: '#9ca3af' }}>· ❤️ {post.likes.length}</span>
                      )}
                    </div>
                    <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', margin: 0 }}>{post.content}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(post.id)}
                    style={{ padding: '4px 8px', borderRadius: '6px', border: 'none', background: 'transparent', color: '#d1d5db', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0, transition: 'all 0.15s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'}
                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = '#d1d5db'}
                  >
                    ลบ
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}