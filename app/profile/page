'use client';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { db, auth } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  deleteDoc,
  doc,
  updateDoc
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';

interface Post {
  id: string;
  content: string;
  petType: string;
  createdAt: any;
  likes: string[];
  edited?: boolean;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

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

      setPosts(
        snapshot.docs.map(d => ({
          id: d.id,
          likes: [],
          ...d.data()
        })) as unknown as Post[]
      );
    } catch (e) {
      console.error(e);
    }

    setLoading(false);
  };

  const handleDelete = async (postId: string) => {
    await deleteDoc(doc(db, 'posts', postId));
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  const startEdit = (post: Post) => {
    setEditingId(post.id);
    setEditContent(post.content);
  };

  const saveEdit = async (postId: string) => {
    if (!editContent.trim()) return;

    await updateDoc(doc(db, 'posts', postId), {
      content: editContent,
      edited: true
    });

    setPosts(prev =>
      prev.map(p =>
        p.id === postId
          ? { ...p, content: editContent, edited: true }
          : p
      )
    );

    setEditingId(null);
  };

  const timeAgo = (ts: any) => {
    if (!ts?.toDate) return 'เมื่อกี้';

    const s = Math.floor((Date.now() - ts.toDate()) / 1000);

    if (s < 60) return 'เมื่อกี้';
    if (s < 3600) return `${Math.floor(s / 60)} นาทีที่แล้ว`;
    if (s < 86400) return `${Math.floor(s / 3600)} ชั่วโมงที่แล้ว`;

    return `${Math.floor(s / 86400)} วันที่แล้ว`;
  };

  if (!user)
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px', fontFamily: 'system-ui' }}>
        <p style={{ color: '#9ca3af', marginBottom: '16px' }}>กรุณาเข้าสู่ระบบก่อน</p>
        <a
          href="/login"
          style={{
            background: '#0d9488',
            color: 'white',
            padding: '8px 20px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '14px'
          }}
        >
          เข้าสู่ระบบ
        </a>
      </div>
    );

  const dogCount = posts.filter(p => p.petType === 'dog').length;
  const catCount = posts.filter(p => p.petType === 'cat').length;
  const otherCount = posts.filter(p => p.petType === 'other').length;

  return (
    <div
      style={{
        background: '#f9fafb',
        minHeight: '100vh',
        fontFamily: 'system-ui'
      }}
    >
      <main style={{ maxWidth: '600px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Profile */}
        <div
          style={{
            background: 'white',
            borderRadius: '16px',
            border: '1px solid #e5e7eb',
            padding: '24px',
            marginBottom: '20px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: '#0d9488',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                fontWeight: '700'
              }}
            >
              {user.email?.charAt(0).toUpperCase()}
            </div>

            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 3px' }}>
                {user.displayName || user.email?.split('@')[0]}
              </h1>

              <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>
                {user.email}
              </p>
            </div>

            <button
              onClick={() => {
                signOut(auth);
                router.push('/');
              }}
              style={{
                padding: '7px 14px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                background: 'white',
                color: '#9ca3af',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              ออกจากระบบ
            </button>
          </div>

          {/* Stats */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '8px',
              paddingTop: '20px',
              borderTop: '1px solid #f3f4f6'
            }}
          >
            {[
              { label: 'โพสต์ทั้งหมด', value: posts.length, color: '#0d9488' },
              { label: '🐶 สุนัข', value: dogCount, color: '#f59e0b' },
              { label: '🐱 แมว', value: catCount, color: '#8b5cf6' },
              { label: '🐾 อื่นๆ', value: otherCount, color: '#6b7280' }
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '12px 8px', borderRadius: '10px', background: '#f9fafb' }}>
                <p style={{ fontSize: '20px', fontWeight: '700', color: s.color, margin: '0 0 4px' }}>{s.value}</p>
                <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Posts */}
        <h2 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '14px' }}>
          โพสต์ของฉัน
        </h2>

        {loading && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>
            กำลังโหลด...
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {posts.map(post => (
            <article
              key={post.id}
              style={{
                background: 'white',
                borderRadius: '14px',
                border: '1px solid #e5e7eb',
                padding: '16px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ flex: 1 }}>

                  <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                    <span>
                      {post.petType === 'dog'
                        ? '🐶'
                        : post.petType === 'cat'
                        ? '🐱'
                        : '🐾'}
                    </span>

                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                      {timeAgo(post.createdAt)}
                    </span>

                    {post.edited && (
                      <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                        • แก้ไขแล้ว
                      </span>
                    )}

                    {post.likes?.length > 0 && (
                      <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                        ❤️ {post.likes.length}
                      </span>
                    )}
                  </div>

                  {editingId === post.id ? (
                    <>
                      <textarea
                        value={editContent}
                        onChange={e => setEditContent(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          fontSize: '14px',
                          marginBottom: '8px'
                        }}
                      />

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => saveEdit(post.id)}>บันทึก</button>
                        <button onClick={() => setEditingId(null)}>ยกเลิก</button>
                      </div>
                    </>
                  ) : (
                    <p style={{ fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
                      {post.content}
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <button
                    onClick={() => startEdit(post)}
                    style={{
                      fontSize: '12px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#9ca3af'
                    }}
                  >
                    แก้ไข
                  </button>

                  <button
                    onClick={() => handleDelete(post.id)}
                    style={{
                      fontSize: '12px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#ef4444'
                    }}
                  >
                    ลบ
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

      </main>
    </div>
  );
}
