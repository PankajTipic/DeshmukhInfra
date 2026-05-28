

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
  drilling:        { label: 'Work Logs',        color: '#2563EB', bg: '#EFF6FF', icon: '⛏️' },
  expense:         { label: 'Expense',         color: '#7C3AED', bg: '#F5F3FF', icon: '🧾' },
  // machine_reading: { label: 'Machine Reading', color: '#0891B2', bg: '#ECFEFF', icon: '🖥️' },
  stock_update:    { label: 'Stock Update',    color: '#D97706', bg: '#FFFBEB', icon: '📦' },
  order:           { label: 'Order/Invoice',   color: '#059669', bg: '#ECFDF5', icon: '📋' },
  proforma:        { label: 'Proforma',        color: '#DB2777', bg: '#FDF2F8', icon: '📄' },
};

const TYPE_META = {
  'Work Logs': { color: '#2563EB', icon: '⛏️' },
  // 'Machine Reading':     { color: '#0891B2', icon: '🖥️' },
  'Expense':             { color: '#7C3AED', icon: '🧾' },
  'Stock Update':        { color: '#D97706', icon: '📦' },
  'Order / Invoice':     { color: '#059669', icon: '📋' },
  'Proforma Invoice':    { color: '#DB2777', icon: '📄' },
  'Income':              { color: '#10B981', icon: '💰' },
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
      {/* <div style={{ fontSize: 11, color: '#64748B', marginTop: 5 }}>
        {cat.last_entry_time ? `🕐 Last: ${cat.last_entry_time}` : '— no entry today'}
      </div> */}
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



// function DrillingEntry({ e }) {
//   const wp = e.work_points || [];
//   const sv = e.surveys     || [];
//   return (
//     <div style={entryCardStyle('#2563EB')}>
//       <div style={entryHeaderStyle}>
//         <span style={{ fontWeight: 700, color: '#1E293B', fontSize: 13 }}>
//           📍 {e.project?.project_name || fmt(e.project)}
//         </span>
//         <Tag color="#2563EB" bg="#EFF6FF">{e.time || e.created_at?.substring(11,16)}</Tag>
//       </div>
//       <ERow label="Operator"    value={e.operator?.name || (e.oprator_helper ? 'Assigned' : 'Not assigned')} />
//       <ERow label="Machine Hrs" value={fmt(e.actual_machine_hr)} />
//       <ERow label="Start → End" value={e.machine_start ? `${e.machine_start} → ${e.machine_end ?? '—'}` : null} />
//       {wp.length > 0 && (
//         <div style={{ marginTop: 8 }}>
//           <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 4 }}>WORK POINTS ({wp.length})</div>
//           {wp.map((w, i) => (
//             <div key={i} style={{ background: '#EFF6FF', borderRadius: 6, padding: '6px 10px', marginTop: 4, fontSize: 12 }}>
//               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//                 <span style={{ fontWeight: 600 }}>{w.work_type}</span>
//                 <span style={{ color: '#2563EB', fontWeight: 700 }}>{money(w.total)}</span>
//               </div>
//               <div style={{ color: '#64748B', marginTop: 2 }}>Qty: {w.work_point} · Rate: {money(w.rate)}</div>
//             </div>
//           ))}
//         </div>
//       )}
//       {sv.length > 0 && (
//         <div style={{ marginTop: 8 }}>
//           <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 4 }}>SURVEYS ({sv.length})</div>
//           {sv.map((s, i) => (
//             <div key={i} style={{ background: '#F0F9FF', borderRadius: 6, padding: '6px 10px', marginTop: 4, fontSize: 12 }}>
//               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//                 <span style={{ fontWeight: 600 }}>{s.survey_type}</span>
//                 <span style={{ color: '#0891B2', fontWeight: 700 }}>{money(s.total)}</span>
//               </div>
//               <div style={{ color: '#64748B', marginTop: 2 }}>Point: {s.survey_point} · Rate: {money(s.rate)}</div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }


function DrillingEntry({ e }) {
  const wp = e.work_points || e.workPoints || [];
  const sv = e.surveys || [];
  const mr = e.machine_reading || e.machineReading || [];
 const cm = e.compressor_rpm || e.compressorRpm || [];

  const operatorName = e.operator?.name || 
                      mr[0]?.operator?.name || 
                      (e.oprator_helper ? 'Assigned' : 'Not Assigned');

  return (
    <div style={entryCardStyle('#2563EB')}>
      <div style={entryHeaderStyle}>
        <span style={{ fontWeight: 700, color: '#1E293B', fontSize: 13 }}>
          📍 {e.project?.project_name || 'No Project'}
        </span>
        <Tag color="#2563EB" bg="#EFF6FF">
          {e.time || e.created_at?.substring(11, 16)}
        </Tag>
      </div>

      <ERow label="Operator" value={operatorName} />
      <ERow label="Machine Hrs" value={fmt(e.actual_machine_hr) || '—'} />
      
      {e.machine_start && (
        <ERow 
          label="Start → End" 
          value={`${e.machine_start} → ${e.machine_end ?? '—'}`} 
        />
      )}

      {/* Work Points */}
      {wp.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 6 }}>
            WORK POINTS ({wp.length})
          </div>
          {wp.map((w, i) => (
            <div key={i} style={{
              background: '#EFF6FF',
              borderRadius: 6,
              padding: '8px 10px',
              marginTop: 4,
              fontSize: 12
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600 }}>{w.work_type}</span>
                <span style={{ color: '#2563EB', fontWeight: 700 }}>{money(w.total)}</span>
              </div>
              <div style={{ color: '#64748B', marginTop: 2 }}>
                Qty: {w.work_point} · Rate: {money(w.rate)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Surveys */}
      {sv.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 6 }}>
            SURVEYS ({sv.length})
          </div>
          {sv.map((s, i) => (
            <div key={i} style={{
              background: '#F0F9FF',
              borderRadius: 6,
              padding: '8px 10px',
              marginTop: 4,
              fontSize: 12
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600 }}>{s.survey_type}</span>
                <span style={{ color: '#0891B2', fontWeight: 700 }}>{money(s.total)}</span>
              </div>
              <div style={{ color: '#64748B', marginTop: 2 }}>
                Point: {s.survey_point} · Rate: {money(s.rate)}
              </div>
            </div>
          ))}
        </div>
      )}

     {cm.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 6 }}>
            COMPRESSOR RPM ({cm.length})
          </div>
          {cm.map((c, i) => (
            <div key={i} style={{
              background: '#FEF3C7',
              borderRadius: 6,
              padding: '8px 10px',
              marginTop: 4,
              fontSize: 12
            }}>
              <div >
                <span>Reading:</span>
                <span style={{ fontWeight: 600 }}>
                  {c.comp_rpm_start} → {c.comp_rpm_end}
                </span>
              </div>
              <div style={{ marginTop: 4 }}>
                Actual Hours: <strong>{c.com_actul_hr || '—'}</strong>
              </div>
            </div>
          ))}
        </div>
      )}

