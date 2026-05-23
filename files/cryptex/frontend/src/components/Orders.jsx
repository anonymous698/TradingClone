import { useState, useEffect } from 'react';
import { tradingAPI } from '../api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [tab, setTab] = useState('orders');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [ord, txn] = await Promise.all([tradingAPI.getOrders(), tradingAPI.getTransactions()]);
        setOrders(ord.data);
        setTransactions(txn.data);
      } catch(e) {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  const fmtDate = (d) => new Date(d).toLocaleString('en',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});

  return (
    <div>
      {/* Sub tabs */}
      <div style={{display:'flex',gap:8,marginBottom:20}}>
        {[{id:'orders',label:'Order History'},{id:'txns',label:'Transactions'}].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding:'9px 20px',border:'1px solid',borderRadius:9,cursor:'pointer',fontWeight:600,fontSize:14,
            borderColor: tab===t.id ? 'var(--accent)' : 'var(--border)',
            background: tab===t.id ? 'rgba(0,229,255,0.08)' : 'transparent',
            color: tab===t.id ? 'var(--accent)' : 'var(--text2)',
          }}>{t.label}</button>
        ))}
      </div>

      {loading ? <div style={{textAlign:'center',padding:60,color:'var(--text2)'}}>Loading...</div> : (

        tab === 'orders' ? (
          <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:16,overflow:'hidden'}}>
            {orders.length === 0 ? (
              <div style={{padding:60,textAlign:'center',color:'var(--text2)'}}>
                <p style={{fontSize:32,marginBottom:12}}>📋</p>
                <p>No orders yet. Place your first trade!</p>
              </div>
            ) : (
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead>
                  <tr style={{borderBottom:'1px solid var(--border)',background:'rgba(255,255,255,0.02)'}}>
                    {['Time','Pair','Side','Type','Quantity','Filled Price','Total','Fee','Status'].map(h => (
                      <th key={h} style={{padding:'12px 16px',textAlign:'left',fontSize:11,color:'var(--text3)',fontWeight:600,textTransform:'uppercase',letterSpacing:0.8}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id} style={{borderBottom:'1px solid rgba(30,45,69,0.5)'}}>
                      <td style={{padding:'12px 16px',fontSize:12,color:'var(--text2)'}}>{fmtDate(o.created_at)}</td>
                      <td style={{padding:'12px 16px',fontWeight:600,fontSize:13}}>{o.symbol}/USDT</td>
                      <td style={{padding:'12px 16px'}}>
                        <span className={o.side==='buy'?'badge-green':'badge-red'}>{o.side.toUpperCase()}</span>
                      </td>
                      <td style={{padding:'12px 16px',fontSize:13,color:'var(--text2)',textTransform:'capitalize'}}>{o.order_type}</td>
                      <td style={{padding:'12px 16px',fontFamily:'var(--mono)',fontSize:13}}>{parseFloat(o.quantity).toFixed(6)}</td>
                      <td style={{padding:'12px 16px',fontFamily:'var(--mono)',fontSize:13}}>${parseFloat(o.filled_price||0).toLocaleString('en',{minimumFractionDigits:2})}</td>
                      <td style={{padding:'12px 16px',fontFamily:'var(--mono)',fontWeight:600,fontSize:13}}>${parseFloat(o.total_value||0).toFixed(2)}</td>
                      <td style={{padding:'12px 16px',fontFamily:'var(--mono)',fontSize:12,color:'var(--text2)'}}>${parseFloat(o.fee||0).toFixed(2)}</td>
                      <td style={{padding:'12px 16px'}}>
                        <span style={{
                          padding:'3px 8px',borderRadius:5,fontSize:11,fontWeight:600,
                          background: o.status==='filled'?'rgba(0,214,143,0.1)' : 'rgba(255,214,0,0.1)',
                          color: o.status==='filled'?'var(--green)' : 'var(--yellow)',
                        }}>{o.status.toUpperCase()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:16,overflow:'hidden'}}>
            {transactions.length === 0 ? (
              <div style={{padding:60,textAlign:'center',color:'var(--text2)'}}>
                <p style={{fontSize:32,marginBottom:12}}>💸</p>
                <p>No transactions yet.</p>
              </div>
            ) : (
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead>
                  <tr style={{borderBottom:'1px solid var(--border)',background:'rgba(255,255,255,0.02)'}}>
                    {['Time','Type','Asset','Amount (USD)','Quantity','Price','Fee','Balance After'].map(h => (
                      <th key={h} style={{padding:'12px 16px',textAlign:'left',fontSize:11,color:'var(--text3)',fontWeight:600,textTransform:'uppercase',letterSpacing:0.8}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(t => (
                    <tr key={t.id} style={{borderBottom:'1px solid rgba(30,45,69,0.5)'}}>
                      <td style={{padding:'12px 16px',fontSize:12,color:'var(--text2)'}}>{fmtDate(t.created_at)}</td>
                      <td style={{padding:'12px 16px'}}>
                        <span style={{
                          padding:'3px 8px',borderRadius:5,fontSize:11,fontWeight:600,textTransform:'uppercase',
                          background: t.transaction_type==='buy'?'rgba(0,214,143,0.1)':t.transaction_type==='sell'?'rgba(255,71,87,0.1)':'rgba(0,229,255,0.1)',
                          color: t.transaction_type==='buy'?'var(--green)':t.transaction_type==='sell'?'var(--red)':'var(--accent)',
                        }}>{t.transaction_type}</span>
                      </td>
                      <td style={{padding:'12px 16px',fontWeight:600,fontSize:13}}>{t.symbol || 'USD'}</td>
                      <td style={{padding:'12px 16px',fontFamily:'var(--mono)',fontSize:13,color:parseFloat(t.usd_amount)>=0?'var(--green)':'var(--red)'}}>
                        {parseFloat(t.usd_amount)>=0?'+':''}${Math.abs(parseFloat(t.usd_amount)).toFixed(2)}
                      </td>
                      <td style={{padding:'12px 16px',fontFamily:'var(--mono)',fontSize:13,color:'var(--text2)'}}>
                        {t.quantity ? parseFloat(t.quantity).toFixed(6) : '-'}
                      </td>
                      <td style={{padding:'12px 16px',fontFamily:'var(--mono)',fontSize:13,color:'var(--text2)'}}>
                        {t.price ? `$${parseFloat(t.price).toLocaleString('en',{minimumFractionDigits:2})}` : '-'}
                      </td>
                      <td style={{padding:'12px 16px',fontFamily:'var(--mono)',fontSize:12,color:'var(--red)'}}>${parseFloat(t.fee||0).toFixed(2)}</td>
                      <td style={{padding:'12px 16px',fontFamily:'var(--mono)',fontWeight:600,fontSize:13}}>${parseFloat(t.balance_after||0).toLocaleString('en',{minimumFractionDigits:2})}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )
      )}
    </div>
  );
}
