import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#00e5ff','#7c3aed','#00d68f','#ff4757','#ffd600','#ff9f43','#a29bfe','#fd79a8','#55efc4','#636e72'];

export default function Portfolio({ portfolio, markets, onTrade }) {
  if (!portfolio) return <div style={{color:'var(--text2)',padding:40,textAlign:'center'}}>Loading portfolio...</div>;

  const { usd_balance, total_value, holdings } = portfolio;
  const invested = total_value - usd_balance;
  const pnl = holdings.reduce((s,h) => s + h.pnl, 0);
  const pnlPct = invested > 0 ? (pnl / invested * 100) : 0;

  const pieData = [
    { name: 'USD', value: usd_balance },
    ...holdings.filter(h=>h.value>0).map(h => ({ name: h.symbol, value: h.value }))
  ].filter(d => d.value > 0);

  return (
    <div>
      {/* Summary cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
        {[
          { label:'Total Value', value:`$${total_value?.toLocaleString('en',{minimumFractionDigits:2,maximumFractionDigits:2})}`, sub:'Portfolio worth', color:'var(--accent)' },
          { label:'USD Cash', value:`$${usd_balance?.toLocaleString('en',{minimumFractionDigits:2,maximumFractionDigits:2})}`, sub:'Available to trade', color:'var(--text)' },
          { label:'Unrealized P&L', value:`${pnl>=0?'+':''}$${pnl.toFixed(2)}`, sub:`${pnlPct>=0?'+':''}${pnlPct.toFixed(2)}% return`, color: pnl>=0?'var(--green)':'var(--red)' },
          { label:'Positions', value: holdings.filter(h=>h.quantity>0).length, sub:'Active holdings', color:'var(--text)' },
        ].map(c => (
          <div key={c.label} style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:12,padding:'18px 20px'}}>
            <p style={{fontSize:11,color:'var(--text3)',textTransform:'uppercase',letterSpacing:1,marginBottom:8}}>{c.label}</p>
            <p style={{fontSize:22,fontWeight:700,fontFamily:'var(--mono)',color:c.color,marginBottom:4}}>{c.value}</p>
            <p style={{fontSize:12,color:'var(--text2)'}}>{c.sub}</p>
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 300px',gap:24}}>
        {/* Holdings table */}
        <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:16,overflow:'hidden'}}>
          <div style={{padding:'16px 20px',borderBottom:'1px solid var(--border)'}}>
            <h3 style={{fontWeight:600,fontSize:15}}>Holdings</h3>
          </div>
          {holdings.length === 0 ? (
            <div style={{padding:40,textAlign:'center',color:'var(--text2)'}}>
              <p style={{fontSize:32,marginBottom:12}}>📊</p>
              <p style={{marginBottom:8}}>No holdings yet</p>
              <p style={{fontSize:13,color:'var(--text3)'}}>Start trading to build your portfolio</p>
            </div>
          ) : (
            <div style={{overflowX:'auto',WebkitOverflowScrolling:'touch'}}>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead>
                  <tr style={{borderBottom:'1px solid var(--border)',background:'rgba(255,255,255,0.02)'}}>
                    {['Asset','Holdings','Avg Buy','Current','Value','P&L','Action'].map(h => (
                      <th key={h} style={{padding:'10px 16px',textAlign:'left',fontSize:11,fontWeight:600,color:'var(--text3)',textTransform:'uppercase',letterSpacing:0.8,whiteSpace:'nowrap'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {holdings.filter(h=>h.quantity>0).map((h,i) => (
                    <tr key={h.symbol} style={{borderBottom:'1px solid rgba(30,45,69,0.5)'}}>
                      <td style={{padding:'14px 16px'}}>
                        <div style={{display:'flex',alignItems:'center',gap:10}}>
                          <div style={{width:32,height:32,borderRadius:'50%',background:COLORS[i%COLORS.length]+'20',border:`1px solid ${COLORS[i%COLORS.length]}40`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:COLORS[i%COLORS.length]}}>
                            {h.symbol[0]}
                          </div>
                          <div>
                            <p style={{fontWeight:600,fontSize:13}}>{h.symbol}</p>
                            <p style={{fontSize:11,color:'var(--text3)'}}>{h.name}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{padding:'14px 16px',fontFamily:'var(--mono)',fontSize:13}}>{Number(h.quantity).toFixed(h.quantity < 0.01 ? 8 : 4)}</td>
                      <td style={{padding:'14px 16px',fontFamily:'var(--mono)',fontSize:13,color:'var(--text2)'}}>${h.avg_buy_price?.toLocaleString('en',{minimumFractionDigits:2})}</td>
                      <td style={{padding:'14px 16px',fontFamily:'var(--mono)',fontSize:13}}>${h.current_price < 1 ? h.current_price.toFixed(4) : h.current_price?.toLocaleString('en',{minimumFractionDigits:2})}</td>
                      <td style={{padding:'14px 16px',fontFamily:'var(--mono)',fontWeight:600,fontSize:13}}>${h.value?.toLocaleString('en',{minimumFractionDigits:2})}</td>
                      <td style={{padding:'14px 16px'}}>
                        <div>
                          <span className={h.pnl>=0?'positive':'negative'} style={{fontFamily:'var(--mono)',fontSize:13,display:'block'}}>
                            {h.pnl>=0?'+':''}{h.pnl?.toFixed(2)}
                          </span>
                          <span className={h.pnl_pct>=0?'positive':'negative'} style={{fontSize:11}}>
                            {h.pnl_pct>=0?'+':''}{h.pnl_pct?.toFixed(2)}%
                          </span>
                        </div>
                      </td>
                      <td style={{padding:'14px 16px'}}>
                        <button onClick={() => onTrade(h.symbol)} style={{padding:'5px 12px',background:'transparent',border:'1px solid var(--border)',color:'var(--text2)',borderRadius:7,cursor:'pointer',fontSize:12,fontWeight:500,whiteSpace:'nowrap'}}>
                          Trade
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pie chart */}
        <div>
          <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:16,padding:20}}>
            <h3 style={{fontWeight:600,fontSize:15,marginBottom:16}}>Allocation</h3>
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2} dataKey="value">
                      {pieData.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={v=>[`$${v.toLocaleString('en',{minimumFractionDigits:2})}`,'']} contentStyle={{background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:8,fontSize:12}} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{marginTop:12,display:'flex',flexDirection:'column',gap:6}}>
                  {pieData.map((d,i) => (
                    <div key={d.name} style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <div style={{width:10,height:10,borderRadius:2,background:COLORS[i%COLORS.length],flexShrink:0}} />
                        <span style={{fontSize:13,color:'var(--text2)'}}>{d.name}</span>
                      </div>
                      <span style={{fontSize:13,fontFamily:'var(--mono)',fontWeight:500}}>{(d.value/total_value*100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{textAlign:'center',padding:40,color:'var(--text3)'}}>No data yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