{/* Machine Reading Info (if available) */}
      {mr.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 4 }}>
            MACHINE READING
          </div>
          {mr.map((m, i) => (
            <div key={i} style={{
              background: '#FEF3C7',
              borderRadius: 6,
              padding: '6px 10px',
              fontSize: 12,
              marginTop: 4
            }}>
              <div>Reading: {m.machine_start} → {m.machine_end}</div>
              <div>Actual Hrs: <strong>{m.actual_machine_hr}</strong></div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}


/* Machine Reading Entry - New Rich Card */
// function MachineReadingEntry({ e }) {
//   return (
//     <div style={entryCardStyle('#0891B2')}>
//       <div style={entryHeaderStyle}>
//         <span style={{ fontWeight: 700, color: '#1E293B', fontSize: 13 }}>
//           🖥️ Machine Reading
//         </span>
//         <Tag color="#0891B2" bg="#ECFEFF">{e.time || e.created_at?.substring(11,16)}</Tag>
//       </div>

//       <ERow label="Project" value={e.project?.project_name || e.drilling_record?.project?.project_name} />
//       <ERow label="Operator" value={e.operator?.name} />
//       <ERow label="Machine ID" value={e.machine_id} />
//       <ERow label="Start → End" value={`${e.machine_start} → ${e.machine_end}`} />
//       <ERow label="Actual Hours" value={e.actual_machine_hr} />

//       {e.drilling_record && (
//         <div style={{ marginTop: 8, fontSize: 12, color: '#64748B' }}>
//           Linked to Drilling Record #{e.drilling_record.id}
//         </div>
//       )}
//     </div>
//   );
// }

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

function PurchaseVendorEntry({ e }) {
  const paid = Number(e.payment?.paid_amount || 0);
  const balance = Number(e.payment?.balance_amount || 0);
  const total = Number(e.total || 0);

  return (
    <div style={entryCardStyle('#EA580C')}>
      <div style={entryHeaderStyle}>
        <span style={{ fontWeight: 700, color: '#1E293B', fontSize: 13 }}>
          🏭 {e.vendor?.name || e.vendor?.vendor_name || `Vendor #${e.vendor_id}`}
        </span>
        <Tag color="#EA580C" bg="#FEF3C7">
          {e.date || e.created_at?.substring(0, 10)}
        </Tag>
      </div>

      <div style={{ marginTop: 8 }}>
        <ERow label="Project" value={e.project?.project_name} />
        <ERow label="Material" value={e.material_name} />
        <ERow label="About" value={e.about} />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
        <Tag color="#EA580C" bg="#FEF3C7">
          Qty: {e.qty} × ₹{e.price_per_unit}
        </Tag>
        <Tag color="#059669" bg="#DCFCE7">
          Total: {money(e.total)}
        </Tag>
      </div>

      {/* GST Information */}
      {e.gst_included === 1 && (
        <div style={{ marginTop: 8, fontSize: 12 }}>
          <ERow 
            label="GST" 
            value={`${e.gst_percent}% (CGST ${e.cgst_percent}% | SGST ${e.sgst_percent}%)`} 
          />
        </div>
      )}

      {/* Payment Status */}
      <div style={{ marginTop: 10, padding: '8px 10px', background: '#FEF3C7', borderRadius: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#92400E', marginBottom: 4 }}>
          PAYMENT STATUS
        </div>
        <div style={{ display: 'flex', gap: 12, fontSize: 13 }}>
          <span><strong>Total:</strong> {money(total)}</span>
          <span><strong>Paid:</strong> {money(paid)}</span>
          {balance > 0 && (
            <span style={{ color: '#EF4444', fontWeight: 600 }}>
              <strong>Balance:</strong> {money(balance)}
            </span>
          )}
        </div>
      </div>

      {e.remarks && <ERow label="Remarks" value={e.remarks} />}
    </div>
  );
}

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

/* Stock Update Entry */
function StockUpdateEntry({ e }) {
  return (
    <div style={entryCardStyle('#D97706')}>
      <div style={entryHeaderStyle}>
        <span style={{ fontWeight: 700, color: '#1E293B', fontSize: 13 }}>
          📦 {e.machine?.machine_name || `Machine #${e.machine_id}`}
        </span>
        <Tag color="#D97706" bg="#FFFBEB">{e.update_date || e.created_at?.substring(0,10)}</Tag>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
        {e.hrs && <Tag color="#D97706" bg="#FEF3C7">⏱ {e.hrs} Hrs</Tag>}
        {e.cost && <Tag color="#059669" bg="#DCFCE7">₹{e.cost}</Tag>}
      </div>
      <ERow label="Project"    value={e.project?.project_name} />
      <ERow label="Hammer"     value={e.hammer} />
      <ERow label="Bit"        value={e.bit} />
      <ERow label="Used Bit"   value={e.used_bit} />
      <ERow label="Capping"    value={e.capping} />
      <ERow label="Tamplet"    value={e.tamplet} />
      <ERow label="Damage"     value={e.damage_part} />
      <ERow label="Remarks"    value={e.remarks} />
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
            label="Work Logs"
            color="#2563EB" bg="#EFF6FF"
            entries={user.entries?.drilling}
            EntryComponent={DrillingEntry}
          />

{/* <EntriesSection label="Machine Reading" color="#0891B2" bg="#ECFEFF" entries={user.entries?.machine_reading} EntryComponent={MachineReadingEntry} /> */}

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


          <EntriesSection
            label="Stock Updates"
            color="#D97706" bg="#FFFBEB"
            entries={user.entries?.stock_update}
            EntryComponent={StockUpdateEntry}
          />


<EntriesSection
            label="Purchase / Vendor"
            color="#EA580C" 
            bg="#FEF3C7"
            entries={user.entries?.purches_vendor}
            EntryComponent={PurchaseVendorEntry}
          />


          {!user.entries?.drilling?.length &&
          !user.entries?.machine_reading?.length &&
          !user.entries?.expense?.length  &&
          !user.entries?.order?.length    &&
          !user.entries?.proforma?.length &&
          !user.entries?.income?.length   &&
          !user.entries?.stock_update?.length && 
          !user.entries?.purches_vendor?.length &&(
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
              {projects.map((p) => <option key={p.id} value={p.id}>{p.project_name} - {p.customer_name}</option>)}
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

        {/* ── INACTIVE USERS ─────────────────────────────── */}
        {d.inactive_users.length > 0 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <h2 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
                ⚠️ Inactive Users
              </h2>
              <span style={{ background: '#FEF3C7', color: '#92400E', fontSize: 12, fontWeight: 700, padding: '2px 10px', borderRadius: 20 }}>
                {d.inactive_users.length}
              </span>
            </div>
            {/* 2-col grid for inactive — compact horizontal cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 12, marginBottom: 32 }}>
              {d.inactive_users.map((u) => (
                <InactiveUserCard key={u.user_id} user={u} />
              ))}
            </div>
            <div style={{ height: 1, background: '#F1F5F9', marginBottom: 24 }} />
          </>
        )}

        {/* ── CATEGORY OVERVIEW ──────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <h2 style={{ fontSize: 13, fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.6px', margin: 0 }}>
            Category Overview
          </h2>
          <span style={{ background: '#F1F5F9', color: '#64748B', fontSize: 12, fontWeight: 700, padding: '2px 10px', borderRadius: 20 }}>
            {totalEntries} total
          </span>
        </div>
        {/* <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, marginBottom: 32 }}>
          {Object.entries(d.category_summary).map(([key, cat]) => (
            <CategoryCard key={key} catKey={key} cat={cat} maxCount={maxCount} />
          ))}
        </div> */}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, marginBottom: 32 }}>
          {Object.entries(d.category_summary)
            .filter(([key]) => key !== 'machine_reading' && key !== 'machineReading')  // ← HIDE MACHINE READING
            .map(([key, cat]) => (
              <CategoryCard 
                key={key} 
                catKey={key} 
                cat={cat} 
                maxCount={maxCount} 
              />
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

      </div>
    </div>
  );
};

export default DailyActivityDashboard;




