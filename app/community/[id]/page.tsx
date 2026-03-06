'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import {
  doc, getDoc, collection, addDoc, getDocs,
  deleteDoc, orderBy, query, serverTimestamp,
  updateDoc, arrayUnion, arrayRemove, increment,
  runTransaction,
} from 'firebase/firestore';

interface Post {
  id: string;
  content: string;
  authorEmail: string;
  petType: string;
  createdAt: any;
  likes: string[];
  commentCount: number;
}

interface Comment {
  id: string;
  content: string;
  authorEmail: string;
  createdAt: any;
  updatedAt?: any;   // เพิ่มตรงนี้
}

export default function PostDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loadingPost, setLoadingPost] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);
  const [posting, setPosting] = useState(false);

  // state สำหรับแก้ไขความคิดเห็น
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [postId]);

  const fetchPost = async () => {
    try {
      const ref = doc(db, 'posts', postId);
      const snap = await getDoc(ref);
      if (!snap.exists()) { router.push('/community'); return; }
      const raw = snap.data();
      setPost({
        id: snap.id,
        content: raw.content,
        authorEmail: raw.authorEmail,
        petType: raw.petType,
        createdAt: raw.createdAt,
        likes: raw.likes ?? [],
        commentCount: raw.commentCount ?? 0,
      });
    } catch (e) { console.error(e); }
    setLoadingPost(false);
  };

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const q = query(
        collection(db, 'posts', postId, 'comments'),
        orderBy('createdAt', 'asc')
      );
      const snap = await getDocs(q);
      setComments(snap.docs.map(d => {
        const raw = d.data();
        return {
          id: d.id,
          content: raw.content,
          authorEmail: raw.authorEmail,
          createdAt: raw.createdAt,
          updatedAt: raw.updatedAt,   // ดึง updatedAt ด้วย
        };
      }));
    } catch (e) { console.error(e); }
    setLoadingComments(false);
  };

  const handleComment = async () => {
    if (!user) { router.push('/login'); return; }
    if (!commentText.trim()) return;
    setPosting(true);
    try {
      // เพิ่ม comment
      await addDoc(collection(db, 'posts', postId, 'comments'), {
        content: commentText.trim(),
        authorEmail: user.email,
        createdAt: serverTimestamp(),
      });
      // ✅ +1 commentCount ใน post document
      await updateDoc(doc(db, 'posts', postId), {
        commentCount: increment(1),
      });
      setCommentText('');
      setPost(p => p ? { ...p, commentCount: (p.commentCount ?? 0) + 1 } : p);
      await fetchComments();
    } catch (e) { console.error(e); }
    setPosting(false);
  };

  const handleEditComment = async (commentId: string) => {
    if (!user || !editText.trim()) return;
    try {
      const commentRef = doc(db, 'posts', postId, 'comments', commentId);
      await updateDoc(commentRef, {
        content: editText.trim(),
        updatedAt: serverTimestamp(),
      });
      // อัปเดต state ฝั่ง client
      setComments(prev =>
        prev.map(c =>
          c.id === commentId
            ? { ...c, content: editText.trim(), updatedAt: new Date() }
            : c
        )
      );
      setEditingCommentId(null);
      setEditText('');
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;
    try {
      const postRef = doc(db, 'posts', postId);
      const commentRef = doc(db, 'posts', postId, 'comments', commentId);

      await runTransaction(db, async (transaction) => {
        // อ่านค่า commentCount ปัจจุบันจาก post
        const postDoc = await transaction.get(postRef);
        if (!postDoc.exists()) {
          throw new Error('Post not found');
        }
        const currentCount = postDoc.data().commentCount || 0;

        // ลดค่า commentCount ต่อเมื่อมากกว่า 0
        if (currentCount > 0) {
          transaction.update(postRef, { commentCount: currentCount - 1 });
        } else {
          // กรณีค่าเป็น 0 (ไม่ควรเกิด) ก็แค่ log ทิ้งไว้
          console.warn('commentCount already zero, skipping decrement');
        }

        // ลบ comment document
        transaction.delete(commentRef);
      });

      // อัปเดต state ฝั่ง client
      setComments(prev => prev.filter(c => c.id !== commentId));
      setPost(prev => prev ? { 
        ...prev, 
        commentCount: Math.max(0, (prev.commentCount ?? 0) - 1) 
      } : prev);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleLike = async () => {
    if (!post) return;
    if (!user) { router.push('/login'); return; }
    const ref = doc(db, 'posts', postId);
    const liked = post.likes?.includes(user.email!);
    await updateDoc(ref, {
      likes: liked ? arrayRemove(user.email) : arrayUnion(user.email),
    });
    setPost(p => p ? {
      ...p,
      likes: liked
        ? p.likes.filter(e => e !== user.email)
        : [...p.likes, user.email!],
    } : p);
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

  if (loadingPost) return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <p style={{ color: '#9ca3af', fontSize: '14px' }}>กำลังโหลด...</p>
    </div>
  );

  if (!post) return null;

  const liked = user ? post.likes?.includes(user.email!) : false;
  const pet = petLabel(post.petType);

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif' }}>
      <main style={{ maxWidth: '680px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Back */}
        <button onClick={() => router.push('/community')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#6b7280', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit', marginBottom: '20px', padding: 0 }}>
          ← กลับไปชุมชน
        </button>

        {/* Post Card */}
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '24px', marginBottom: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: avatarColor(post.authorEmail), color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '16px', flexShrink: 0 }}>
              {post.authorEmail?.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{post.authorEmail?.split('@')[0]}</span>
                  <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: '8px' }}>· {timeAgo(post.createdAt)}</span>
                </div>
                <span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '999px', background: pet.bg, color: pet.color }}>
                  {pet.icon} {pet.label}
                </span>
              </div>
              <p style={{ fontSize: '15px', color: '#374151', lineHeight: '1.7', margin: '0 0 16px' }}>{post.content}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '14px', borderTop: '1px solid #f3f4f6' }}>
                <button onClick={handleLike} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '8px', border: '1px solid', borderColor: liked ? '#fecaca' : '#e5e7eb', background: liked ? '#fef2f2' : 'white', color: liked ? '#ef4444' : '#6b7280', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                  {liked ? '❤️' : '🤍'} {post.likes?.length || 0} ถูกใจ
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', background: 'white', color: '#6b7280', fontSize: '13px' }}>
                  💬 {post.commentCount ?? comments.length} ความคิดเห็น
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comment Input */}
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '18px', marginBottom: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          {user ? (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: avatarColor(user.email || ''), color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '13px', flexShrink: 0 }}>
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <textarea
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleComment(); } }}
                  placeholder="เขียนความคิดเห็น... (Enter เพื่อส่ง)"
                  rows={2}
                  style={{ width: '100%', border: 'none', outline: 'none', fontSize: '14px', color: '#111827', resize: 'none', fontFamily: 'inherit', lineHeight: '1.6', background: 'transparent', boxSizing: 'border-box' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button onClick={handleComment} disabled={posting || !commentText.trim()} style={{ background: posting || !commentText.trim() ? '#e5e7eb' : '#0d9488', color: posting || !commentText.trim() ? '#9ca3af' : 'white', border: 'none', borderRadius: '8px', padding: '7px 18px', fontSize: '13px', fontWeight: '600', cursor: posting || !commentText.trim() ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                    {posting ? 'กำลังส่ง...' : 'ส่ง'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>เข้าสู่ระบบเพื่อแสดงความคิดเห็น</p>
              <a href="/login" style={{ background: '#0d9488', color: 'white', padding: '7px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', textDecoration: 'none', flexShrink: 0 }}>
                เข้าสู่ระบบ
              </a>
            </div>
          )}
        </div>

        {/* Comments List */}
        <div>
          <h2 style={{ fontSize: '14px', fontWeight: '700', color: '#111827', margin: '0 0 12px', letterSpacing: '-0.01em' }}>
            ความคิดเห็น {comments.length > 0 && `(${comments.length})`}
          </h2>
          {loadingComments ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#9ca3af', fontSize: '14px' }}>กำลังโหลด...</div>
          ) : comments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 24px', background: 'white', borderRadius: '14px', border: '1px solid #e5e7eb' }}>
              <p style={{ fontSize: '24px', margin: '0 0 8px' }}>💬</p>
              <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>ยังไม่มีความคิดเห็น เป็นคนแรกที่แสดงความคิดเห็น!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {comments.map(comment => {
                const isOwner = user && comment.authorEmail === user.email;
                return (
                  <div key={comment.id} style={{ background: 'white', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: avatarColor(comment.authorEmail), color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '12px', flexShrink: 0 }}>
                        {comment.authorEmail?.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <div>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>{comment.authorEmail?.split('@')[0]}</span>
                            <span style={{ fontSize: '11px', color: '#9ca3af', marginLeft: '6px' }}>· {timeAgo(comment.createdAt)}</span>
                            {comment.updatedAt && (
                              <span style={{ fontSize: '11px', color: '#9ca3af', marginLeft: '4px' }}>(แก้ไข)</span>
                            )}
                          </div>
                          {isOwner && editingCommentId !== comment.id && (
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button
                                onClick={() => { setEditingCommentId(comment.id); setEditText(comment.content); }}
                                style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '12px', cursor: 'pointer', padding: '2px 6px', borderRadius: '4px', transition: 'color 0.15s' }}
                                onMouseEnter={e => (e.currentTarget.style.color = '#2563eb')}
                                onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}
                              >
                                แก้ไข
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm('ลบความคิดเห็นนี้ใช่หรือไม่?')) {
                                    handleDeleteComment(comment.id);
                                  }
                                }}
                                style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '12px', cursor: 'pointer', padding: '2px 6px', borderRadius: '4px', transition: 'color 0.15s' }}
                                onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                                onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}
                              >
                                ลบ
                              </button>
                            </div>
                          )}
                        </div>

                        {editingCommentId === comment.id ? (
                          <div style={{ marginTop: '8px' }}>
                            <textarea
                              value={editText}
                              onChange={e => setEditText(e.target.value)}
                              rows={2}
                              style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 10px', fontSize: '14px', fontFamily: 'inherit', resize: 'none', outline: 'none', boxSizing: 'border-box' }}
                            />
                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => setEditingCommentId(null)}
                                style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid #e5e7eb', background: 'white', color: '#374151', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}
                              >
                                ยกเลิก
                              </button>
                              <button
                                onClick={() => handleEditComment(comment.id)}
                                disabled={!editText.trim()}
                                style={{ padding: '5px 12px', borderRadius: '6px', border: 'none', background: editText.trim() ? '#0d9488' : '#e5e7eb', color: editText.trim() ? 'white' : '#9ca3af', fontSize: '12px', fontWeight: '600', cursor: editText.trim() ? 'pointer' : 'not-allowed' }}
                              >
                                บันทึก
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', margin: 0, wordBreak: 'break-word' }}>{comment.content}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}