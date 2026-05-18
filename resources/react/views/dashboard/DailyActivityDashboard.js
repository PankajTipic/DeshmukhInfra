// import React, { useState, useEffect, useCallback } from 'react';
// import { getAPICall } from '../../util/api';

// /* ─────────────────────────────────────────────────────────────
//    FETCH DASHBOARD DATA
// ───────────────────────────────────────────────────────────── */
// async function fetchTodayActivity({ date, project_id, user_id } = {}) {
//   const params = new URLSearchParams();
//   if (date) params.append('date', date);
//   if (project_id) params.append('project_id', project_id);
//   if (user_id) params.append('user_id', user_id);

//   try {
//     const response = await getAPICall(
//       `/api/dashboard/today-activity?${params.toString()}`
//     );

//     let data;
//     if (response && typeof response === 'object') {
//       if (response.success !== undefined) {
//         if (!response.success) {
//           throw new Error(response.message || 'API returned success: false');
//         }
//         data = response.data;
//       } else if (response.date) {
//         data = response;
//       } else {
//         data = response;
//       }
//     } else {
//       throw new Error('Invalid response format from API');
//     }
//     return data;
//   } catch (err) {
//     console.error('[Dashboard] API Error:', err);
//     throw err;
//   }
// }

// /* ─── Helpers ────────────────────────────────── */
// const initials = (name) =>
//   name?.split(' ').map((w) => w[0]).join('').substring(0, 2).toUpperCase() || '??';

// const todayStr = () => new Date().toISOString().split('T')[0];

// const CAT_META = {
//   drilling: { label: 'Drilling', color: '#2563EB', bg: '#EFF6FF', icon: '⛏️' },
//   expense: { label: 'Expense', color: '#7C3AED', bg: '#F5F3FF', icon: '🧾' },
//   machine_reading: { label: 'Machine Reading', color: '#0891B2', bg: '#ECFEFF', icon: '🖥️' },
//   stock_update: { label: 'Stock Update', color: '#D97706', bg: '#FFFBEB', icon: '📦' },
//   order: { label: 'Order/Invoice', color: '#059669', bg: '#ECFDF5', icon: '📋' },
//   proforma: { label: 'Proforma', color: '#DB2777', bg: '#FDF2F8', icon: '📄' },
// };

// const TYPE_META = {
//   'Drilling / Work Log': { color: '#2563EB', icon: '⛏️' },
//   'Machine Reading': { color: '#0891B2', icon: '🖥️' },
//   'Expense': { color: '#7C3AED', icon: '🧾' },
//   'Stock Update': { color: '#D97706', icon: '📦' },
//   'Order / Invoice': { color: '#059669', icon: '📋' },
//   'Proforma Invoice': { color: '#DB2777', icon: '📄' },
// };

// /* Category Card */
// function CategoryCard({ catKey, cat, maxCount }) {
//   const meta = CAT_META[catKey] || { label: catKey, color: '#64748B', bg: '#F8FAFC', icon: '•' };
//   const hasData = cat.count > 0;
//   const pct = maxCount > 0 ? Math.round((cat.count / maxCount) * 100) : 0;
//   const [hov, setHov] = useState(false);

//   return (
//     <div
//       onMouseEnter={() => setHov(true)}
//       onMouseLeave={() => setHov(false)}
//       style={{
//         background: hasData ? meta.bg : '#fff',
//         border: `1.5px solid ${hasData ? meta.color + '40' : '#E2E8F0'}`,
//         borderRadius: 12,
//         padding: '16px',
//         position: 'relative',
//         overflow: 'hidden',
//         transition: 'transform 0.15s, box-shadow 0.15s',
//         transform: hov ? 'translateY(-2px)' : 'none',
//         boxShadow: hov ? `0 6px 20px ${meta.color}22` : '0 1px 3px rgba(0,0,0,0.04)',
//       }}
//     >
//       <div style={{ fontSize: 22, marginBottom: 8 }}>{meta.icon}</div>
//       <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: hasData ? meta.color : '#94A3B8' }}>
//         {meta.label}
//       </div>
//       <div style={{ fontSize: 34, fontWeight: 800, lineHeight: 1, marginTop: 4, fontVariantNumeric: 'tabular-nums', color: hasData ? meta.color : '#CBD5E1' }}>
//         {cat.count}
//       </div>
//       <div style={{ fontSize: 11, color: '#64748B', marginTop: 5 }}>
//         {cat.last_entry_time ? `🕐 Last: ${cat.last_entry_time}` : '— no entry today'}
//       </div>
//       <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: '#F1F5F9' }}>
//         {hasData && (
//           <div style={{ height: 4, width: `${pct}%`, background: meta.color, borderRadius: 2 }} />
//         )}
//       </div>
//     </div>
//   );
// }

// /* Entry Components */
// function DrillingEntry({ e }) {
//   return (
//     <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 12px', marginTop: 8 }}>
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//         <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>📍 {e.project || '—'}</span>
//         <span style={{ fontSize: 12, fontWeight: 700, color: '#2563EB', background: '#EFF6FF', padding: '2px 8px', borderRadius: 20 }}>{e.time}</span>
//       </div>
//       <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 6 }}>
//         <span style={{ fontSize: 11, color: '#64748B' }}>👷 Operator: <strong>{e.operator || 'Not assigned'}</strong></span>
//         {e.hours > 0 && <span style={{ fontSize: 11, color: '#64748B' }}>⏱ Hours: <strong>{e.hours}</strong></span>}
//         {e.machine_start && <span style={{ fontSize: 11, color: '#64748B' }}>🔩 Machine: <strong>{e.machine_start} → {e.machine_end || '—'}</strong></span>}
//       </div>
//     </div>
//   );
// }

// function ExpenseEntry({ e }) {
//   return (
//     <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 12px', marginTop: 8 }}>
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//         <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>🧾 {e.name || `Expense #${e.id}`}</span>
//         <span style={{ fontSize: 12, fontWeight: 700, color: '#7C3AED', background: '#F5F3FF', padding: '2px 8px', borderRadius: 20 }}>{e.time}</span>
//       </div>
//       <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 6, alignItems: 'center' }}>
//         {e.amount != null && <span style={{ fontSize: 12, fontWeight: 700, color: '#059669', background: '#ECFDF5', padding: '2px 8px', borderRadius: 20 }}>₹{e.amount}</span>}
//         {e.project_id && <span style={{ fontSize: 11, color: '#64748B' }}>Project: {e.project_id}</span>}
//         {e.desc && <span style={{ fontSize: 11, color: '#64748B' }}>📝 {e.desc}</span>}
//         {(e.is_gst === 1 || e.is_gst === true) ? (
//           <span style={{ fontSize: 11, fontWeight: 700, color: '#059669', background: '#DCFCE7', padding: '1px 7px', borderRadius: 20 }}>GST</span>
//         ) : (
//           <span style={{ fontSize: 11, color: '#94A3B8' }}>Non-GST</span>
//         )}
//       </div>
//     </div>
//   );
// }

// function OrderEntry({ e }) {
//   return (
//     <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 12px', marginTop: 8 }}>
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//         <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>📋 {e.invoice_no || `Order #${e.id}`}</span>
//         <span style={{ fontSize: 12, fontWeight: 700, color: '#059669', background: '#ECFDF5', padding: '2px 8px', borderRadius: 20 }}>{e.time}</span>
//       </div>
//       <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 6 }}>
//         <span style={{ fontSize: 11, color: '#64748B' }}>📍 Project: <strong>{e.project}</strong></span>
//         {e.total_amount && <span style={{ fontSize: 12, fontWeight: 700, color: '#059669' }}>₹{e.total_amount}</span>}
//         {e.paid_amount && <span style={{ fontSize: 11, color: '#16A34A' }}>Paid: ₹{e.paid_amount}</span>}
//         {e.status && <span style={{ fontSize: 11, color: '#64748B' }}>Status: <strong>{e.status}</strong></span>}
//       </div>
//     </div>
//   );
// }

