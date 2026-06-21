const fs = require('fs');
const files = [
  'resources/react/views/pages/report/SubContractLadger.js',
  'resources/react/views/pages/report/RegularProjectsLadger.js',
  'resources/react/views/pages/report/PurchaseVendorLadger.js',
  'resources/react/views/pages/report/VendorLadger.js'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Replace Table Headers
  const oldHeader = `<CTableHeaderCell>Date</CTableHeaderCell>
                                        <CTableHeaderCell>Particulars</CTableHeaderCell>
                                        <CTableHeaderCell>Vch Type</CTableHeaderCell>
                                        <CTableHeaderCell>Vch No.</CTableHeaderCell>
                                        <CTableHeaderCell className="text-end">Debit</CTableHeaderCell>
                                        <CTableHeaderCell className="text-end">Credit</CTableHeaderCell>
                                        <CTableHeaderCell className="text-end">Balance</CTableHeaderCell>`;
  const newHeader = `<CTableHeaderCell>Date</CTableHeaderCell>
                                        <CTableHeaderCell>Voucher No</CTableHeaderCell>
                                        <CTableHeaderCell>Particulars</CTableHeaderCell>
                                        <CTableHeaderCell className="text-end">Debit</CTableHeaderCell>
                                        <CTableHeaderCell className="text-end">Credit</CTableHeaderCell>
                                        <CTableHeaderCell className="text-end">Running Balance</CTableHeaderCell>`;
  
  content = content.replace(oldHeader, newHeader);

  // Replace Table Rows in the map function
  const oldRow = `<CTableDataCell>{entry.date}</CTableDataCell>
                                            <CTableDataCell>{entry.particulars}</CTableDataCell>
                                            <CTableDataCell>{entry.vch_type}</CTableDataCell>
                                            <CTableDataCell>{entry.vch_no}</CTableDataCell>
                                            <CTableDataCell className="text-end">
                                              {entry.debit > 0 ? formatCurrency(entry.debit) : ''}
                                            </CTableDataCell>
                                            <CTableDataCell className="text-end">
                                              {entry.credit > 0 ? formatCurrency(entry.credit) : ''}
                                            </CTableDataCell>
                                            <CTableDataCell className="text-end text-muted">₹{formatCurrency(Math.abs(entry.balance))} {entry.balance >= 0 ? 'CR' : 'DR'}</CTableDataCell>`;
  
  const newRow = `<CTableDataCell>{entry.date}</CTableDataCell>
                                            <CTableDataCell>{entry.vch_type} - {entry.vch_no}</CTableDataCell>
                                            <CTableDataCell>{entry.particulars}</CTableDataCell>
                                            <CTableDataCell className="text-end text-danger">
                                              {entry.debit > 0 ? formatCurrency(entry.debit) : ''}
                                            </CTableDataCell>
                                            <CTableDataCell className="text-end text-success">
                                              {entry.credit > 0 ? formatCurrency(entry.credit) : ''}
                                            </CTableDataCell>
                                            <CTableDataCell className="text-end fw-bold">₹{formatCurrency(Math.abs(entry.balance))} {entry.balance_type}</CTableDataCell>`;
                                            
  content = content.replace(oldRow, newRow);

  // Replace Opening Balance Row
  const oldOpBalRow = `<CTableDataCell className="fw-bold">{startDate || ''}</CTableDataCell>
                                        <CTableDataCell className="fw-bold text-center" colSpan="3">
                                          {parseFloat(summary.opening_balance) >= 0 ? 'CR Opening Balance' : 'DR Opening Balance'}
                                        </CTableDataCell>
                                        <CTableDataCell className="text-end fw-bold">
                                          {parseFloat(summary.opening_balance) < 0 ? formatCurrency(Math.abs(summary.opening_balance)) : '-'}
                                        </CTableDataCell>
                                        <CTableDataCell className="text-end fw-bold">
                                          {parseFloat(summary.opening_balance) > 0 ? formatCurrency(summary.opening_balance) : '-'}
                                        </CTableDataCell>
                                        <CTableDataCell className="text-end fw-bold">₹{formatCurrency(Math.abs(summary.opening_balance))}</CTableDataCell>`;

  const newOpBalRow = `<CTableDataCell className="fw-bold">{startDate || ''}</CTableDataCell>
                                        <CTableDataCell></CTableDataCell>
                                        <CTableDataCell className="fw-bold text-center">
                                          {parseFloat(summary.opening_balance) >= 0 ? 'CR Opening Balance' : 'DR Opening Balance'}
                                        </CTableDataCell>
                                        <CTableDataCell className="text-end fw-bold text-danger">
                                          {parseFloat(summary.opening_balance) < 0 ? formatCurrency(Math.abs(summary.opening_balance)) : '-'}
                                        </CTableDataCell>
                                        <CTableDataCell className="text-end fw-bold text-success">
                                          {parseFloat(summary.opening_balance) > 0 ? formatCurrency(Math.abs(summary.opening_balance)) : '-'}
                                        </CTableDataCell>
                                        <CTableDataCell className="text-end fw-bold">₹{formatCurrency(Math.abs(summary.opening_balance))} {parseFloat(summary.opening_balance) >= 0 ? 'CR' : 'DR'}</CTableDataCell>`;
                                        
  content = content.replace(oldOpBalRow, newOpBalRow);

  // Replace Closing Balance Row
  const oldClBalRow = `<CTableDataCell className="fw-bold">{endDate || ''}</CTableDataCell>
                                        <CTableDataCell className="fw-bold text-center" colSpan="3">
                                          {parseFloat(summary.closing_balance) >= 0 ? 'CR Closing Balance' : 'DR Closing Balance'}
                                        </CTableDataCell>
                                        <CTableDataCell className="text-end fw-bold">
                                          {parseFloat(summary.closing_balance) < 0 ? formatCurrency(Math.abs(summary.closing_balance)) : '-'}
                                        </CTableDataCell>
                                        <CTableDataCell className="text-end fw-bold">
                                          {parseFloat(summary.closing_balance) > 0 ? formatCurrency(summary.closing_balance) : '-'}
                                        </CTableDataCell>
                                        <CTableDataCell className="text-end fw-bold">₹{formatCurrency(Math.abs(summary.closing_balance))}</CTableDataCell>`;

  const newClBalRow = `<CTableDataCell className="fw-bold">{endDate || ''}</CTableDataCell>
                                        <CTableDataCell></CTableDataCell>
                                        <CTableDataCell className="fw-bold text-center">
                                          {parseFloat(summary.closing_balance) >= 0 ? 'CR Closing Balance' : 'DR Closing Balance'}
                                        </CTableDataCell>
                                        <CTableDataCell className="text-end fw-bold text-danger">
                                          {parseFloat(summary.closing_balance) < 0 ? formatCurrency(Math.abs(summary.closing_balance)) : '-'}
                                        </CTableDataCell>
                                        <CTableDataCell className="text-end fw-bold text-success">
                                          {parseFloat(summary.closing_balance) > 0 ? formatCurrency(Math.abs(summary.closing_balance)) : '-'}
                                        </CTableDataCell>
                                        <CTableDataCell className="text-end fw-bold">₹{formatCurrency(Math.abs(summary.closing_balance))} {parseFloat(summary.closing_balance) >= 0 ? 'CR' : 'DR'}</CTableDataCell>`;
                                        
  content = content.replace(oldClBalRow, newClBalRow);

  fs.writeFileSync(file, content);
  console.log('Updated table layout in ' + file);
});
