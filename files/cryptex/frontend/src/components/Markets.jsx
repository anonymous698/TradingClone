import { useState } from 'react';

const fmt = (n, d=2) => {
  if (n >= 1e9) return `$${(n/1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n/1e6).toFixed(1)}M`;
  return `$${Number(n).toLocaleString('en',{minimumFractionDigits:d,maximumFractionDigits:d})}`;
};

const COIN_ICONS = {
  BTC:'₿', ETH:'Ξ', BNB:'◈', SOL:'◎', XRP:'✕', ADA:'₳',
  AVAX:'🔺', DOGE:'Ð', DOT:'●', MATIC:'⬟', LTC:'Ł', LINK:'⬡', UNI:'🦄', ATOM:'⚛', TRX:'⬡'
};

export default function Markets({ markets, onTrade }) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('market_cap');
  const [sortDir, setSortDir] = useState('desc');

  const filtered = markets
    .filter(c => c.symbol.includes(search.toUpperCase()) || c.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b) => {
      const v = sortDir === 'desc' ? b[sortBy] - a[sortBy] : a[sortBy] - b[sortBy];
      return v;
    });

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortBy(col); setSortDir('desc'); }
  };

  const SortBtn = ({col, label}) => (
    <span onClick={() => toggleSort(col)} style={{cursor:'pointer',userSelect:'none',display:'flex',alignItems:'center',gap:4}}>
      {label}
      <span style={{opacity: sortBy===col ? 1 : 0.3, fontSize:10}}>
        {sortBy===col ? (sortDir==='desc'?'▼':'▲') : '⇅'}
      </span>
    </span>
  );

  return (
    <div>
      {/* Stats row */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
        {[
          {label:'Total Coins', value: markets.length, sub:'Listed'},
          {label:'Total Mkt Cap', value: fmt(markets.reduce((s,c)=>s+c.market_cap,0),0), sub:'Combined'},
          {label:'24h Volume', value: fmt(markets.reduce((s,c)=>s+c.volume_24h,0),0), sub:'Trading vol.'},
          {label:'Gainers', value: markets.filter(c=>c.change_24h>0).length, sub:`of ${markets.length} coins`},
        ].map(s => (
          <div key={s.label} style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:12,padding:'16px 20px'}}>
            <p style={{fontSize:11,color:'var(--text3)',textTransform:'uppercase',letterSpacing:1,marginBottom:6}}>{s.label}</p>
            <p style={{fontSize:22,fontWeight:700,fontFamily:'var(--mono)',marginBottom:2}}>{s.value}</p>
            <p style={{fontSize:12,color:'var(--text2)'}}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:16,overflow:'hidden'}}>
        <div style={{padding:'16px 20px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
          <input
            value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Search coins..."
            style={{padding:'9px 14px',background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:9,color:'var(--text)',fontSize:14,outline:'none',flex:1,minWidth:200}}
          />
          <span style={{fontSize:13,color:'var(--text2)'}}>{filtered.length} assets</span>
        </div>

        <div style={{overflowX:'auto',WebkitOverflowScrolling:'touch'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{borderBottom:'1px solid var(--border)',background:'rgba(255,255,255,0.02)'}}>
                {[
                  {col:null, label:'#'},
                  {col:null, label:'Asset'},
                  {col:'price', label:'Price'},
                  {col:'change_24h', label:'24h Change'},
                  {col:'high_24h', label:'24h High'},
                  {col:'low_24h', label:'24h Low'},
                  {col:'volume_24h', label:'Volume'},
                  {col:'market_cap', label:'Mkt Cap'},
                  {col:null, label:'Action'},
                ].map(({col,label},i) => (
                  <th key={i} style={{padding:'12px 16px',textAlign:i===0?'center':'left',fontSize:11,fontWeight:600,color:'var(--text3)',textTransform:'uppercase',letterSpacing:0.8,whiteSpace:'nowrap'}}>
                    {col ? <SortBtn col={col} label={label} /> : label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((coin, idx) => (
                <tr key={coin.symbol} style={{borderBottom:'1px solid rgba(30,45,69,0.6)',transition:'background 0.15s',cursor:'pointer'}}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{padding:'14px 16px',textAlign:'center',fontSize:12,color:'var(--text3)',fontFamily:'var(--mono)'}}>{idx+1}</td>
                  <td style={{padding:'14px 16px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:12}}>
                      <div style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,rgba(0,229,255,0.15),rgba(124,58,237,0.15))',border:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:700,color:'var(--accent)',flexShrink:0}}>
                        {COIN_ICONS[coin.symbol] || coin.symbol[0]}
                      </div>
                      <div>
                        <p style={{fontWeight:600,fontSize:14}}>{coin.name}</p>
                        <p style={{fontSize:12,color:'var(--text3)',fontFamily:'var(--mono)'}}>{coin.symbol}/USDT</p>
                      </div>
                    </div>
                  </td>
                  <td style={{padding:'14px 16px',fontFamily:'var(--mono)',fontWeight:600,fontSize:14}}>
                    ${coin.price < 1 ? coin.price.toFixed(4) : coin.price.toLocaleString('en',{minimumFractionDigits:2,maximumFractionDigits:2})}
                  </td>
                  <td style={{padding:'14px 16px'}}>
                    <span className={coin.change_24h >= 0 ? 'badge-green' : 'badge-red'}>
                      {coin.change_24h >= 0 ? '+' : ''}{coin.change_24h?.toFixed(2)}%
                    </span>
                  </td>
                  <td style={{padding:'14px 16px',fontFamily:'var(--mono)',fontSize:13,color:'var(--green)'}}>
                    ${coin.high_24h < 1 ? coin.high_24h.toFixed(4) : coin.high_24h.toLocaleString('en',{minimumFractionDigits:2})}
                  </td>
                  <td style={{padding:'14px 16px',fontFamily:'var(--mono)',fontSize:13,color:'var(--red)'}}>
                    ${coin.low_24h < 1 ? coin.low_24h.toFixed(4) : coin.low_24h.toLocaleString('en',{minimumFractionDigits:2})}
                  </td>
                  <td style={{padding:'14px 16px',fontFamily:'var(--mono)',fontSize:13,color:'var(--text2)'}}>{fmt(coin.volume_24h,0)}</td>
                  <td style={{padding:'14px 16px',fontFamily:'var(--mono)',fontSize:13,color:'var(--text2)'}}>{fmt(coin.market_cap,0)}</td>
                  <td style={{padding:'14px 16px'}}>
                    <button onClick={() => onTrade(coin.symbol)} style={{padding:'6px 16px',background:'rgba(0,229,255,0.1)',border:'1px solid rgba(0,229,255,0.3)',color:'var(--accent)',borderRadius:7,cursor:'pointer',fontSize:13,fontWeight:600,transition:'all 0.15s',whiteSpace:'nowrap'}}
                      onMouseEnter={e=>{e.target.style.background='rgba(0,229,255,0.2)'}}
                      onMouseLeave={e=>{e.target.style.background='rgba(0,229,255,0.1)'}}>
                      Trade
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