// function ProformaEntry({ e }) {
//   return (
//     <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 12px', marginTop: 8 }}>
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//         <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>📄 {e.proforma_no || `Proforma #${e.id}`}</span>
//         <span style={{ fontSize: 12, fontWeight: 700, color: '#DB2777', background: '#FDF2F8', padding: '2px 8px', borderRadius: 20 }}>{e.time}</span>
//       </div>
//       <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 6 }}>
//         <span style={{ fontSize: 11, color: '#64748B' }}>📍 Project: <strong>{e.project}</strong></span>
//         {e.final_amount && <span style={{ fontSize: 12, fontWeight: 700, color: '#DB2777' }}>₹{e.final_amount}</span>}
//         {e.pending_amount > 0 && <span style={{ fontSize: 11, color: '#EF4444' }}>Pending: ₹{e.pending_amount}</span>}
//         {e.status && <span style={{ fontSize: 11, color: '#64748B' }}>Status: <strong>{e.status}</strong></span>}
//       </div>
//     </div>
//   );
// }

// function EntriesSection({ label, color, bg, entries, EntryComponent }) {
//   const [open, setOpen] = useState(false);
//   if (!entries || entries.length === 0) return null;

//   return (
//     <div style={{ marginTop: 8 }}>
//       <button
//         onClick={() => setOpen(!open)}
//         style={{
//           fontSize: 12, fontWeight: 700, color, background: bg,
//           border: `1px solid ${color}33`, borderRadius: 6,
//           padding: '5px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
//         }}
//       >
//         {open ? '▲ Hide' : '▼ Show'} {label} ({entries.length})
//       </button>
//       {open && entries.map((e, idx) => <EntryComponent key={idx} e={e} />)}
//     </div>
//   );
// }

// /* Active User Card */
// function ActiveUserCard({ user }) {
//   return (
//     <div style={{ background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
//       <div style={{ background: '#F0FDF4', borderBottom: '1.5px solid #BBF7D0', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
//         <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#16A34A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800 }}>
//           {initials(user.user_name)}
//         </div>
//         <div style={{ flex: 1 }}>
//           <div style={{ fontSize: 15, fontWeight: 800, color: '#14532D' }}>{user.user_name}</div>
//           <div style={{ fontSize: 12, color: '#16A34A' }}>✅ Active • User #{user.user_id}</div>
//         </div>
//         <div style={{ background: '#16A34A', color: '#fff', fontSize: 18, fontWeight: 800, padding: '4px 14px', borderRadius: 20 }}>
//           {user.total_entries} entries
//         </div>
//       </div>

//       <div style={{ padding: '14px 18px' }}>
//         <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#94A3B8', marginBottom: 8 }}>
//           Activity Breakdown
//         </div>
//         <div style={{ border: '1px solid #F1F5F9', borderRadius: 10, overflow: 'hidden' }}>
//           {user.details.map((det, i) => {
//             const meta = TYPE_META[det.type] || { color: '#64748B', icon: '•' };
//             return (
//               <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: i % 2 === 0 ? '#fff' : '#FAFAFA', borderBottom: i < user.details.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
//                 <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//                   <span>{meta.icon}</span> {det.type}
//                 </span>
//                 <span style={{ fontWeight: 800, color: meta.color }}>{det.count}</span>
//               </div>
//             );
//           })}
//         </div>

//         <div style={{ marginTop: 14, borderTop: '1px solid #F1F5F9', paddingTop: 12 }}>
//           <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#94A3B8', marginBottom: 6 }}>
//             Detailed Entries
//           </div>
//           <EntriesSection label="Drilling records" color="#2563EB" bg="#EFF6FF" entries={user.entries?.drilling} EntryComponent={DrillingEntry} />
//           <EntriesSection label="Expense records" color="#7C3AED" bg="#F5F3FF" entries={user.entries?.expense} EntryComponent={ExpenseEntry} />
//           <EntriesSection label="Order / Invoice" color="#059669" bg="#ECFDF5" entries={user.entries?.order} EntryComponent={OrderEntry} />
//           <EntriesSection label="Proforma Invoice" color="#DB2777" bg="#FDF2F8" entries={user.entries?.proforma} EntryComponent={ProformaEntry} />
//         </div>
//       </div>
//     </div>
//   );
// }

// function InactiveUserCard({ user }) {
//   const never = !user.last_activity;
//   const days = Math.abs(Math.round(user.days_ago ?? 0));

//   return (
//     <div style={{ background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
//       <div style={{ background: '#FFFBEB', borderBottom: '1.5px solid #FDE68A', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
//         <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#D97706', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800 }}>
//           {initials(user.user_name)}
//         </div>
//         <div style={{ flex: 1 }}>
//           <div style={{ fontSize: 15, fontWeight: 800, color: '#78350F' }}>{user.user_name}</div>
//           <div style={{ fontSize: 12, color: '#D97706' }}>⚠️ Inactive Today</div>
//         </div>
//         <div style={{ background: '#FEF3C7', color: '#92400E', fontSize: 11, fontWeight: 800, padding: '4px 12px', borderRadius: 20 }}>
//           {never ? 'Never' : `${days}d ago`}
//         </div>
//       </div>

//       <div style={{ padding: '14px 18px' }}>
//         <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: '12px 14px' }}>
//           <div style={{ fontSize: 11, fontWeight: 700, color: '#92400E' }}>Last Activity</div>
//           {never ? (
//             <div>Never recorded any activity</div>
//           ) : (
//             <div>
//               <strong>{user.last_activity}</strong>
//               <div style={{ fontSize: 12, color: '#92400E' }}>{user.status}</div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ==================== MAIN COMPONENT ==================== */
// const DailyActivityDashboard = () => {
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
  
//   const [selectedDate, setSelectedDate] = useState(todayStr());   // For input
//   const [appliedDate, setAppliedDate] = useState(todayStr());    // For API call

//   const [projectId, setProjectId] = useState('');
//   const [userId, setUserId] = useState('');

//   const loadDashboard = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const result = await fetchTodayActivity({
//         date: appliedDate,
//         project_id: projectId || undefined,
//         user_id: userId || undefined,
//       });
//       setData(result);
//     } catch (err) {
//       setError(err.message || 'Failed to load dashboard');
//     } finally {
//       setLoading(false);
//     }
//   }, [appliedDate, projectId, userId]);

//   // Load data when applied filters change
//   useEffect(() => {
//     loadDashboard();
//   }, [loadDashboard]);

//   const handleApply = () => {
//     setAppliedDate(selectedDate);
//   };

//   return (
//     <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: "'Outfit', sans-serif" }}>
//       <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>

//         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
//           <h1 style={{ fontSize: 28, fontWeight: 800 }}>📋 Daily Activity Dashboard</h1>
          
//           <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
//             <input 
//               type="date" 
//               value={selectedDate} 
//               onChange={(e) => setSelectedDate(e.target.value)}
//               style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ccc' }} 
//             />
//             <input 
//               type="text" 
//               placeholder="Project ID" 
//               value={projectId} 
//               onChange={(e) => setProjectId(e.target.value)} 
//               style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ccc', width: 130 }} 
//             />
//             <input 
//               type="text" 
//               placeholder="User ID" 
//               value={userId} 
//               onChange={(e) => setUserId(e.target.value)} 
//               style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ccc', width: 100 }} 
//             />
//             <button 
//               onClick={handleApply}
//               style={{ padding: '8px 20px', background: '#0F172A', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}
//             >
//               Apply / Refresh
//             </button>
//           </div>
//         </div>

