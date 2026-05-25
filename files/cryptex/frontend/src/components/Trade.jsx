import { useState, useEffect } from 'react';
import { marketAPI, tradingAPI } from '../api';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const LEVERAGE_STOPS = [1, 2, 3, 5, 10, 15, 20, 25, 33, 50, 75, 100];

function LeverageSlider({ leverage, setLeverage, side }) {
  const currentIndex = LEVERAGE_STOPS.indexOf(leverage);

  const getRiskColor = (lev) => {
    if (lev <= 3) return '#00d68f';
    if (lev <= 10) return '#ffd600';
    if (lev <= 25) return '#ff9f43';
    return '#ff4757';
  };

  const getRiskLabel = (lev) => {
    if (lev === 1) return 'No Leverage';
    if (lev <= 3) return 'Low Risk';
    if (lev <= 10) return 'Medium Risk';
    if (lev <= 25) return 'High Risk';
    if (lev <= 50) return 'Very High Risk';
    return '⚠ Extreme Risk';
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <label style={{ fontSize: 12, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.8 }}>
          Leverage
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: getRiskColor(leverage) }}>{getRiskLabel(leverage)}</span>
          <span style={{
            padding: '3px 10px', borderRadius: 6, fontWeight: 700, fontSize: 15,
            fontFamily: 'var(--mono)',
            background: `${getRiskColor(leverage)}20`,
            color: getRiskColor(leverage),
            border: `1px solid ${getRiskColor(leverage)}40`,
          }}>{leverage}x</span>
        </div>
      </div>

      {/* Scrollable leverage track */}
      <div style={{ overflowX: 'auto', paddingBottom: 8, cursor: 'grab' }}
        className="leverage-scroll">
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, minWidth: 'max-content', padding: '8px 4px', position: 'relative' }}>
          {/* Track line */}
          <div style={{
            position: 'absolute', top: '50%', left: 16, right: 16, height: 3,
            background: 'var(--border)', borderRadius: 2, transform: 'translateY(-50%)',
            zIndex: 0,
          }} />
          {/* Active track */}
          <div style={{
            position: 'absolute', top: '50%', left: 16,
            width: `calc(${(currentIndex / (LEVERAGE_STOPS.length - 1)) * 100}% - 16px)`,
            height: 3, background: getRiskColor(leverage),
            borderRadius: 2, transform: 'translateY(-50%)', zIndex: 1,
            transition: 'width 0.2s, background 0.2s',
          }} />

          {LEVERAGE_STOPS.map((stop, i) => (
            <div key={stop} onClick={() => setLeverage(stop)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                width: 52, flexShrink: 0, cursor: 'pointer', position: 'relative', zIndex: 2 }}>
              {/* Dot */}
              <div style={{
                width: stop === leverage ? 20 : 12,
                height: stop === leverage ? 20 : 12,
                borderRadius: '50%',
                background: i <= currentIndex ? getRiskColor(leverage) : 'var(--bg3)',
                border: `2px solid ${i <= currentIndex ? getRiskColor(leverage) : 'var(--border)'}`,
                transition: 'all 0.2s',
                boxShadow: stop === leverage ? `0 0 10px ${getRiskColor(leverage)}` : 'none',
              }} />
              {/* Label */}
              <span style={{
                fontSize: 11, fontFamily: 'var(--mono)', fontWeight: stop === leverage ? 700 : 400,
                color: stop === leverage ? getRiskColor(leverage) : 'var(--text3)',
                transition: 'color 0.2s',
              }}>{stop}x</span>
            </div>
          ))}
        </div>
      </div>

      {/* Warning for high leverage */}
      {leverage >= 10 && (
        <div style={{
          padding: '8px 12px', borderRadius: 7, fontSize: 12, marginTop: 6,
          background: `${getRiskColor(leverage)}10`,
          border: `1px solid ${getRiskColor(leverage)}30`,
          color: getRiskColor(leverage),
        }}>
          ⚠ {leverage}x leverage means a {(100/leverage).toFixed(1)}% price move against you will liquidate your position.
        </div>
      )}
    </div>
  );
}

