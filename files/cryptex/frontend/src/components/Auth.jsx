import { useState } from 'react';
import { authAPI } from '../api';

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username:'', password:'', email:'', first_name:'', last_name:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (mode === 'login') {
        const res = await authAPI.login(form.username, form.password);
        onLogin(res.data.access);
      } else {
        await authAPI.register(form);
        const res = await authAPI.login(form.username, form.password);
        onLogin(res.data.access);
      }
    } catch(err) {
      const d = err.response?.data;
      if (d) {
        const msgs = Object.entries(d).map(([k,v]) => `${k}: ${Array.isArray(v)?v.join(', '):v}`);
        setError(msgs.join(' | '));
      } else setError('Connection failed. Make sure Django server is running.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)',position:'relative',overflow:'hidden'}}>
      {/* Background grid */}
      <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(0,229,255,0.03) 1px, transparent 1px),linear-gradient(90deg, rgba(0,229,255,0.03) 1px, transparent 1px)',backgroundSize:'40px 40px',pointerEvents:'none'}} />
      {/* Glow orbs */}
      <div style={{position:'absolute',top:'20%',left:'15%',width:400,height:400,background:'radial-gradient(circle, rgba(0,229,255,0.06) 0%, transparent 70%)',pointerEvents:'none'}} />
      <div style={{position:'absolute',bottom:'20%',right:'15%',width:300,height:300,background:'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)',pointerEvents:'none'}} />

      <div style={{width:'100%',maxWidth:420,padding:'0 24px',position:'relative',zIndex:1}}>
        {/* Logo */}
        <div style={{textAlign:'center',marginBottom:40}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:12,marginBottom:8}}>
            <div style={{width:44,height:44,borderRadius:'50%',background:'linear-gradient(135deg,var(--accent),var(--accent2))',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:20,color:'#000'}}>₿</div>
            <span style={{fontSize:28,fontWeight:700,letterSpacing:-1}}>
              <span style={{color:'var(--accent)'}}>Crypt</span>ex
            </span>
          </div>
          <p style={{color:'var(--text2)',fontSize:14}}>Professional Crypto Trading Platform</p>
        </div>

        {/* Card */}
        <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:16,padding:32}}>
          {/* Tabs */}
          <div style={{display:'flex',background:'var(--bg3)',borderRadius:10,padding:4,marginBottom:28}}>
            {['login','register'].map(m => (
              <button key={m} onClick={() => {setMode(m);setError('');}} style={{flex:1,padding:'9px 0',borderRadius:8,border:'none',cursor:'pointer',fontWeight:600,fontSize:14,transition:'all 0.2s',
                background: mode===m ? 'var(--accent)' : 'transparent',
                color: mode===m ? '#000' : 'var(--text2)'}}>
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
                <div>
                  <label style={{fontSize:12,color:'var(--text2)',display:'block',marginBottom:6}}>First Name</label>
                  <input value={form.first_name} onChange={e=>setForm({...form,first_name:e.target.value})} placeholder="Alex" style={inputStyle} />
                </div>
                <div>
                  <label style={{fontSize:12,color:'var(--text2)',display:'block',marginBottom:6}}>Last Name</label>
                  <input value={form.last_name} onChange={e=>setForm({...form,last_name:e.target.value})} placeholder="Chen" style={inputStyle} />
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div style={{marginBottom:16}}>
                <label style={{fontSize:12,color:'var(--text2)',display:'block',marginBottom:6}}>Email</label>
                <input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com" style={inputStyle} required />
              </div>
            )}

            <div style={{marginBottom:16}}>
              <label style={{fontSize:12,color:'var(--text2)',display:'block',marginBottom:6}}>Username</label>
              <input value={form.username} onChange={e=>setForm({...form,username:e.target.value})} placeholder="your_username" style={inputStyle} required />
            </div>

            <div style={{marginBottom:24}}>
              <label style={{fontSize:12,color:'var(--text2)',display:'block',marginBottom:6}}>Password</label>
              <input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="••••••••" style={inputStyle} required />
            </div>

            {error && <div style={{background:'rgba(255,71,87,0.1)',border:'1px solid rgba(255,71,87,0.3)',color:'var(--red)',padding:'10px 14px',borderRadius:8,fontSize:13,marginBottom:16}}>{error}</div>}

            <button type="submit" disabled={loading} style={{width:'100%',padding:'13px',border:'none',borderRadius:10,background:loading?'var(--border)':'linear-gradient(135deg,var(--accent),#00b4cc)',color:loading?'var(--text2)':'#000',fontWeight:700,fontSize:15,cursor:loading?'not-allowed':'pointer',transition:'all 0.2s'}}>
              {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {mode === 'login' && (
            <div style={{marginTop:20,padding:'14px',background:'rgba(0,229,255,0.04)',border:'1px solid rgba(0,229,255,0.15)',borderRadius:10,fontSize:13}}>
              <p style={{color:'var(--text2)',marginBottom:4}}>Demo account:</p>
              <p style={{color:'var(--accent)',fontFamily:'var(--mono)'}}>demo / demo1234</p>
            </div>
          )}
        </div>

        <p style={{textAlign:'center',marginTop:20,color:'var(--text3)',fontSize:12}}>
          Paper trading only — no real funds
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  width:'100%', padding:'11px 14px', background:'var(--bg3)',
  border:'1px solid var(--border)', borderRadius:9, color:'var(--text)',
  fontSize:14, outline:'none',
};
