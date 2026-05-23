import { useState, useEffect } from 'react';
import { marketAPI, tradingAPI } from '../api';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function Trade({ markets, selectedCoin, onOrderFilled }) {
  const [symbol, setSymbol] = useState(selectedCoin || 'BTC');
  const [side, setSide] = useState('buy');
  const [orderType, setOrderType] = useState('market');
  const [quantity, setQuantity] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [coinData, setCoinData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [chartData, setChartData] = useState([]);

  const coin = markets.find(m => m.symbol === symbol) || {};

  useEffect(() => {
    setSymbol(selectedCoin);
  }, [selectedCoin]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await marketAPI.getCoin(symbol);
        setCoinData(res.data);
        // Build chart from candles
        setChartData(res.data.candles?.map((c,i) => ({
          t: i,
          price: c.close,
          vol: c.volume,
        })) || []);
      } catch(e) {}
    };
    load();
  }, [symbol]);

  const totalCost = () => {
    const p = orderType === 'limit' ? parseFloat(limitPrice) : (coin.price || 0);
    const q = parseFloat(quantity) || 0;
    return (p * q).toFixed(2);
  };

  const fee = () => (parseFloat(totalCost()) * 0.001).toFixed(2);

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null); setLoading(true);
    try {
      const body = {
        symbol, side, order_type: orderType,
        quantity: parseFloat(quantity),
        ...(orderType === 'limit' ? { price: parseFloat(limitPrice) } : {}),
      };
      const res = await tradingAPI.placeOrder(body);
      setMsg({ type:'success', text:`✓ ${side.toUpperCase()} order filled @ $${res.data.filled_price?.toLocaleString('en',{minimumFractionDigits:2})} — Total: $${res.data.total?.toFixed(2)}` });
      setQuantity('');
      onOrderFilled();
    } catch(err) {
      setMsg({ type:'error', text: err.response?.data?.error || 'Order failed' });
    } finally { setLoading(false); }
  };

  const chartColor = (coinData?.change_24h || 0) >= 0 ? '#00d68f' : '#ff4757';

  return (
    <div style={{display:'grid',gridTemplateColumns:'1fr 340px',gap:24}}>
      {/* Chart side */}
      <div>
        {/* Coin selector */}
        <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:12,padding:'16px 20px',marginBottom:16,display:'flex',alignItems:'center',gap:16,flexWrap:'wrap'}}>
          <select value={symbol} onChange={e=>setSymbol(e.target.value)} style={{padding:'9px 14px',background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:9,color:'var(--text)',fontSize:15,fontWeight:600,outline:'none',cursor:'pointer'}}>
            {markets.map(m => <option key={m.symbol} value={m.symbol}>{m.symbol} — {m.name}</option>)}
          </select>
          {coin.price && (
            <>
              <span style={{fontSize:26,fontWeight:700,fontFamily:'var(--mono)'}}>
                ${coin.price < 1 ? coin.price.toFixed(4) : coin.price.toLocaleString('en',{minimumFractionDigits:2})}
              </span>
              <span className={coin.change_24h >= 0 ? 'badge-green' : 'badge-red'} style={{fontSize:14,padding:'4px 12px'}}>
                {coin.change_24h >= 0 ? '+' : ''}{coin.change_24h?.toFixed(2)}%
              </span>
              <div style={{marginLeft:'auto',display:'flex',gap:24}}>
                <div><p style={{fontSize:11,color:'var(--text3)'}}>24H HIGH</p><p style={{fontFamily:'var(--mono)',color:'var(--green)',fontWeight:600}}>${coin.high_24h?.toLocaleString('en',{minimumFractionDigits:2,maximumFractionDigits:4})}</p></div>
                <div><p style={{fontSize:11,color:'var(--text3)'}}>24H LOW</p><p style={{fontFamily:'var(--mono)',color:'var(--red)',fontWeight:600}}>${coin.low_24h?.toLocaleString('en',{minimumFractionDigits:2,maximumFractionDigits:4})}</p></div>
                <div><p style={{fontSize:11,color:'var(--text3)'}}>24H VOL</p><p style={{fontFamily:'var(--mono)',color:'var(--text2)',fontWeight:600}}>{(coin.volume_24h/1e6).toFixed(0)}M</p></div>
              </div>
            </>
          )}
        </div>

        {/* Chart */}
        <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:12,padding:'20px',height:360}}>
          <p style={{fontSize:12,color:'var(--text2)',marginBottom:12}}>Price Chart (90 days)</p>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData} margin={{top:5,right:5,left:0,bottom:5}}>
              <defs>
                <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="t" hide />
              <YAxis domain={['auto','auto']} tickFormatter={v=>v<1?v.toFixed(3):`$${v.toLocaleString('en',{maximumFractionDigits:0})}`} tick={{fontSize:11,fill:'#4a5a70'}} width={70} />
              <Tooltip
                contentStyle={{background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:8,fontSize:13}}
                labelStyle={{color:'var(--text2)'}}
                formatter={v=>[`$${v < 1 ? v.toFixed(4) : v.toLocaleString('en',{minimumFractionDigits:2})}`, 'Price']}
                labelFormatter={t=>`Day ${t}`}
              />
              <Area type="monotone" dataKey="price" stroke={chartColor} strokeWidth={2} fill="url(#cg)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Order book mock */}
        <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:12,padding:'16px 20px',marginTop:16}}>
          <p style={{fontSize:13,fontWeight:600,color:'var(--text2)',marginBottom:12}}>Order Book</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            <div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',fontSize:11,color:'var(--text3)',marginBottom:6,gap:8}}>
                <span>Price (USD)</span><span style={{textAlign:'right'}}>Amount</span>
              </div>
              {Array.from({length:8}).map((_,i) => {
                const p = (coin.price || 0) * (1 - (i+1)*0.0008);
                const a = (Math.random()*2+0.1).toFixed(4);
                return (
                  <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 1fr',fontSize:12,padding:'3px 0',gap:8,position:'relative'}}>
                    <div style={{position:'absolute',right:0,top:0,bottom:0,background:'rgba(0,214,143,0.05)',width:`${(8-i)*10}%`}} />
                    <span style={{color:'var(--green)',fontFamily:'var(--mono)'}}>{p < 1 ? p.toFixed(4) : p.toLocaleString('en',{minimumFractionDigits:2})}</span>
                    <span style={{textAlign:'right',color:'var(--text2)',fontFamily:'var(--mono)'}}>{a}</span>
                  </div>
                );
              })}
            </div>
            <div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',fontSize:11,color:'var(--text3)',marginBottom:6,gap:8}}>
                <span>Price (USD)</span><span style={{textAlign:'right'}}>Amount</span>
              </div>
              {Array.from({length:8}).map((_,i) => {
                const p = (coin.price || 0) * (1 + (i+1)*0.0008);
                const a = (Math.random()*2+0.1).toFixed(4);
                return (
                  <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 1fr',fontSize:12,padding:'3px 0',gap:8,position:'relative'}}>
                    <div style={{position:'absolute',right:0,top:0,bottom:0,background:'rgba(255,71,87,0.05)',width:`${(8-i)*10}%`}} />
                    <span style={{color:'var(--red)',fontFamily:'var(--mono)'}}>{p < 1 ? p.toFixed(4) : p.toLocaleString('en',{minimumFractionDigits:2})}</span>
                    <span style={{textAlign:'right',color:'var(--text2)',fontFamily:'var(--mono)'}}>{a}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Order form */}
      <div>
        <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:16,overflow:'hidden',position:'sticky',top:80}}>
          {/* Buy/Sell tabs */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr'}}>
            {['buy','sell'].map(s => (
              <button key={s} onClick={() => setSide(s)} style={{
                padding:'16px',border:'none',cursor:'pointer',fontWeight:700,fontSize:15,
                background: side===s ? (s==='buy'?'rgba(0,214,143,0.12)':'rgba(255,71,87,0.12)') : 'transparent',
                color: side===s ? (s==='buy'?'var(--green)':'var(--red)') : 'var(--text2)',
                borderBottom: side===s ? `2px solid ${s==='buy'?'var(--green)':'var(--red)'}` : '2px solid var(--border)',
              }}>
                {s.toUpperCase()}
              </button>
            ))}
          </div>

          <form onSubmit={submit} style={{padding:20}}>
            {/* Order type */}
            <div style={{marginBottom:16}}>
              <label style={{fontSize:12,color:'var(--text3)',display:'block',marginBottom:6,textTransform:'uppercase',letterSpacing:0.8}}>Order Type</label>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6}}>
                {['market','limit','stop'].map(t => (
                  <button key={t} type="button" onClick={() => setOrderType(t)} style={{
                    padding:'8px',border:'1px solid',borderRadius:8,cursor:'pointer',fontSize:12,fontWeight:600,
                    borderColor: orderType===t ? 'var(--accent)' : 'var(--border)',
                    background: orderType===t ? 'rgba(0,229,255,0.08)' : 'transparent',
                    color: orderType===t ? 'var(--accent)' : 'var(--text2)',
                  }}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>
                ))}
              </div>
            </div>

            {/* Available balance */}
            <div style={{background:'var(--bg3)',borderRadius:8,padding:'10px 14px',marginBottom:16,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontSize:12,color:'var(--text3)'}}>Available</span>
              <span style={{fontSize:13,fontWeight:600,fontFamily:'var(--mono)',color:'var(--accent)'}}>Loading...</span>
            </div>

            {/* Limit price */}
            {orderType !== 'market' && (
              <div style={{marginBottom:16}}>
                <label style={{fontSize:12,color:'var(--text3)',display:'block',marginBottom:6,textTransform:'uppercase',letterSpacing:0.8}}>
                  {orderType === 'limit' ? 'Limit' : 'Stop'} Price (USD)
                </label>
                <input value={limitPrice} onChange={e=>setLimitPrice(e.target.value)} type="number" step="any" min="0"
                  placeholder={coin.price?.toFixed(2) || '0.00'} style={iS} required />
              </div>
            )}

            {/* Quantity */}
            <div style={{marginBottom:8}}>
              <label style={{fontSize:12,color:'var(--text3)',display:'block',marginBottom:6,textTransform:'uppercase',letterSpacing:0.8}}>Amount ({symbol})</label>
              <input value={quantity} onChange={e=>setQuantity(e.target.value)} type="number" step="any" min="0"
                placeholder="0.00000000" style={iS} required />
            </div>

            {/* Percentage shortcuts */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6,marginBottom:16}}>
              {[25,50,75,100].map(p => (
                <button key={p} type="button" style={{padding:'6px',border:'1px solid var(--border)',borderRadius:6,background:'transparent',color:'var(--text2)',fontSize:12,cursor:'pointer'}}
                  onClick={() => {
                    const avail = 10000;
                    const price = coin.price || 1;
                    setQuantity(((avail * p/100) / price).toFixed(8));
                  }}>
                  {p}%
                </button>
              ))}
            </div>

            {/* Summary */}
            <div style={{background:'var(--bg3)',borderRadius:10,padding:'12px 14px',marginBottom:16}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                <span style={{fontSize:12,color:'var(--text3)'}}>Order Total</span>
                <span style={{fontSize:13,fontFamily:'var(--mono)',fontWeight:600}}>${totalCost()}</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                <span style={{fontSize:12,color:'var(--text3)'}}>Trading Fee (0.1%)</span>
                <span style={{fontSize:13,fontFamily:'var(--mono)',color:'var(--text2)'}}>-${fee()}</span>
              </div>
              <div style={{borderTop:'1px solid var(--border)',paddingTop:6,display:'flex',justifyContent:'space-between'}}>
                <span style={{fontSize:12,color:'var(--text2)',fontWeight:600}}>{side==='buy'?'You Pay':'You Receive'}</span>
                <span style={{fontSize:14,fontFamily:'var(--mono)',fontWeight:700,color:side==='buy'?'var(--red)':'var(--green)'}}>
                  ${side==='buy' ? (parseFloat(totalCost()) + parseFloat(fee())).toFixed(2) : (parseFloat(totalCost()) - parseFloat(fee())).toFixed(2)}
                </span>
              </div>
            </div>

            {msg && (
              <div style={{
                padding:'10px 14px',borderRadius:8,marginBottom:12,fontSize:13,
                background: msg.type==='success'?'rgba(0,214,143,0.1)':'rgba(255,71,87,0.1)',
                border: `1px solid ${msg.type==='success'?'rgba(0,214,143,0.3)':'rgba(255,71,87,0.3)'}`,
                color: msg.type==='success'?'var(--green)':'var(--red)',
              }}>{msg.text}</div>
            )}

            <button type="submit" disabled={loading} style={{
              width:'100%',padding:'14px',border:'none',borderRadius:10,cursor:loading?'not-allowed':'pointer',
              fontWeight:700,fontSize:15,transition:'all 0.2s',
              background: loading ? 'var(--border)' : side==='buy' ? 'linear-gradient(135deg,#00d68f,#00b877)' : 'linear-gradient(135deg,#ff4757,#cc2233)',
              color: loading ? 'var(--text2)' : '#fff',
            }}>
              {loading ? 'Processing...' : `${side.toUpperCase()} ${symbol}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const iS = {
  width:'100%',padding:'11px 14px',background:'var(--bg3)',
  border:'1px solid var(--border)',borderRadius:9,color:'var(--text)',
  fontSize:14,outline:'none',fontFamily:'var(--mono)',
};