//         <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>📅 Date: {appliedDate}</p>

//         {/* Category Summary */}
//         {data && (
//           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, marginBottom: 40 }}>
//             {Object.entries(data.category_summary).map(([key, cat]) => (
//               <CategoryCard key={key} catKey={key} cat={cat} maxCount={Math.max(...Object.values(data.category_summary).map(c => c.count), 1)} />
//             ))}
//           </div>
//         )}

//         {/* Active Users */}
//         {data && (
//           <>
//             <h2 style={{ marginBottom: 16 }}>✅ Active Users ({data.active_users.length})</h2>
//             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 20, marginBottom: 60 }}>
//               {data.active_users.map(user => (
//                 <ActiveUserCard key={user.user_id} user={user} />
//               ))}
//             </div>

//             {/* Inactive Users */}
//             {data.inactive_users.length > 0 && (
//               <>
//                 <h2 style={{ marginBottom: 16, color: '#D97706' }}>⚠️ Inactive Users ({data.inactive_users.length})</h2>
//                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 20 }}>
//                   {data.inactive_users.map(user => (
//                     <InactiveUserCard key={user.user_id} user={user} />
//                   ))}
//                 </div>
//               </>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default DailyActivityDashboard;












// import React, { useState, useEffect, useCallback } from 'react';
// import { getAPICall } from '../../util/api';

// /* ─────────────────────────────────────────────────────────────
//    FETCH DASHBOARD DATA
// ───────────────────────────────────────────────────────────── */
// async function fetchTodayActivity({ date, project_id, user_id } = {}) {
//   const params = new URLSearchParams();
//   if (date) params.append('date', date);
//   if (project_id) params.append('project_id', project_id);
//   if (user_id) params.append('user_id', user_id);

//   try {
//     const response = await getAPICall(
//       `/api/dashboard/today-activity?${params.toString()}`
//     );

//     let data;
//     if (response && typeof response === 'object') {
//       if (response.success !== undefined) {
//         if (!response.success) {
//           throw new Error(response.message || 'API returned success: false');
//         }
//         data = response.data;
//       } else if (response.date) {
//         data = response;
//       } else {
//         data = response;
//       }
//     } else {
//       throw new Error('Invalid response format from API');
//     }
//     return data;
//   } catch (err) {
//     console.error('[Dashboard] API Error:', err);
//     throw err;
//   }
// }

// /* ─── Helpers ────────────────────────────────── */
// const initials = (name) =>
//   name?.split(' ').map((w) => w[0]).join('').substring(0, 2).toUpperCase() || '??';

// const todayStr = () => new Date().toISOString().split('T')[0];

// const CAT_META = {
//   drilling: { label: 'Drilling', color: '#2563EB', bg: '#EFF6FF', icon: '⛏️' },
//   expense: { label: 'Expense', color: '#7C3AED', bg: '#F5F3FF', icon: '🧾' },
//   machine_reading: { label: 'Machine Reading', color: '#0891B2', bg: '#ECFEFF', icon: '🖥️' },
//   stock_update: { label: 'Stock Update', color: '#D97706', bg: '#FFFBEB', icon: '📦' },
//   order: { label: 'Order/Invoice', color: '#059669', bg: '#ECFDF5', icon: '📋' },
//   proforma: { label: 'Proforma', color: '#DB2777', bg: '#FDF2F8', icon: '📄' },
// };

// const TYPE_META = {
//   'Drilling / Work Log': { color: '#2563EB', icon: '⛏️' },
//   'Machine Reading': { color: '#0891B2', icon: '🖥️' },
//   'Expense': { color: '#7C3AED', icon: '🧾' },
//   'Stock Update': { color: '#D97706', icon: '📦' },
//   'Order / Invoice': { color: '#059669', icon: '📋' },
//   'Proforma Invoice': { color: '#DB2777', icon: '📄' },
// };

// /* Category Card */
// function CategoryCard({ catKey, cat, maxCount }) {
//   const meta = CAT_META[catKey] || { label: catKey, color: '#64748B', bg: '#F8FAFC', icon: '•' };
//   const hasData = cat.count > 0;
//   const pct = maxCount > 0 ? Math.round((cat.count / maxCount) * 100) : 0;
//   const [hov, setHov] = useState(false);

//   return (
//     <div
//       onMouseEnter={() => setHov(true)}
//       onMouseLeave={() => setHov(false)}
//       style={{
//         background: hasData ? meta.bg : '#fff',
//         border: `1.5px solid ${hasData ? meta.color + '40' : '#E2E8F0'}`,
//         borderRadius: 12,
//         padding: '16px',
//         position: 'relative',
//         overflow: 'hidden',
//         transition: 'transform 0.15s, box-shadow 0.15s',
//         transform: hov ? 'translateY(-2px)' : 'none',
//         boxShadow: hov ? `0 6px 20px ${meta.color}22` : '0 1px 3px rgba(0,0,0,0.04)',
//       }}
//     >
//       <div style={{ fontSize: 22, marginBottom: 8 }}>{meta.icon}</div>
//       <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: hasData ? meta.color : '#94A3B8' }}>
//         {meta.label}
//       </div>
//       <div style={{ fontSize: 34, fontWeight: 800, lineHeight: 1, marginTop: 4, fontVariantNumeric: 'tabular-nums', color: hasData ? meta.color : '#CBD5E1' }}>
//         {cat.count}
//       </div>
//       <div style={{ fontSize: 11, color: '#64748B', marginTop: 5 }}>
//         {cat.last_entry_time ? `🕐 Last: ${cat.last_entry_time}` : '— no entry today'}
//       </div>
//       <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: '#F1F5F9' }}>
//         {hasData && (
//           <div style={{ height: 4, width: `${pct}%`, background: meta.color, borderRadius: 2 }} />
//         )}
//       </div>
//     </div>
//   );
// }

// /* Entry Components */
// function DrillingEntry({ e }) {
//   return (
//     <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 12px', marginTop: 8 }}>
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//         <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>📍 {e.project || '—'}</span>
//         <span style={{ fontSize: 12, fontWeight: 700, color: '#2563EB', background: '#EFF6FF', padding: '2px 8px', borderRadius: 20 }}>{e.time}</span>
//       </div>
//       <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 6 }}>
//         <span style={{ fontSize: 11, color: '#64748B' }}>👷 Operator: <strong>{e.operator || 'Not assigned'}</strong></span>
//         {e.hours > 0 && <span style={{ fontSize: 11, color: '#64748B' }}>⏱ Hours: <strong>{e.hours}</strong></span>}
//         {e.machine_start && <span style={{ fontSize: 11, color: '#64748B' }}>🔩 Machine: <strong>{e.machine_start} → {e.machine_end || '—'}</strong></span>}
//       </div>
//     </div>
//   );
// }

// function ExpenseEntry({ e }) {
//   return (
//     <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 12px', marginTop: 8 }}>
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//         <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>🧾 {e.name || `Expense #${e.id}`}</span>
//         <span style={{ fontSize: 12, fontWeight: 700, color: '#7C3AED', background: '#F5F3FF', padding: '2px 8px', borderRadius: 20 }}>{e.time}</span>
//       </div>
//       <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 6, alignItems: 'center' }}>
//         {e.amount != null && <span style={{ fontSize: 12, fontWeight: 700, color: '#059669', background: '#ECFDF5', padding: '2px 8px', borderRadius: 20 }}>₹{e.amount}</span>}
//         {e.project_id && <span style={{ fontSize: 11, color: '#64748B' }}>Project: {e.project_id}</span>}
//         {e.desc && <span style={{ fontSize: 11, color: '#64748B' }}>📝 {e.desc}</span>}
//         {(e.is_gst === 1 || e.is_gst === true) ? (
//           <span style={{ fontSize: 11, fontWeight: 700, color: '#059669', background: '#DCFCE7', padding: '1px 7px', borderRadius: 20 }}>GST</span>
//         ) : (
//           <span style={{ fontSize: 11, color: '#94A3B8' }}>Non-GST</span>
//         )}
//       </div>
//     </div>
//   );
// }

