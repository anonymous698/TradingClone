import { useState } from 'react';
import { tradingAPI } from '../api';

export default function Wallet({ portfolio, onDeposit }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const deposit = async () => {
    setMsg(null); setLoading(true);
    try {
      await tradingAPI.deposit(parseFloat(amount));
      setMsg({ type:'success', text:`Successfully deposited $${parseFloat(amount).toLocaleString('en',{minimumFractionDigits:2})}` });
      setAmount('');
      onDeposit();
    } catch(e) {
      setMsg({ type:'error', text: e.response?.data?.error || 'Deposit failed' });
    } finally { setLoading(false); }
  };

  const quickAmounts = [1000, 5000, 10000, 50000];

  return (
    <div style={{maxWidth:700}}>
      {/* Balance */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:24}}>
        <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:12,padding:'20px 24px',borderLeft:'3px solid var(--accent)'}}>
          <p style={{fontSize:11,color:'var(--text3)',textTransform:'uppercase',letterSpacing:1,marginBottom:8}}>USD Balance</p>
          <p style={{fontSize:28,fontWeight:700,fontFamily:'var(--mono)',color:'var(--accent)'}}>
            ${portfolio?.usd_balance?.toLocaleString('en',{minimumFractionDigits:2})}
          </p>
          <p style={{fontSize:12,color:'var(--text2)',marginTop:4}}>Available for trading</p>
        </div>
        <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:12,padding:'20px 24px',borderLeft:'3px solid var(--green)'}}>
          <p style={{fontSize:11,color:'var(--text3)',textTransform:'uppercase',letterSpacing:1,marginBottom:8}}>Total Portfolio</p>
          <p style={{fontSize:28,fontWeight:700,fontFamily:'var(--mono)',color:'var(--green)'}}>
            ${portfolio?.total_value?.toLocaleString('en',{minimumFractionDigits:2})}
          </p>
          <p style={{fontSize:12,color:'var(--text2)',marginTop:4}}>Including all positions</p>
        </div>
      </div>

      {/* Deposit */}
      <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:16,padding:28,marginBottom:20}}>
        <h3 style={{fontWeight:700,fontSize:17,marginBottom:4}}>Deposit Funds</h3>
        <p style={{fontSize:13,color:'var(--text2)',marginBottom:20}}>Add trading funds to your account</p>

        <div style={{marginBottom:16}}>
          <label style={{fontSize:12,color:'var(--text3)',display:'block',marginBottom:8,textTransform:'uppercase',letterSpacing:0.8}}>Quick Select</label>
          <div style={{display:'flex',gap:10}}>
            {quickAmounts.map(a => (
              <button key={a} onClick={() => setAmount(a.toString())} style={{
                padding:'8px 18px',border:'1px solid',borderRadius:8,cursor:'pointer',fontSize:13,fontWeight:600,
                borderColor: amount===a.toString() ? 'var(--accent)' : 'var(--border)',
                background: amount===a.toString() ? 'rgba(0,229,255,0.08)' : 'transparent',
                color: amount===a.toString() ? 'var(--accent)' : 'var(--text2)',
              }}>${a.toLocaleString('en')}</button>
            ))}
          </div>
        </div>

        <div style={{marginBottom:20}}>
          <label style={{fontSize:12,color:'var(--text3)',display:'block',marginBottom:8,textTransform:'uppercase',letterSpacing:0.8}}>Custom Amount (USD)</label>
          <div style={{display:'flex',gap:12}}>
            <input
              value={amount} onChange={e=>setAmount(e.target.value)}
              type="number" min="1" placeholder="Enter amount..."
              style={{flex:1,padding:'12px 16px',background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:10,color:'var(--text)',fontSize:15,outline:'none',fontFamily:'var(--mono)'}}
            />
            <button onClick={deposit} disabled={loading || !amount || parseFloat(amount) <= 0}
              style={{padding:'12px 28px',border:'none',borderRadius:10,cursor:loading?'not-allowed':'pointer',
                fontWeight:700,fontSize:14,background:loading?'var(--border)':'linear-gradient(135deg,var(--accent),#00b4cc)',
                color:loading?'var(--text2)':'#000'}}>
              {loading ? 'Processing...' : 'Deposit'}
            </button>
          </div>
        </div>

        {msg && (
          <div style={{padding:'12px 16px',borderRadius:9,fontSize:13,
            background:msg.type==='success'?'rgba(0,214,143,0.1)':'rgba(255,71,87,0.1)',
            border:`1px solid ${msg.type==='success'?'rgba(0,214,143,0.3)':'rgba(255,71,87,0.3)'}`,
            color:msg.type==='success'?'var(--green)':'var(--red)'
          }}>{msg.text}</div>
        )}
      </div>

      {/* Info */}
      <div style={{background:'rgba(0,229,255,0.04)',border:'1px solid rgba(0,229,255,0.15)',borderRadius:12,padding:'16px 20px'}}>
        <p style={{fontWeight:600,marginBottom:8,color:'var(--accent)'}}></p>
        <p style={{fontSize:13,color:'var(--text2)',lineHeight:1.6}}>
          
        </p>
      </div>
    </div>
  );
}
