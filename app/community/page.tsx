'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import {
  collection, addDoc, getDocs, deleteDoc,
  doc, orderBy, query, serverTimestamp,
  updateDoc, arrayUnion, arrayRemove,
} from 'firebase/firestore';

interface Post {
  id: string;
  content: string;
  authorEmail: string;
  petType: string;
  createdAt: any;
  likes: string[];
}

export default function CommunityPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState('');
  const [petType, setPetType] = useState('dog');
  const [posting, setPosting] = useState(false);
  const [filter, setFilter] = useState('all');
  const [fetching, setFetching] = useState(true);

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
  setFetching(true);
  try {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);

    const posts: Post[] = snap.docs.map((d) => {
      const data = d.data();

      return {
        id: d.id,
        content: data.content,
        authorEmail: data.authorEmail,
        petType: data.petType,
        createdAt: data.createdAt,
        likes: data.likes ?? []
      };
    });

    setPosts(posts);
  } catch (e) {
    console.error(e);
  }
  setFetching(false);
};

  const handlePost = async () => {
    if (!user) { router.push('/login'); return; }
    if (!content.trim()) return;
    setPosting(true);
    try {
      await addDoc(collection(db, 'posts'), {
        content: content.trim(),
        petType,
        authorEmail: user.email,
        createdAt: serverTimestamp(),
        likes: [],
      });
      setContent('');
      await fetchPosts();
    } catch (e) { console.error(e); }
    setPosting(false);
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'posts', id));
    setPosts(p => p.filter(x => x.id !== id));
  };

  const handleLike = async (post: Post) => {
    if (!user) { router.push('/login'); return; }
    const ref = doc(db, 'posts', post.id);
    const liked = post.likes?.includes(user.email!);
    await updateDoc(ref, {
      likes: liked ? arrayRemove(user.email) : arrayUnion(user.email),
    });
    setPosts(p => p.map(x => x.id !== post.id ? x : {
      ...x,
      likes: liked ? x.likes.filter(e => e !== user.email) : [...(x.likes || []), user.email!],
    }));
  };

  const timeAgo = (ts: any) => {
    if (!ts?.toDate) return 'เมื่อกี้';
    const s = Math.floor((Date.now() - ts.toDate()) / 1000);
    if (s < 60) return 'เมื่อกี้';
    if (s < 3600) return `${Math.floor(s / 60)} นาทีที่แล้ว`;
    if (s < 86400) return `${Math.floor(s / 3600)} ชั่วโมงที่แล้ว`;
    return `${Math.floor(s / 86400)} วันที่แล้ว`;
  };

  const filtered = filter === 'all' ? posts : posts.filter(p => p.petType === filter);
  const filters = [
    { value: 'all', label: 'ทั้งหมด' },
    { value: 'dog', label: '🐶 สุนัข' },
    { value: 'cat', label: '🐱 แมว' },
    { value: 'other', label: '🐾 อื่นๆ' },
  ];

  return (
    <div style={{background: '#f9fafb', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'}}>
      <main style={{maxWidth: '640px', margin: '0 auto', padding: '32px 24px'}}>

        {/* Header */}
        <div style={{marginBottom: '24px'}}>
          <h1 style={{fontSize: '22px', fontWeight: '700', color: '#111827', letterSpacing: '-0.03em', margin: '0 0 4px'}}>ชุมชน</h1>
          <p style={{fontSize: '14px', color: '#9ca3af', margin: 0}}>แชร์ประสบการณ์และถามตอบเรื่องสัตว์เลี้ยง</p>
        </div>

        {/* Create Post */}
        <div style={{background: 'white', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '16px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)'}}>
          {user ? (
            <>
              <div style={{display: 'flex', gap: '12px'}}>
                <div style={{width: '34px', height: '34px', borderRadius: '50%', background: '#0d9488', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '13px', flexShrink: 0}}>
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="แบ่งปันประสบการณ์หรือถามคำถาม..."
                  rows={3}
                  style={{flex: 1, border: 'none', outline: 'none', fontSize: '14px', color: '#111827', resize: 'none', fontFamily: 'inherit', lineHeight: '1.6', background: 'transparent'}}
                />
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f3f4f6'}}>
                <select value={petType} onChange={e => setPetType(e.target.value)}
                  style={{border: '1px solid #e5e7eb', borderRadius: '8px', padding: '6px 10px', fontSize: '13px', color: '#374151', background: 'white', outline: 'none', fontFamily: 'inherit', cursor: 'pointer'}}>
                  <option value="dog">🐶 สุนัข</option>
                  <option value="cat">🐱 แมว</option>
                  <option value="other">🐾 อื่นๆ</option>
                </select>
                <button onClick={handlePost} disabled={posting || !content.trim()}
                  style={{background: posting || !content.trim() ? '#e5e7eb' : '#0d9488', color: posting || !content.trim() ? '#9ca3af' : 'white', border: 'none', borderRadius: '8px', padding: '7px 18px', fontSize: '13px', fontWeight: '600', cursor: posting || !content.trim() ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'all 0.15s'}}>
                  {posting ? 'กำลังโพสต์...' : 'โพสต์'}
                </button>
              </div>
            </>
          ) : (
            <div style={{textAlign: 'center', padding: '8px 0'}}>
              <p style={{color: '#9ca3af', fontSize: '14px', margin: '0 0 12px'}}>เข้าสู่ระบบเพื่อโพสต์</p>
              <a href="/login" style={{background: '#0d9488', color: 'white', padding: '8px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', textDecoration: 'none'}}>เข้าสู่ระบบ</a>
            </div>
          )}
        </div>

        {/* Filters */}
        <div style={{display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap'}}>
          {filters.map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              style={{padding: '5px 14px', borderRadius: '999px', border: '1px solid', borderColor: filter === f.value ? '#0d9488' : '#e5e7eb', background: filter === f.value ? '#f0fdfa' : 'white', color: filter === f.value ? '#0d9488' : '#6b7280', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s'}}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Posts */}
        {fetching ? (
          <div style={{textAlign: 'center', padding: '48px 0', color: '#9ca3af', fontSize: '14px'}}>กำลังโหลด...</div>
        ) : filtered.length === 0 ? (
          <div style={{textAlign: 'center', padding: '48px 0', background: 'white', borderRadius: '14px', border: '1px solid #e5e7eb'}}>
            <p style={{fontSize: '32px', margin: '0 0 8px'}}>🐾</p>
            <p style={{color: '#9ca3af', fontSize: '14px', margin: 0}}>ยังไม่มีโพสต์ในหมวดนี้</p>
          </div>
        ) : (
          <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
            {filtered.map(post => {
              const liked = user ? post.likes?.includes(user.email!) : false;
              const petIcon = post.petType === 'dog' ? '🐶' : post.petType === 'cat' ? '🐱' : '🐾';
              return (
                <article key={post.id} style={{background: 'white', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)'}}>
                  <div style={{display: 'flex', gap: '12px'}}>
                    <div style={{width: '34px', height: '34px', borderRadius: '50%', background: '#0d9488', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '13px', flexShrink: 0}}>
                      {post.authorEmail?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{flex: 1, minWidth: 0}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px'}}>
                        <div>
                          <span style={{fontSize: '13px', fontWeight: '600', color: '#111827'}}>{post.authorEmail}</span>
                          <span style={{fontSize: '12px', color: '#9ca3af', marginLeft: '6px'}}>· {timeAgo(post.createdAt)}</span>
                        </div>
                        <span style={{fontSize: '15px'}}>{petIcon}</span>
                      </div>
                      <p style={{fontSize: '14px', color: '#374151', lineHeight: '1.6', margin: '0 0 10px'}}>{post.content}</p>
                      <div style={{display: 'flex', alignItems: 'center', gap: '4px', paddingTop: '8px', borderTop: '1px solid #f3f4f6'}}>
                        <button onClick={() => handleLike(post)}
                          style={{display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: liked ? '#fef2f2' : 'transparent', color: liked ? '#ef4444' : '#9ca3af', fontSize: '13px', fontWeight: '500', fontFamily: 'inherit', transition: 'all 0.15s'}}>
                          {liked ? '❤️' : '🤍'} {post.likes?.length || 0}
                        </button>
                        {user && post.authorEmail === user.email && (
                          <button onClick={() => handleDelete(post.id)}
                            style={{marginLeft: 'auto', padding: '4px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: 'transparent', color: '#d1d5db', fontSize: '12px', fontFamily: 'inherit', transition: 'all 0.15s'}}>
                            ลบ
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}