// function OrderEntry({ e }) {
//   return (
//     <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 12px', marginTop: 8 }}>
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//         <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>📋 {e.invoice_no || `Order #${e.id}`}</span>
//         <span style={{ fontSize: 12, fontWeight: 700, color: '#059669', background: '#ECFDF5', padding: '2px 8px', borderRadius: 20 }}>{e.time}</span>
//       </div>
//       <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 6 }}>
//         <span style={{ fontSize: 11, color: '#64748B' }}>📍 Project: <strong>{e.project}</strong></span>
//         {e.total_amount && <span style={{ fontSize: 12, fontWeight: 700, color: '#059669' }}>₹{e.total_amount}</span>}
//         {e.paid_amount && <span style={{ fontSize: 11, color: '#16A34A' }}>Paid: ₹{e.paid_amount}</span>}
//         {e.status && <span style={{ fontSize: 11, color: '#64748B' }}>Status: <strong>{e.status}</strong></span>}
//       </div>
//     </div>
//   );
// }

// function ProformaEntry({ e }) {
//   return (
//     <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 12px', marginTop: 8 }}>
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//         <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>📄 {e.proforma_no || `Proforma #${e.id}`}</span>
//         <span style={{ fontSize: 12, fontWeight: 700, color: '#DB2777', background: '#FDF2F8', padding: '2px 8px', borderRadius: 20 }}>{e.time}</span>
//       </div>
//       <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 6 }}>
//         <span style={{ fontSize: 11, color: '#64748B' }}>📍 Project: <strong>{e.project}</strong></span>
//         {e.final_amount && <span style={{ fontSize: 12, fontWeight: 700, color: '#DB2777' }}>₹{e.final_amount}</span>}
//         {e.pending_amount > 0 && <span style={{ fontSize: 11, color: '#EF4444' }}>Pending: ₹{e.pending_amount}</span>}
//         {e.status && <span style={{ fontSize: 11, color: '#64748B' }}>Status: <strong>{e.status}</strong></span>}
//       </div>
//     </div>
//   );
// }

// function EntriesSection({ label, color, bg, entries, EntryComponent }) {
//   const [open, setOpen] = useState(false);
//   if (!entries || entries.length === 0) return null;

//   return (
//     <div style={{ marginTop: 8 }}>
//       <button
//         onClick={() => setOpen(!open)}
//         style={{
//           fontSize: 12, fontWeight: 700, color, background: bg,
//           border: `1px solid ${color}33`, borderRadius: 6,
//           padding: '5px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
//         }}
//       >
//         {open ? '▲ Hide' : '▼ Show'} {label} ({entries.length})
//       </button>
//       {open && entries.map((e, idx) => <EntryComponent key={idx} e={e} />)}
//     </div>
//   );
// }

// /* Active User Card */
// function ActiveUserCard({ user }) {
//   return (
//     <div style={{ background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
//       <div style={{ background: '#F0FDF4', borderBottom: '1.5px solid #BBF7D0', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
//         <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#16A34A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800 }}>
//           {initials(user.user_name)}
//         </div>
//         <div style={{ flex: 1 }}>
//           <div style={{ fontSize: 15, fontWeight: 800, color: '#14532D' }}>{user.user_name}</div>
//           <div style={{ fontSize: 12, color: '#16A34A' }}>✅ Active • User #{user.user_id}</div>
//         </div>
//         <div style={{ background: '#16A34A', color: '#fff', fontSize: 18, fontWeight: 800, padding: '4px 14px', borderRadius: 20 }}>
//           {user.total_entries} entries
//         </div>
//       </div>

//       <div style={{ padding: '14px 18px' }}>
//         <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#94A3B8', marginBottom: 8 }}>
//           Activity Breakdown
//         </div>
//         <div style={{ border: '1px solid #F1F5F9', borderRadius: 10, overflow: 'hidden' }}>
//           {user.details.map((det, i) => {
//             const meta = TYPE_META[det.type] || { color: '#64748B', icon: '•' };
//             return (
//               <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: i % 2 === 0 ? '#fff' : '#FAFAFA', borderBottom: i < user.details.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
//                 <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//                   <span>{meta.icon}</span> {det.type}
//                 </span>
//                 <span style={{ fontWeight: 800, color: meta.color }}>{det.count}</span>
//               </div>
//             );
//           })}
//         </div>

//         <div style={{ marginTop: 14, borderTop: '1px solid #F1F5F9', paddingTop: 12 }}>
//           <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#94A3B8', marginBottom: 6 }}>
//             Detailed Entries
//           </div>
//           <EntriesSection label="Drilling records" color="#2563EB" bg="#EFF6FF" entries={user.entries?.drilling} EntryComponent={DrillingEntry} />
//           <EntriesSection label="Expense records" color="#7C3AED" bg="#F5F3FF" entries={user.entries?.expense} EntryComponent={ExpenseEntry} />
//           <EntriesSection label="Order / Invoice" color="#059669" bg="#ECFDF5" entries={user.entries?.order} EntryComponent={OrderEntry} />
//           <EntriesSection label="Proforma Invoice" color="#DB2777" bg="#FDF2F8" entries={user.entries?.proforma} EntryComponent={ProformaEntry} />
//         </div>
//       </div>
//     </div>
//   );
// }

// function InactiveUserCard({ user }) {
//   const never = !user.last_activity;
//   const days = Math.abs(Math.round(user.days_ago ?? 0));

//   return (
//     <div style={{ background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
//       <div style={{ background: '#FFFBEB', borderBottom: '1.5px solid #FDE68A', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
//         <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#D97706', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800 }}>
//           {initials(user.user_name)}
//         </div>
//         <div style={{ flex: 1 }}>
//           <div style={{ fontSize: 15, fontWeight: 800, color: '#78350F' }}>{user.user_name}</div>
//           <div style={{ fontSize: 12, color: '#D97706' }}>⚠️ Inactive Today</div>
//         </div>
//         <div style={{ background: '#FEF3C7', color: '#92400E', fontSize: 11, fontWeight: 800, padding: '4px 12px', borderRadius: 20 }}>
//           {never ? 'Never' : `${days}d ago`}
//         </div>
//       </div>

//       <div style={{ padding: '14px 18px' }}>
//         <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: '12px 14px' }}>
//           <div style={{ fontSize: 11, fontWeight: 700, color: '#92400E' }}>Last Activity</div>
//           {never ? (
//             <div>Never recorded any activity</div>
//           ) : (
//             <div>
//               <strong>{user.last_activity}</strong>
//               <div style={{ fontSize: 12, color: '#92400E' }}>{user.status}</div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ==================== MAIN COMPONENT ==================== */
// const DailyActivityDashboard = () => {
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
  
//   const [selectedDate, setSelectedDate] = useState(todayStr());
//   const [appliedDate, setAppliedDate] = useState(todayStr());

//   const [projectId, setProjectId] = useState('');
//   const [userId, setUserId] = useState('');

//   const [projects, setProjects] = useState([]);
//   const [users, setUsers] = useState([]);

//   // Fetch Projects
//   useEffect(() => {
//     getAPICall('/api/projects')
//       .then(res => setProjects(Array.isArray(res) ? res : []))
//       .catch(err => {
//         console.error(err);
//         setProjects([]);
//       });
//   }, []);

