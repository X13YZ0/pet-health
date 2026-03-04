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
  const MAX_CHARS = 500;

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    setFetching(true);
    try {
      const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const data: Post[] = snap.docs.map((d) => {
        const raw = d.data();
        return {
          id: d.id,
          content: raw.content,
          authorEmail: raw.authorEmail,
          petType: raw.petType,
          createdAt: raw.createdAt,
          likes: raw.likes ?? [],
        };
      });
      setPosts(data);
    } catch (e) { console.error(e); }
    setFetching(false);
  };

  const handlePost = async () => {
    if (!user) { router.push('/login'); return; }
    if (!content.trim()) return;
    setPosting(true);
    try {
      await addDoc(collection(db, 'posts'), {
        content: content.trim(), petType,
        authorEmail: user.email,
        createdAt: serverTimestamp(),
        likes: [],
      });
      setContent('');
      await fetchPosts();
    } catch (e) { console.error(e); }
    setPosting(false);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // ไม่ให้ navigate ไป detail
    await deleteDoc(doc(db, 'posts', id));
    setPosts(p => p.filter(x => x.id !== id));
  };

  const handleLike = async (e: React.MouseEvent, post: Post) => {
    e.stopPropagation(); // ไม่ให้ navigate ไป detail
    if (!user) { router.push('/login'); return; }
    const ref = doc(db, 'posts', post.id);
    const liked = post.likes?.includes(user.email!);
    await updateDoc(ref, {
      likes: liked ? arrayRemove(user.email) : arrayUnion(user.email),
    });
    setPosts(p => p.map(x => x.id !== post.id ? x : {
      ...x,
      likes: liked
        ? x.likes.filter(e => e !== user.email)
        : [...(x.likes || []), user.email!],
    }));
  };

  const timeAgo = (ts: any) => {
    if (!ts?.toDate) return 'เมื่อกี้';
    const s = Math.floor((Date.now() - ts.toDate()) / 1000);
    if (s < 60) return 'เมื่อกี้';
    if (s < 3600) return `${Math.floor(s / 60)} นาทีที่แล้ว`;
    if (s < 86400) return `${Math.floor(s / 3600)} ชม.ที่แล้ว`;
    return `${Math.floor(s / 86400)} วันที่แล้ว`;
  };

  const petLabel = (type: string) => {
    if (type === 'dog') return { icon: '🐶', label: 'สุนัข', bg: '#fef9c3', color: '#a16207' };
    if (type === 'cat') return { icon: '🐱', label: 'แมว', bg: '#f3e8ff', color: '#7e22ce' };
    return { icon: '🐾', label: 'อื่นๆ', bg: '#f1f5f9', color: '#475569' };
  };

  const avatarColor = (email: string) => {
    const colors = ['#0d9488', '#7c3aed', '#db2777', '#2563eb', '#d97706', '#059669'];
    return colors[email.charCodeAt(0) % colors.length];
  };

  const filtered = filter === 'all' ? posts : posts.filter(p => p.petType === filter);
  const filterTabs = [
    { value: 'all', label: 'ทั้งหมด', count: posts.length },
    { value: 'dog', label: '🐶 สุนัข', count: posts.filter(p => p.petType === 'dog').length },
    { value: 'cat', label: '🐱 แมว', count: posts.filter(p => p.petType === 'cat').length },
    { value: 'other', label: '🐾 อื่นๆ', count: posts.filter(p => p.petType === 'other').length },
  ];

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif' }}>
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', alignItems: 'start' }}>

          {/* ===== LEFT: Main Feed ===== */}
          <div>
            <div style={{ marginBottom: '20px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', letterSpacing: '-0.03em', margin: '0 0 4px' }}>ชุมชน</h1>
              <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>แชร์ประสบการณ์และถามตอบเรื่องสัตว์เลี้ยง</p>
            </div>

            {/* Create Post */}
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '20px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              {user ? (
                <>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: avatarColor(user.email || ''), color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px', flexShrink: 0 }}>
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <textarea
                        value={content}
                        onChange={e => { if (e.target.value.length <= MAX_CHARS) setContent(e.target.value); }}
                        placeholder="แบ่งปันประสบการณ์หรือถามคำถามเกี่ยวกับสัตว์เลี้ยง..."
                        rows={3}
                        style={{ width: '100%', border: 'none', outline: 'none', fontSize: '14px', color: '#111827', resize: 'none', fontFamily: 'inherit', lineHeight: '1.6', background: 'transparent', boxSizing: 'border-box' }}
                      />
                      {content.length > 0 && (
                        <p style={{ fontSize: '11px', textAlign: 'right', margin: '2px 0 0', color: content.length > MAX_CHARS * 0.9 ? '#ef4444' : '#9ca3af' }}>
                          {content.length}/{MAX_CHARS}
                        </p>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #f3f4f6' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {[
                        { value: 'dog', icon: '🐶', label: 'สุนัข' },
                        { value: 'cat', icon: '🐱', label: 'แมว' },
                        { value: 'other', icon: '🐾', label: 'อื่นๆ' },
                      ].map(pt => (
                        <button key={pt.value} onClick={() => setPetType(pt.value)} style={{
                          padding: '5px 12px', borderRadius: '999px', border: '1px solid',
                          borderColor: petType === pt.value ? '#0d9488' : '#e5e7eb',
                          background: petType === pt.value ? '#f0fdfa' : 'white',
                          color: petType === pt.value ? '#0d9488' : '#6b7280',
                          fontSize: '12px', fontWeight: '500', cursor: 'pointer',
                          fontFamily: 'inherit', transition: 'all 0.15s',
                        }}>
                          {pt.icon} {pt.label}
                        </button>
                      ))}
                    </div>
                    <button onClick={handlePost} disabled={posting || !content.trim()} style={{
                      background: posting || !content.trim() ? '#e5e7eb' : '#0d9488',
                      color: posting || !content.trim() ? '#9ca3af' : 'white',
                      border: 'none', borderRadius: '9px', padding: '8px 20px',
                      fontSize: '13px', fontWeight: '600',
                      cursor: posting || !content.trim() ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit', transition: 'all 0.15s',
                    }}>
                      {posting ? 'กำลังโพสต์...' : 'โพสต์'}
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>🐾</div>
                  <button onClick={() => router.push('/login')} style={{ flex: 1, padding: '10px 16px', borderRadius: '999px', border: '1.5px solid #e5e7eb', background: '#f9fafb', color: '#9ca3af', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
                    เข้าสู่ระบบเพื่อแบ่งปันประสบการณ์...
                  </button>
                  <a href="/login" style={{ padding: '8px 18px', borderRadius: '9px', background: '#0d9488', color: 'white', fontSize: '13px', fontWeight: '600', textDecoration: 'none', flexShrink: 0 }}>
                    เข้าสู่ระบบ
                  </a>
                </div>
              )}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {filterTabs.map(f => (
                <button key={f.value} onClick={() => setFilter(f.value)} style={{
                  padding: '6px 14px', borderRadius: '999px', border: '1px solid',
                  borderColor: filter === f.value ? '#0d9488' : '#e5e7eb',
                  background: filter === f.value ? '#f0fdfa' : 'white',
                  color: filter === f.value ? '#0d9488' : '#6b7280',
                  fontSize: '13px', fontWeight: '500', cursor: 'pointer',
                  fontFamily: 'inherit', transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: '5px',
                }}>
                  {f.label}
                  <span style={{ fontSize: '11px', padding: '1px 6px', borderRadius: '999px', background: filter === f.value ? '#0d9488' : '#f3f4f6', color: filter === f.value ? 'white' : '#9ca3af', fontWeight: '600' }}>
                    {f.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Posts */}
            {fetching ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af', fontSize: '14px' }}>กำลังโหลด...</div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 24px', background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
                <p style={{ fontSize: '32px', margin: '0 0 8px' }}>🐾</p>
                <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>ยังไม่มีโพสต์ในหมวดนี้</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filtered.map(post => {
                  const liked = user ? post.likes?.includes(user.email!) : false;
                  const pet = petLabel(post.petType);
                  const isOwner = user && post.authorEmail === user.email;
                  return (
                    <article
                      key={post.id}
                      onClick={() => router.push(`/community/${post.id}`)}
                      style={{
                        background: 'white', borderRadius: '16px',
                        border: '1px solid #e5e7eb', padding: '18px 20px',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                        cursor: 'pointer', transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
                        (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)';
                        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                      }}
                    >
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: avatarColor(post.authorEmail), color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px', flexShrink: 0 }}>
                          {post.authorEmail?.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', gap: '8px' }}>
                            <div>
                              <span style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>
                                {post.authorEmail?.split('@')[0]}
                              </span>
                              <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: '6px' }}>· {timeAgo(post.createdAt)}</span>
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 9px', borderRadius: '999px', background: pet.bg, color: pet.color, flexShrink: 0 }}>
                              {pet.icon} {pet.label}
                            </span>
                          </div>

                          <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.65', margin: '0 0 12px', wordBreak: 'break-word',
                            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                          }}>
                            {post.content}
                          </p>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', paddingTop: '10px', borderTop: '1px solid #f9fafb' }}>
                            <button
                              onClick={e => handleLike(e, post)}
                              style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '7px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: liked ? '#fef2f2' : 'transparent', color: liked ? '#ef4444' : '#9ca3af', fontSize: '13px', fontWeight: '500', transition: 'all 0.15s' }}
                            >
                              {liked ? '❤️' : '🤍'} {post.likes?.length || 0}
                            </button>

                            {/* Comment count hint */}
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', color: '#9ca3af', fontSize: '13px' }}>
                              💬 ดูความคิดเห็น
                            </span>

                            {isOwner && (
                              <button
                                onClick={e => handleDelete(e, post.id)}
                                style={{ marginLeft: 'auto', padding: '5px 10px', borderRadius: '7px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: 'transparent', color: '#d1d5db', fontSize: '12px', transition: 'all 0.15s' }}
                                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'}
                                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = '#d1d5db'}
                              >
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
          </div>

          {/* ===== RIGHT: Sidebar ===== */}
          <aside style={{ position: 'sticky', top: '72px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '18px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#111827', margin: '0 0 14px' }}>📊 สถิติชุมชน</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { label: 'โพสต์ทั้งหมด', value: posts.length, color: '#0d9488' },
                  { label: '🐶 สุนัข', value: posts.filter(p => p.petType === 'dog').length, color: '#d97706' },
                  { label: '🐱 แมว', value: posts.filter(p => p.petType === 'cat').length, color: '#7c3aed' },
                ].map((s, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: '8px', background: '#f9fafb' }}>
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>{s.label}</span>
                    <span style={{ fontSize: '15px', fontWeight: '700', color: s.color }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '18px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#111827', margin: '0 0 4px' }}>🤖 ไม่แน่ใจ? ถาม AI</h3>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 12px', lineHeight: '1.5' }}>ตอบพร้อม citation จากแหล่งน่าเชื่อถือ</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {['สุนัขกินองุ่นได้ไหม?', 'แมวควรฉีดวัคซีนอะไร?', 'อาหารห้ามให้สุนัข', 'วิธีดูแลลูกแมวแรกเกิด'].map((q, i) => (
                  <button key={i} onClick={() => router.push('/chat')} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#f9fafb', color: '#374151', fontSize: '12px', fontWeight: '500', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'all 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f0fdfa'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#99f6e4'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f9fafb'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#e5e7eb'; }}
                  >{q} →</button>
                ))}
              </div>
            </div>

            <div style={{ background: '#fef2f2', borderRadius: '14px', border: '1px solid #fecaca', padding: '18px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#991b1b', margin: '0 0 10px' }}>🚨 ฉุกเฉิน?</h3>
              <a href="tel:1669" style={{ display: 'block', textAlign: 'center', background: '#ef4444', color: 'white', padding: '10px', borderRadius: '9px', textDecoration: 'none', fontSize: '14px', fontWeight: '700', marginBottom: '8px' }}>
                📞 โทร 1669
              </a>
              <a href="/emergency" style={{ display: 'block', textAlign: 'center', color: '#dc2626', fontSize: '12px', textDecoration: 'none', fontWeight: '500' }}>
                ดูข้อมูลฉุกเฉินเพิ่มเติม →
              </a>
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
}