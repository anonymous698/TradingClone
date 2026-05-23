import { useState, useEffect, useCallback } from 'react';
import { marketAPI, tradingAPI } from '../api';
import Markets from './Markets';
import Trade from './Trade';
import Portfolio from './Portfolio';
import Orders from './Orders';
import Wallet from './Wallet';

const NAV = [
  { id:'markets', label:'Markets', icon:'📊' },
  { id:'trade', label:'Trade', icon:'⚡' },
  { id:'portfolio', label:'Portfolio', icon:'💼' },
  { id:'orders', label:'Orders', icon:'📋' },
  { id:'wallet', label:'Wallet', icon:'💰' },
];

export default function Dashboard({ onLogout }) {
  const [tab, setTab] = useState('markets');
  const [markets, setMarkets] = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [account, setAccount] = useState(null);
  const [selectedCoin, setSelectedCoin] = useState('BTC');
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const [mkt, port, acc] = await Promise.all([
        marketAPI.getMarkets(),
        tradingAPI.getPortfolio(),
        tradingAPI.getAccount(),
      ]);
      setMarkets(mkt.data);
      setPortfolio(port.data);
      setAccount(acc.data);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 15000);
    return () => clearInterval(interval);
  }, [refresh]);

  const tradeCoin = (symbol) => {
    setSelectedCoin(symbol);
    setTab('trade');
  };

  if (loading) return (
    <div style={{height:'100vh',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:16}}>
      <div style={{width:48,height:48,borderRadius:'50%',border:'3px solid var(--border)',borderTopColor:'var(--accent)',animation:'spin 1s linear infinite'}} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <p style={{color:'var(--text2)'}}>Loading Cryptex...</p>
    </div>
  );

  return (
    <div style={{display:'flex',height:'100vh',overflow:'hidden'}}>
      {/* Sidebar */}
      <aside style={{width:220,background:'var(--bg2)',borderRight:'1px solid var(--border)',display:'flex',flexDirection:'column',flexShrink:0}}>
        {/* Logo */}
        <div style={{padding:'20px 20px 16px',borderBottom:'1px solid var(--border)'}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,var(--accent),var(--accent2))',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:18,color:'#000'}}>₿</div>
            <span style={{fontSize:20,fontWeight:700,letterSpacing:-0.5}}>
              <span style={{color:'var(--accent)'}}>Crypt</span>ex
            </span>
          </div>
        </div>

        {/* Balance */}
        {portfolio && (
          <div style={{padding:'16px 20px',borderBottom:'1px solid var(--border)',background:'rgba(0,229,255,0.03)'}}>
            <p style={{fontSize:11,color:'var(--text3)',marginBottom:4,textTransform:'uppercase',letterSpacing:1}}>Total Portfolio</p>
            <p style={{fontSize:20,fontWeight:700,color:'var(--text)',fontFamily:'var(--mono)'}}>${portfolio.total_value?.toLocaleString('en',{minimumFractionDigits:2,maximumFractionDigits:2})}</p>
            <p style={{fontSize:12,color:'var(--text2)',marginTop:2}}>Available: <span style={{color:'var(--accent)',fontFamily:'var(--mono)'}}>${portfolio.usd_balance?.toLocaleString('en',{minimumFractionDigits:2,maximumFractionDigits:2})}</span></p>
          </div>
        )}

        {/* Nav */}
        <nav style={{flex:1,padding:'12px 12px',display:'flex',flexDirection:'column',gap:2}}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setTab(n.id)} style={{
              display:'flex',alignItems:'center',gap:12,padding:'11px 12px',borderRadius:10,border:'none',
              cursor:'pointer',textAlign:'left',fontWeight:500,fontSize:14,transition:'all 0.15s',
              background: tab===n.id ? 'rgba(0,229,255,0.1)' : 'transparent',
              color: tab===n.id ? 'var(--accent)' : 'var(--text2)',
              borderLeft: tab===n.id ? '2px solid var(--accent)' : '2px solid transparent',
            }}>
              <span style={{fontSize:16}}>{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>

        {/* User */}
        <div style={{padding:'16px 20px',borderTop:'1px solid var(--border)'}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
            <div style={{width:34,height:34,borderRadius:'50%',background:'linear-gradient(135deg,var(--accent2),#9c5af7)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:700,color:'#fff'}}>
              {account?.first_name?.[0] || account?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <p style={{fontSize:13,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{account?.first_name ? `${account.first_name} ${account.last_name}` : account?.username}</p>
              <p style={{fontSize:11,color:'var(--text3)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{account?.email}</p>
            </div>
          </div>
          <button onClick={onLogout} style={{width:'100%',padding:'8px',background:'rgba(255,71,87,0.08)',border:'1px solid rgba(255,71,87,0.2)',color:'var(--red)',borderRadius:8,cursor:'pointer',fontSize:13,fontWeight:500}}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{flex:1,overflow:'auto',background:'var(--bg)'}}>
        {/* Top bar */}
        <div style={{background:'var(--bg2)',borderBottom:'1px solid var(--border)',padding:'0 24px',height:56,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:10}}>
          <div>
            <h1 style={{fontSize:18,fontWeight:700,margin:0}}>{NAV.find(n=>n.id===tab)?.label}</h1>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:16}}>
            <div style={{width:8,height:8,borderRadius:'50%',background:'var(--green)',boxShadow:'0 0 8px var(--green)'}} />
            <span style={{fontSize:12,color:'var(--text2)'}}>Live Market Data</span>
          </div>
        </div>

        <div style={{padding:24}}>
          {tab === 'markets' && <Markets markets={markets} onTrade={tradeCoin} />}
          {tab === 'trade' && <Trade markets={markets} selectedCoin={selectedCoin} onOrderFilled={refresh} />}
          {tab === 'portfolio' && <Portfolio portfolio={portfolio} markets={markets} onTrade={tradeCoin} />}
          {tab === 'orders' && <Orders />}
          {tab === 'wallet' && <Wallet portfolio={portfolio} onDeposit={refresh} />}
        </div>
      </main>
    </div>
  );
}