//   // Fetch Users
//   useEffect(() => {
//     getAPICall('/api/appUsers')
//       .then(res => setUsers(Array.isArray(res) ? res : []))
//       .catch(err => {
//         console.error(err);
//         setUsers([]);
//       });
//   }, []);

//   const loadDashboard = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const result = await fetchTodayActivity({
//         date: appliedDate,
//         project_id: projectId || undefined,
//         user_id: userId || undefined,
//       });
//       setData(result);
//     } catch (err) {
//       setError(err.message || 'Failed to load dashboard');
//     } finally {
//       setLoading(false);
//     }
//   }, [appliedDate, projectId, userId]);

//   useEffect(() => {
//     loadDashboard();
//   }, [loadDashboard]);

//   const handleApply = () => {
//     setAppliedDate(selectedDate);
//   };

//   return (
//     <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: "'Outfit', sans-serif" }}>
//       <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>

//         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
//           <h1 style={{ fontSize: 28, fontWeight: 800 }}>📋 Daily Activity Dashboard</h1>
          
//           <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
//             <input 
//               type="date" 
//               value={selectedDate} 
//               onChange={(e) => setSelectedDate(e.target.value)}
//               style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ccc' }} 
//             />

//             {/* Project Dropdown */}
//             <select 
//               value={projectId} 
//               onChange={(e) => setProjectId(e.target.value)}
//               style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ccc', minWidth: 180 }}
//             >
//               <option value="">All Projects</option>
//               {projects.map(p => (
//                 <option key={p.id} value={p.id}>
//                   {p.project_name || p.name} (ID: {p.id})
//                 </option>
//               ))}
//             </select>

//             {/* User Dropdown */}
//             <select 
//               value={userId} 
//               onChange={(e) => setUserId(e.target.value)}
//               style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ccc', minWidth: 180 }}
//             >
//               <option value="">All Users</option>
//               {users.map(u => (
//                 <option key={u.id} value={u.id}>
//                   {u.name} (ID: {u.id})
//                 </option>
//               ))}
//             </select>

//             <button 
//               onClick={handleApply}
//               style={{ padding: '8px 20px', background: '#0F172A', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}
//             >
//               Apply / Refresh
//             </button>
//           </div>
//         </div>

//         <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>📅 Date: {appliedDate}</p>

//         {/* Category Summary */}
//         {data && (
//           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, marginBottom: 40 }}>
//             {Object.entries(data.category_summary).map(([key, cat]) => (
//               <CategoryCard key={key} catKey={key} cat={cat} maxCount={Math.max(...Object.values(data.category_summary).map(c => c.count), 1)} />
//             ))}
//           </div>
//         )}

//         {/* Active Users */}
//         {data && (
//           <>
//             <h2 style={{ marginBottom: 16 }}>✅ Active Users ({data.active_users.length})</h2>
//             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 20, marginBottom: 60 }}>
//               {data.active_users.map(user => (
//                 <ActiveUserCard key={user.user_id} user={user} />
//               ))}
//             </div>

//             {/* Inactive Users */}
//             {data.inactive_users.length > 0 && (
//               <>
//                 <h2 style={{ marginBottom: 16, color: '#D97706' }}>⚠️ Inactive Users ({data.inactive_users.length})</h2>
//                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 20 }}>
//                   {data.inactive_users.map(user => (
//                     <InactiveUserCard key={user.user_id} user={user} />
//                   ))}
//                 </div>
//               </>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default DailyActivityDashboard;











import React, { useState, useEffect, useCallback } from 'react';
import { getAPICall } from '../../util/api';

/* ─── helpers ─────────────────────────────────────────────── */
const initials = (name) =>
  name?.split(' ').map((w) => w[0]).join('').substring(0, 2).toUpperCase() || '??';
const todayStr  = () => new Date().toISOString().split('T')[0];
const absDays   = (v) => Math.abs(Math.round(v ?? 0));
const fmt       = (v) => (v != null && v !== '' ? v : '—');
const money     = (v) => (v != null ? `₹${Number(v).toLocaleString('en-IN')}` : '—');

/* ─── category / type config ──────────────────────────────── */
const CAT_META = {
  drilling:        { label: 'Drilling',        color: '#2563EB', bg: '#EFF6FF', icon: '⛏️' },
  expense:         { label: 'Expense',         color: '#7C3AED', bg: '#F5F3FF', icon: '🧾' },
  machine_reading: { label: 'Machine Reading', color: '#0891B2', bg: '#ECFEFF', icon: '🖥️' },
  stock_update:    { label: 'Stock Update',    color: '#D97706', bg: '#FFFBEB', icon: '📦' },
  order:           { label: 'Order/Invoice',   color: '#059669', bg: '#ECFDF5', icon: '📋' },
  proforma:        { label: 'Proforma',        color: '#DB2777', bg: '#FDF2F8', icon: '📄' },
};

const TYPE_META = {
  'Drilling / Work Log': { color: '#2563EB', icon: '⛏️' },
  'Machine Reading':     { color: '#0891B2', icon: '🖥️' },
  'Expense':             { color: '#7C3AED', icon: '🧾' },
  'Stock Update':        { color: '#D97706', icon: '📦' },
  'Order / Invoice':     { color: '#059669', icon: '📋' },
  'Proforma Invoice':    { color: '#DB2777', icon: '📄' },
};

/* ─── fetch ───────────────────────────────────────────────── */
async function fetchDashboard({ date, project_id, user_id } = {}) {
  const params = new URLSearchParams();
  if (date)       params.append('date',       date);
  if (project_id) params.append('project_id', project_id);
  if (user_id)    params.append('user_id',    user_id);

  const response = await getAPICall(`/api/dashboard/today-activity?${params.toString()}`);
  if (response?.success === false) throw new Error(response.message || 'API error');
  return response?.data ?? response;
}

/* ══════════════════════════════════════════════════════════
   CATEGORY CARD
══════════════════════════════════════════════════════════ */
function CategoryCard({ catKey, cat, maxCount }) {
  const meta    = CAT_META[catKey] || { label: catKey, color: '#64748B', bg: '#F8FAFC', icon: '•' };
  const hasData = cat.count > 0;
  const pct     = maxCount > 0 ? Math.round((cat.count / maxCount) * 100) : 0;
  const [hov, setHov] = useState(false);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background:   hasData ? meta.bg : '#fff',
        border:       `1.5px solid ${hasData ? meta.color + '40' : '#E2E8F0'}`,
        borderRadius: 12,
        padding:      '16px 18px',
        position:     'relative',
        overflow:     'hidden',
        transition:   'transform 0.15s, box-shadow 0.15s',
        transform:    hov ? 'translateY(-2px)' : 'none',
        boxShadow:    hov ? `0 6px 20px ${meta.color}22` : '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ fontSize: 24, marginBottom: 8 }}>{meta.icon}</div>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: hasData ? meta.color : '#94A3B8' }}>
        {meta.label}
      </div>
      <div style={{ fontSize: 36, fontWeight: 800, lineHeight: 1, marginTop: 4, color: hasData ? meta.color : '#CBD5E1' }}>
        {cat.count}
      </div>
      <div style={{ fontSize: 11, color: '#64748B', marginTop: 5 }}>
        {cat.last_entry_time ? `🕐 Last: ${cat.last_entry_time}` : '— no entry today'}
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: '#F1F5F9' }}>
        {hasData && <div style={{ height: 4, width: `${pct}%`, background: meta.color, transition: 'width 1s ease' }} />}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   ENTRY DETAIL CARDS — each type gets a rich card
══════════════════════════════════════════════════════════ */

/* shared tag */
const Tag = ({ children, color = '#64748B', bg = '#F1F5F9' }) => (
  <span style={{ fontSize: 11, fontWeight: 700, color, background: bg, padding: '2px 8px', borderRadius: 20, whiteSpace: 'nowrap' }}>
    {children}
  </span>
);