export default function Trade({ markets, selectedCoin, onOrderFilled }) {
  const [symbol, setSymbol] = useState(selectedCoin || 'BTC');
  const [side, setSide] = useState('buy');
  const [orderType, setOrderType] = useState('market');
  const [quantity, setQuantity] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [leverage, setLeverage] = useState(1);
  const [coinData, setCoinData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [chartData, setChartData] = useState([]);

  const coin = markets.find(m => m.symbol === symbol) || {};

  useEffect(() => { setSymbol(selectedCoin); }, [selectedCoin]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await marketAPI.getCoin(symbol);
        setCoinData(res.data);
        setChartData(res.data.candles?.map((c, i) => ({ t: i, price: c.close, vol: c.volume })) || []);
      } catch (e) {}
    };
    load();
  }, [symbol]);

  const fillPrice = orderType === 'limit' ? parseFloat(limitPrice) || 0 : (coin.price || 0);
  const positionSize = fillPrice * (parseFloat(quantity) || 0);
  const marginRequired = positionSize / leverage;
  const fee = positionSize * 0.001;
  const totalCost = marginRequired + fee;

  const liqPrice = side === 'buy'
    ? fillPrice * (1 - 0.9 / leverage)
    : fillPrice * (1 + 0.9 / leverage);

  const getRiskColor = (lev) => {
    if (lev <= 3) return '#00d68f';
    if (lev <= 10) return '#ffd600';
    if (lev <= 25) return '#ff9f43';
    return '#ff4757';
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null); setLoading(true);
    try {
      const body = {
        symbol, side, order_type: orderType,
        quantity: parseFloat(quantity),
        leverage,
        ...(orderType === 'limit' ? { price: parseFloat(limitPrice) } : {}),
      };
      const res = await tradingAPI.placeOrder(body);
      setMsg({
        type: 'success',
        text: `✓ ${side.toUpperCase()} ${quantity} ${symbol} @ $${res.data.filled_price?.toLocaleString('en', { minimumFractionDigits: 2 })} | ${leverage}x | Liq: $${res.data.liquidation_price?.toLocaleString('en', { minimumFractionDigits: 2 })}`,
      });
      setQuantity('');
      onOrderFilled();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Order failed' });
    } finally { setLoading(false); }
  };

  const chartColor = (coinData?.change_24h || 0) >= 0 ? '#00d68f' : '#ff4757';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
      <style>{`.leverage-scroll::-webkit-scrollbar{height:3px}.leverage-scroll::-webkit-scrollbar-track{background:var(--bg3)}.leverage-scroll::-webkit-scrollbar-thumb{background:var(--border2);border-radius:2px}`}</style>

      {/* Chart side */}
      <div>
        {/* Coin selector + stats */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <select value={symbol} onChange={e => setSymbol(e.target.value)} style={{ padding: '9px 14px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 9, color: 'var(--text)', fontSize: 15, fontWeight: 600, outline: 'none', cursor: 'pointer' }}>
            {markets.map(m => <option key={m.symbol} value={m.symbol}>{m.symbol} — {m.name}</option>)}
          </select>
          {coin.price && (
            <>
              <span style={{ fontSize: 26, fontWeight: 700, fontFamily: 'var(--mono)' }}>
                ${coin.price < 1 ? coin.price.toFixed(4) : coin.price.toLocaleString('en', { minimumFractionDigits: 2 })}
              </span>
              <span className={coin.change_24h >= 0 ? 'badge-green' : 'badge-red'} style={{ fontSize: 14, padding: '4px 12px' }}>
                {coin.change_24h >= 0 ? '+' : ''}{coin.change_24h?.toFixed(2)}%
              </span>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 24 }}>
                <div><p style={{ fontSize: 11, color: 'var(--text3)' }}>24H HIGH</p><p style={{ fontFamily: 'var(--mono)', color: 'var(--green)', fontWeight: 600 }}>${coin.high_24h?.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</p></div>
                <div><p style={{ fontSize: 11, color: 'var(--text3)' }}>24H LOW</p><p style={{ fontFamily: 'var(--mono)', color: 'var(--red)', fontWeight: 600 }}>${coin.low_24h?.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</p></div>
                <div><p style={{ fontSize: 11, color: 'var(--text3)' }}>24H VOL</p><p style={{ fontFamily: 'var(--mono)', color: 'var(--text2)', fontWeight: 600 }}>{(coin.volume_24h / 1e6).toFixed(0)}M</p></div>
              </div>
            </>
          )}
        </div>

        {/* Chart */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px', height: 360 }}>
          <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 12 }}>Price Chart (90 days)</p>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="t" hide />
              <YAxis domain={['auto', 'auto']} tickFormatter={v => v < 1 ? v.toFixed(3) : `$${v.toLocaleString('en', { maximumFractionDigits: 0 })}`} tick={{ fontSize: 11, fill: '#4a5a70' }} width={70} />
              <Tooltip
                contentStyle={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }}
                formatter={v => [`$${v < 1 ? v.toFixed(4) : v.toLocaleString('en', { minimumFractionDigits: 2 })}`, 'Price']}
                labelFormatter={t => `Day ${t}`}
              />
              <Area type="monotone" dataKey="price" stroke={chartColor} strokeWidth={2} fill="url(#cg)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Order book */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px', marginTop: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 12 }}>Order Book</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {['buy', 'sell'].map(bookSide => (
              <div key={bookSide}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', fontSize: 11, color: 'var(--text3)', marginBottom: 6, gap: 8 }}>
                  <span>Price (USD)</span><span style={{ textAlign: 'right' }}>Amount</span>
                </div>
                {Array.from({ length: 8 }).map((_, i) => {
                  const p = (coin.price || 0) * (bookSide === 'buy' ? (1 - (i + 1) * 0.0008) : (1 + (i + 1) * 0.0008));
                  const a = (Math.random() * 2 + 0.1).toFixed(4);
                  return (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', fontSize: 12, padding: '3px 0', gap: 8, position: 'relative' }}>
                      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, background: bookSide === 'buy' ? 'rgba(0,214,143,0.05)' : 'rgba(255,71,87,0.05)', width: `${(8 - i) * 10}%` }} />
                      <span style={{ color: bookSide === 'buy' ? 'var(--green)' : 'var(--red)', fontFamily: 'var(--mono)' }}>
                        {p < 1 ? p.toFixed(4) : p.toLocaleString('en', { minimumFractionDigits: 2 })}
                      </span>
                      <span style={{ textAlign: 'right', color: 'var(--text2)', fontFamily: 'var(--mono)' }}>{a}</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order form */}
      <div>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', position: 'sticky', top: 80 }}>
          {/* Buy/Sell tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            {['buy', 'sell'].map(s => (
              <button key={s} onClick={() => setSide(s)} style={{
                padding: '16px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 15,
                background: side === s ? (s === 'buy' ? 'rgba(0,214,143,0.12)' : 'rgba(255,71,87,0.12)') : 'transparent',
                color: side === s ? (s === 'buy' ? 'var(--green)' : 'var(--red)') : 'var(--text2)',
                borderBottom: side === s ? `2px solid ${s === 'buy' ? 'var(--green)' : 'var(--red)'}` : '2px solid var(--border)',
              }}>
                {s.toUpperCase()}
              </button>
            ))}
          </div>

          <form onSubmit={submit} style={{ padding: 20 }}>
            {/* Order type */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 }}>Order Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
                {['market', 'limit', 'stop'].map(t => (
                  <button key={t} type="button" onClick={() => setOrderType(t)} style={{
                    padding: '8px', border: '1px solid', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                    borderColor: orderType === t ? 'var(--accent)' : 'var(--border)',
                    background: orderType === t ? 'rgba(0,229,255,0.08)' : 'transparent',
                    color: orderType === t ? 'var(--accent)' : 'var(--text2)',
                  }}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
                ))}
              </div>
            </div>

            {/* Limit price */}
            {orderType !== 'market' && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  {orderType === 'limit' ? 'Limit' : 'Stop'} Price (USD)
                </label>
                <input value={limitPrice} onChange={e => setLimitPrice(e.target.value)} type="number" step="any" min="0"
                  placeholder={coin.price?.toFixed(2) || '0.00'} style={iS} required />
              </div>
            )}

            {/* Quantity */}
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontSize: 12, color: 'var(--text3)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 }}>Amount ({symbol})</label>
              <input value={quantity} onChange={e => setQuantity(e.target.value)} type="number" step="any" min="0"
                placeholder="0.00000000" style={iS} required />
            </div>

            {/* % shortcuts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, marginBottom: 16 }}>
              {[25, 50, 75, 100].map(p => (
                <button key={p} type="button" style={{ padding: '6px', border: '1px solid var(--border)', borderRadius: 6, background: 'transparent', color: 'var(--text2)', fontSize: 12, cursor: 'pointer' }}
                  onClick={() => {
                    const price = coin.price || 1;
                    setQuantity(((10000 * p / 100) / price).toFixed(8));
                  }}>
                  {p}%
                </button>
              ))}
            </div>

            {/* Leverage slider */}
            <LeverageSlider leverage={leverage} setLeverage={setLeverage} side={side} />

            {/* Summary */}
            <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '12px 14px', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: 'var(--text3)' }}>Position Size</span>
                <span style={{ fontSize: 13, fontFamily: 'var(--mono)', fontWeight: 600 }}>${positionSize.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: 'var(--text3)' }}>Margin Required ({leverage}x)</span>
                <span style={{ fontSize: 13, fontFamily: 'var(--mono)', color: 'var(--accent)' }}>${marginRequired.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: 'var(--text3)' }}>Trading Fee (0.1%)</span>
                <span style={{ fontSize: 13, fontFamily: 'var(--mono)', color: 'var(--text2)' }}>${fee.toFixed(2)}</span>
              </div>
              {leverage > 1 && quantity && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: 'var(--text3)' }}>Liquidation Price</span>
                  <span style={{ fontSize: 13, fontFamily: 'var(--mono)', color: getRiskColor(leverage), fontWeight: 600 }}>
                    ${liqPrice < 1 ? liqPrice.toFixed(4) : liqPrice.toLocaleString('en', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 6, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600 }}>Total Cost</span>
                <span style={{ fontSize: 14, fontFamily: 'var(--mono)', fontWeight: 700, color: side === 'buy' ? 'var(--red)' : 'var(--green)' }}>
                  ${totalCost.toFixed(2)}
                </span>
              </div>
            </div>

            {msg && (
              <div style={{
                padding: '10px 14px', borderRadius: 8, marginBottom: 12, fontSize: 12,
                background: msg.type === 'success' ? 'rgba(0,214,143,0.1)' : 'rgba(255,71,87,0.1)',
                border: `1px solid ${msg.type === 'success' ? 'rgba(0,214,143,0.3)' : 'rgba(255,71,87,0.3)'}`,
                color: msg.type === 'success' ? 'var(--green)' : 'var(--red)',
              }}>{msg.text}</div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px', border: 'none', borderRadius: 10, cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 700, fontSize: 15, transition: 'all 0.2s',
              background: loading ? 'var(--border)' : side === 'buy' ? 'linear-gradient(135deg,#00d68f,#00b877)' : 'linear-gradient(135deg,#ff4757,#cc2233)',
              color: loading ? 'var(--text2)' : '#fff',
            }}>
              {loading ? 'Processing...' : `${side.toUpperCase()} ${symbol}${leverage > 1 ? ` ${leverage}x` : ''}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const iS = {
  width: '100%', padding: '11px 14px', background: 'var(--bg3)',
  border: '1px solid var(--border)', borderRadius: 9, color: 'var(--text)',
  fontSize: 14, outline: 'none', fontFamily: 'var(--mono)',
};