/* row inside entry card */
const ERow = ({ label, value }) =>
  value && value !== '—' ? (
    <div style={{ display: 'flex', gap: 6, fontSize: 12, marginTop: 4 }}>
      <span style={{ color: '#94A3B8', minWidth: 90 }}>{label}</span>
      <span style={{ color: '#1E293B', fontWeight: 600, flex: 1 }}>{value}</span>
    </div>
  ) : null;

function DrillingEntry({ e }) {
  const wp = e.work_points || [];
  const sv = e.surveys     || [];
  return (
    <div style={entryCardStyle('#2563EB')}>
      <div style={entryHeaderStyle}>
        <span style={{ fontWeight: 700, color: '#1E293B', fontSize: 13 }}>
          📍 {e.project?.project_name || fmt(e.project)}
        </span>
        <Tag color="#2563EB" bg="#EFF6FF">{e.time || e.created_at?.substring(11,16)}</Tag>
      </div>
      <ERow label="Operator"    value={e.operator?.name || (e.oprator_helper ? 'Assigned' : 'Not assigned')} />
      <ERow label="Machine Hrs" value={fmt(e.actual_machine_hr)} />
      <ERow label="Start → End" value={e.machine_start ? `${e.machine_start} → ${e.machine_end ?? '—'}` : null} />
      {wp.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 4 }}>WORK POINTS ({wp.length})</div>
          {wp.map((w, i) => (
            <div key={i} style={{ background: '#EFF6FF', borderRadius: 6, padding: '6px 10px', marginTop: 4, fontSize: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600 }}>{w.work_type}</span>
                <span style={{ color: '#2563EB', fontWeight: 700 }}>{money(w.total)}</span>
              </div>
              <div style={{ color: '#64748B', marginTop: 2 }}>Qty: {w.work_point} · Rate: {money(w.rate)}</div>
            </div>
          ))}
        </div>
      )}
      {sv.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 4 }}>SURVEYS ({sv.length})</div>
          {sv.map((s, i) => (
            <div key={i} style={{ background: '#F0F9FF', borderRadius: 6, padding: '6px 10px', marginTop: 4, fontSize: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600 }}>{s.survey_type}</span>
                <span style={{ color: '#0891B2', fontWeight: 700 }}>{money(s.total)}</span>
              </div>
              <div style={{ color: '#64748B', marginTop: 2 }}>Point: {s.survey_point} · Rate: {money(s.rate)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* Machine Reading Entry - New Rich Card */
function MachineReadingEntry({ e }) {
  return (
    <div style={entryCardStyle('#0891B2')}>
      <div style={entryHeaderStyle}>
        <span style={{ fontWeight: 700, color: '#1E293B', fontSize: 13 }}>
          🖥️ Machine Reading
        </span>
        <Tag color="#0891B2" bg="#ECFEFF">{e.time || e.created_at?.substring(11,16)}</Tag>
      </div>

      <ERow label="Project" value={e.project?.project_name || e.drilling_record?.project?.project_name} />
      <ERow label="Operator" value={e.operator?.name} />
      <ERow label="Machine ID" value={e.machine_id} />
      <ERow label="Start → End" value={`${e.machine_start} → ${e.machine_end}`} />
      <ERow label="Actual Hours" value={e.actual_machine_hr} />

      {e.drilling_record && (
        <div style={{ marginTop: 8, fontSize: 12, color: '#64748B' }}>
          Linked to Drilling Record #{e.drilling_record.id}
        </div>
      )}
    </div>
  );
}

function ExpenseEntry({ e }) {
  const photos = e.photos || [];
  return (
    <div style={entryCardStyle('#7C3AED')}>
      <div style={entryHeaderStyle}>
        <span style={{ fontWeight: 700, color: '#1E293B', fontSize: 13 }}>🧾 {fmt(e.name)}</span>
        <Tag color="#7C3AED" bg="#F5F3FF">{e.time}</Tag>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
        <Tag color="#059669" bg="#DCFCE7">{money(e.total_price)}</Tag>
        {e.isGst === 1 && <Tag color="#0891B2" bg="#ECFEFF">GST ✓</Tag>}
        <Tag color="#64748B" bg="#F1F5F9">{e.payment_type || 'cash'}</Tag>
      </div>
      <ERow label="Project"   value={e.project?.project_name || e.project_id} />
      <ERow label="Party"     value={e.party_name} />
      <ERow label="Category"  value={e.expense_type?.name} />
      <ERow label="Paid by"   value={e.payment_by} />
      {e.gst && <ERow label="GST" value={`₹${e.gst} (CGST: ₹${e.cgst} | SGST: ₹${e.sgst})`} />}
      {photos.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 4 }}>BILL PHOTOS</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {photos.map((p, i) => (
              <div
                key={i}
                onClick={() => window.open(p.photo_url, '_blank')}
                style={{
                  width: 64, height: 64, borderRadius: 8,
                  background: '#E2E8F0', cursor: 'pointer',
                  overflow: 'hidden', border: '1px solid #CBD5E1',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <img
                  src={p.photo_url}
                  alt="bill"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(ev) => { ev.target.style.display = 'none'; ev.target.parentNode.innerHTML = '🖼️'; }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function OrderEntry({ e }) {
  const items = e.items || [];
  return (
    <div style={entryCardStyle('#059669')}>
      <div style={entryHeaderStyle}>
        <span style={{ fontWeight: 700, color: '#1E293B', fontSize: 13 }}>📋 {e.invoice_number || `Order #${e.id}`}</span>
        <Tag color="#059669" bg="#ECFDF5">{e.time || e.invoiceDate}</Tag>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
        <Tag color="#059669" bg="#DCFCE7">Total: {money(e.totalAmount)}</Tag>
        <Tag color="#2563EB" bg="#EFF6FF">Paid: {money(e.paidAmount)}</Tag>
        {Number(e.pending_amount) > 0 && <Tag color="#D97706" bg="#FFFBEB">Pending: {money(e.pending_amount)}</Tag>}
      </div>
      <ERow label="Project"  value={e.project?.project_name} />
      <ERow label="PO No."   value={e.po_number} />
      <ERow label="Ref"      value={e.ref_id} />
      {items.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 4 }}>LINE ITEMS ({items.length})</div>
          {items.map((it, i) => (
            <div key={i} style={{ background: '#ECFDF5', borderRadius: 6, padding: '6px 10px', marginTop: 4, fontSize: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600 }}>{it.work_type}</span>
                <span style={{ color: '#059669', fontWeight: 700 }}>{money(it.total_price)}</span>
              </div>
              <div style={{ color: '#64748B', marginTop: 2 }}>Qty: {it.qty} {it.uom} · Rate: {money(it.price)} · GST: {it.gst_percent}%</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProformaEntry({ e }) {
  const details = e.details || [];
  const statusColor = { draft: '#D97706', sent: '#2563EB', paid: '#059669', partial: '#0891B2' };
  const col = statusColor[e.payment_status] || '#64748B';
  return (
    <div style={entryCardStyle('#DB2777')}>
      <div style={entryHeaderStyle}>
        <span style={{ fontWeight: 700, color: '#1E293B', fontSize: 13 }}>📄 {e.proforma_invoice_number}</span>
        <Tag color="#DB2777" bg="#FDF2F8">{e.invoice_date?.substring(0,10)}</Tag>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
        <Tag color="#DB2777" bg="#FDF2F8">Final: {money(e.final_amount)}</Tag>
        <Tag color="#2563EB" bg="#EFF6FF">Paid: {money(e.paid_amount)}</Tag>
        {Number(e.pending_amount) > 0 && <Tag color="#D97706" bg="#FFFBEB">Pending: {money(e.pending_amount)}</Tag>}
        <Tag color={col} bg={col + '18'}>{(e.payment_status || 'draft').toUpperCase()}</Tag>
      </div>
      <ERow label="Project"  value={e.project?.project_name} />
      <ERow label="Status"   value={e.status} />
      {details.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 4 }}>LINE ITEMS ({details.length})</div>
          {details.map((d, i) => (
            <div key={i} style={{ background: '#FDF2F8', borderRadius: 6, padding: '6px 10px', marginTop: 4, fontSize: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600 }}>{d.work_type}</span>
                <span style={{ color: '#DB2777', fontWeight: 700 }}>{money(d.total_price)}</span>
              </div>
              <div style={{ color: '#64748B', marginTop: 2 }}>Qty: {d.qty} {d.uom} · Rate: {money(d.price)} · GST: {d.gst_percent}%</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* Improved Income Entry */
function IncomeEntry({ e }) {
  return (
    <div style={entryCardStyle('#10B981')}>
      <div style={entryHeaderStyle}>
        <span style={{ fontWeight: 700, color: '#1E293B', fontSize: 13 }}>
          💰 {e.invoice_no || `Income #${e.id}`}
        </span>
        <Tag color="#10B981" bg="#ECFDF5">{e.time || e.created_at?.substring(11,16)}</Tag>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
        <Tag color="#10B981" bg="#D1FAE5">₹{e.billing_amount}</Tag>
        <Tag color="#059669" bg="#DCFCE7">Received: ₹{e.received_amount}</Tag>
        {Number(e.pending_amount) > 0 && (
          <Tag color="#D97706" bg="#FFFBEB">Pending: ₹{e.pending_amount}</Tag>
        )}
      </div>

      <ERow label="Project" value={e.project?.project_name} />
      <ERow label="Proforma" value={e.invoice_no} />
      <ERow label="Payment Mode" value={e.payment_type?.toUpperCase()} />
      <ERow label="Received By" value={e.received_by} />
      <ERow label="Remark" value={e.remark} />
    </div>
  );
}

/* shared styles */
const entryCardStyle = (color) => ({
  background:   '#fff',
  border:       `1px solid ${color}30`,
  borderLeft:   `3px solid ${color}`,
  borderRadius: 8,
  padding:      '12px 14px',
  marginTop:    10,
});
const entryHeaderStyle = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap',
};

/* collapsible section */
function EntriesSection({ label, color, bg, entries, EntryComponent }) {
  const [open, setOpen] = useState(false);
  if (!entries || entries.length === 0) return null;
  return (
    <div style={{ marginTop: 10 }}>
      <button
        onClick={() => setOpen((p) => !p)}
        style={{
          fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
          color, background: bg, border: `1.5px solid ${color}30`,
          borderRadius: 20, padding: '5px 14px',
          cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5,
        }}
      >
        {open ? '▲ Hide' : '▼ View'} {label} ({entries.length})
      </button>
      {open && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10, marginTop: 6 }}>
          {entries.map((e, i) => <EntryComponent key={e.id ?? i} e={e} />)}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   ACTIVE USER CARD — two-panel layout
══════════════════════════════════════════════════════════ */
function ActiveUserCard({ user }) {
  return (
    <div style={{
      background:   '#fff',
      border:       '1.5px solid #E2E8F0',
      borderRadius: 16,
      overflow:     'hidden',
      boxShadow:    '0 2px 8px rgba(0,0,0,0.06)',
    }}>
      {/* ── Card Header ── */}
      <div style={{
        background:    'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
        borderBottom:  '1.5px solid #BBF7D0',
        padding:       '16px 20px',
        display:       'flex',
        alignItems:    'center',
        gap:           14,
        flexWrap:      'wrap',
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: '#16A34A', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 800, flexShrink: 0,
          boxShadow: '0 2px 10px #16A34A55',
        }}>
          {initials(user.user_name)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#14532D' }}>{user.user_name}</div>
          <div style={{ fontSize: 12, color: '#16A34A', marginTop: 2 }}>
            ✅ Active today &nbsp;·&nbsp; User #{user.user_id}
          </div>
        </div>
        <div style={{
          background: '#16A34A', color: '#fff',
          fontSize: 20, fontWeight: 800, padding: '6px 18px',
          borderRadius: 24, boxShadow: '0 2px 8px #16A34A44',
        }}>
          {user.total_entries} entries
        </div>
      </div>

      {/* ── Card Body: two columns ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(180px, 240px) 1fr',
        gap: 0,
      }}>

        {/* LEFT — breakdown summary */}
        <div style={{
          borderRight: '1.5px solid #F1F5F9',
          padding: '18px 20px',
          background: '#FAFAFA',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#94A3B8', marginBottom: 10 }}>
            Activity Breakdown
          </div>
          {user.details.length === 0 ? (
            <p style={{ fontSize: 13, color: '#CBD5E1' }}>No entries</p>
          ) : (
            user.details.map((det, i) => {
              const meta = TYPE_META[det.type] || { color: '#64748B', icon: '•' };
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '9px 12px', marginBottom: 6,
                    background: '#fff', border: '1px solid #F1F5F9',
                    borderRadius: 8,
                  }}
                >
                  <span style={{ fontSize: 13, color: '#475569', display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span>{meta.icon}</span>
                    <span style={{ fontWeight: 500 }}>{det.type}</span>
                  </span>
                  <span style={{
                    fontSize: 14, fontWeight: 800,
                    color: meta.color, background: meta.color + '18',
                    padding: '2px 10px', borderRadius: 20,
                    minWidth: 28, textAlign: 'center',
                  }}>
                    {det.count}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* RIGHT — detailed entries */}
        <div style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#94A3B8', marginBottom: 10 }}>
            Detailed Entries
          </div>

          <EntriesSection
            label="Drilling Records"
            color="#2563EB" bg="#EFF6FF"
            entries={user.entries?.drilling}
            EntryComponent={DrillingEntry}
          />

<EntriesSection label="Machine Reading" color="#0891B2" bg="#ECFEFF" entries={user.entries?.machine_reading} EntryComponent={MachineReadingEntry} />

          <EntriesSection
            label="Expense Records"
            color="#7C3AED" bg="#F5F3FF"
            entries={user.entries?.expense}
            EntryComponent={ExpenseEntry}
          />
          <EntriesSection
            label="Orders / Invoices"
            color="#059669" bg="#ECFDF5"
            entries={user.entries?.order}
            EntryComponent={OrderEntry}
          />
          <EntriesSection
            label="Proforma Invoices"
            color="#DB2777" bg="#FDF2F8"
            entries={user.entries?.proforma}
            EntryComponent={ProformaEntry}
          />

<EntriesSection label="Income Records" color="#10B981" bg="#ECFDF5" entries={user.entries?.income} EntryComponent={IncomeEntry} />


          {!user.entries?.drilling?.length &&
          !user.entries?.machine_reading?.length &&
           !user.entries?.expense?.length  &&
           !user.entries?.order?.length    &&
           !user.entries?.proforma?.length &&
           !user.entries?.income?.length && (
            <p style={{ fontSize: 12, color: '#CBD5E1', fontStyle: 'italic' }}>
              No expandable detail entries available
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   INACTIVE USER CARD
══════════════════════════════════════════════════════════ */
function InactiveUserCard({ user }) {
  const never = !user.last_activity;
  const days  = absDays(user.days_ago);

  return (
    <div style={{
      background: '#fff', border: '1.5px solid #E2E8F0',
      borderRadius: 14, overflow: 'hidden',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      display: 'flex', alignItems: 'stretch',
    }}>
      {/* left accent */}
      <div style={{ width: 4, background: '#EF9F27', flexShrink: 0 }} />

      <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, flex: 1, flexWrap: 'wrap' }}>
        <div style={{
          width: 42, height: 42, borderRadius: '50%',
          background: '#D97706', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 15, fontWeight: 800, flexShrink: 0,
        }}>
          {initials(user.user_name)}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#78350F' }}>{user.user_name}</div>
          <div style={{ fontSize: 12, color: '#D97706', marginTop: 2 }}>⚠️ Inactive today · User #{user.user_id}</div>
        </div>

        <div style={{
          background: never ? '#FEE2E2' : '#FEF3C7',
          color:      never ? '#991B1B' : '#92400E',
          fontSize: 12, fontWeight: 700,
          padding: '6px 14px', borderRadius: 20, textAlign: 'center', flexShrink: 0,
        }}>
          {never ? (
            <>🚫 Never active</>
          ) : (
            <>📅 {user.last_activity}<br />
            <span style={{ fontSize: 11 }}>{days} days ago</span></>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
const DailyActivityDashboard = () => {
  const [data,         setData]         = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [appliedDate,  setAppliedDate]  = useState(todayStr());
  const [projectId,    setProjectId]    = useState('');
  const [userId,       setUserId]       = useState('');
  const [projects,     setProjects]     = useState([]);
  const [users,        setUsers]        = useState([]);

  /* fetch dropdown data */
  useEffect(() => {
    getAPICall('/api/projects').then((r) => setProjects(Array.isArray(r) ? r : r?.data ?? [])).catch(() => {});
    getAPICall('/api/appUsers').then((r) => setUsers(Array.isArray(r)   ? r : r?.data ?? [])).catch(() => {});
  }, []);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchDashboard({
        date:       appliedDate,
        project_id: projectId || undefined,
        user_id:    userId    || undefined,
      });
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [appliedDate, projectId, userId]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const handleApply = () => setAppliedDate(selectedDate);

  const inputStyle = {
    fontSize: 13, fontFamily: 'inherit',
    padding: '8px 12px', borderRadius: 8,
    border: '1.5px solid #E2E8F0',
    background: '#fff', color: '#1E293B', outline: 'none',
  };

  /* ── Loading ── */
  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', gap: 16, fontFamily: 'sans-serif' }}>
      <style>{`@keyframes _spin { to { transform:rotate(360deg) } }`}</style>
      <div style={{ width: 44, height: 44, border: '3px solid #E2E8F0', borderTopColor: '#0F172A', borderRadius: '50%', animation: '_spin 0.8s linear infinite' }} />
      <span style={{ fontSize: 14, color: '#64748B', fontWeight: 600 }}>Loading dashboard…</span>
    </div>
  );

  /* ── Error ── */
  if (error && !data) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: 14, padding: '32px 40px', textAlign: 'center', maxWidth: 420 }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#991B1B', margin: '0 0 8px' }}>Failed to load</h2>
        <p style={{ fontSize: 13, color: '#7F1D1D', marginBottom: 20 }}>{error}</p>
        <button onClick={loadDashboard} style={{ background: '#991B1B', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
          🔄 Try Again
        </button>
      </div>
    </div>
  );

  const d            = data;
  const totalEntries = Object.values(d.category_summary).reduce((s, c) => s + c.count, 0);
  const maxCount     = Math.max(...Object.values(d.category_summary).map((c) => c.count), 1);
  const totalUsers   = d.active_users.length + d.inactive_users.length;

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: "'Outfit','Segoe UI',sans-serif", color: '#1E293B' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        input:focus, select:focus { border-color: #0F172A !important; outline: none; }
        @media (max-width: 700px) {
          .user-body-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 24px' }}>

        {/* ── HEADER ─────────────────────────────────────── */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px', margin: 0 }}>
              📋 Daily Activity Dashboard
            </h1>
            <p style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
              📅 Showing data for <strong>{appliedDate}</strong>
              {error && <span style={{ color: '#EF4444', marginLeft: 8 }}>⚠ {error}</span>}
            </p>
          </div>

          {/* filters */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ ...inputStyle, width: 158 }}
            />
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              style={{ ...inputStyle, minWidth: 160 }}
            >
              <option value="">All Projects</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.project_name}</option>)}
            </select>
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              style={{ ...inputStyle, minWidth: 150 }}
            >
              <option value="">All Users</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <button
              onClick={handleApply}
              style={{
                fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
                padding: '8px 22px', borderRadius: 8,
                background: '#0F172A', color: '#fff', border: 'none', cursor: 'pointer',
              }}
            >
              🔄 Apply
            </button>
          </div>
        </div>

        {/* ── SUMMARY STRIP ──────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          background: '#fff', border: '1.5px solid #E2E8F0',
          borderRadius: 14, marginBottom: 28, overflow: 'hidden',
        }}>
          {[
            { label: 'Active Today',  val: d.total_active_users,   sub: 'users with entries',    accent: '#16A34A' },
            { label: 'Inactive',      val: d.inactive_users.length, sub: 'no activity today',     accent: '#D97706' },
            { label: 'Total Entries', val: totalEntries,            sub: 'across all categories', accent: '#2563EB' },
            { label: 'Total Users',   val: totalUsers,              sub: 'tracked in system',     accent: '#7C3AED' },
          ].map((item, i, arr) => (
            <div key={item.label} style={{ padding: '20px 24px', borderRight: i < arr.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#94A3B8', marginBottom: 6 }}>
                {item.label}
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, color: item.accent, lineHeight: 1 }}>{item.val}</div>
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>{item.sub}</div>
            </div>
          ))}
        </div>

        {/* ── CATEGORY OVERVIEW ──────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <h2 style={{ fontSize: 13, fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.6px', margin: 0 }}>
            Category Overview
          </h2>
          <span style={{ background: '#F1F5F9', color: '#64748B', fontSize: 12, fontWeight: 700, padding: '2px 10px', borderRadius: 20 }}>
            {totalEntries} total
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, marginBottom: 32 }}>
          {Object.entries(d.category_summary).map(([key, cat]) => (
            <CategoryCard key={key} catKey={key} cat={cat} maxCount={maxCount} />
          ))}
        </div>

        {/* ── ACTIVE USERS ───────────────────────────────── */}
        <div style={{ height: 1, background: '#F1F5F9', marginBottom: 24 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <h2 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
            ✅ Active Users
          </h2>
          <span style={{ background: '#DCFCE7', color: '#166534', fontSize: 12, fontWeight: 700, padding: '2px 10px', borderRadius: 20 }}>
            {d.active_users.length}
          </span>
        </div>

        {d.active_users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8', fontSize: 14, background: '#fff', borderRadius: 14, border: '1.5px dashed #E2E8F0', marginBottom: 28 }}>
            😶 No active users for this date / filter
          </div>
        ) : (
          /* ONE card per row — full width, two-panel inside */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
            {d.active_users.map((u) => (
              <ActiveUserCard key={u.user_id} user={u} />
            ))}
          </div>
        )}

        {/* ── INACTIVE USERS ─────────────────────────────── */}
        {d.inactive_users.length > 0 && (
          <>
            <div style={{ height: 1, background: '#F1F5F9', marginBottom: 24 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <h2 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
                ⚠️ Inactive Users
              </h2>
              <span style={{ background: '#FEF3C7', color: '#92400E', fontSize: 12, fontWeight: 700, padding: '2px 10px', borderRadius: 20 }}>
                {d.inactive_users.length}
              </span>
            </div>
            {/* 2-col grid for inactive — compact horizontal cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 12 }}>
              {d.inactive_users.map((u) => (
                <InactiveUserCard key={u.user_id} user={u} />
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default DailyActivityDashboard;