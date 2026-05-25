from rest_framework import viewsets, status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User
from decimal import Decimal, ROUND_DOWN
import random
from .models import UserProfile, Holding, Order, WatchlistItem, Transaction
from .serializers import *

MOCK_PRICES = {
    'BTC': {'price': 67432.50, 'change': 2.34, 'name': 'Bitcoin'},
    'ETH': {'price': 3521.80, 'change': -1.12, 'name': 'Ethereum'},
    'BNB': {'price': 412.30, 'change': 0.87, 'name': 'Binance Coin'},
    'SOL': {'price': 189.45, 'change': 5.21, 'name': 'Solana'},
    'XRP': {'price': 0.6234, 'change': -0.45, 'name': 'XRP'},
    'ADA': {'price': 0.4521, 'change': 1.23, 'name': 'Cardano'},
    'AVAX': {'price': 38.72, 'change': 3.45, 'name': 'Avalanche'},
    'DOGE': {'price': 0.1823, 'change': -2.11, 'name': 'Dogecoin'},
    'DOT': {'price': 7.83, 'change': 0.56, 'name': 'Polkadot'},
    'MATIC': {'price': 0.8934, 'change': 1.89, 'name': 'Polygon'},
    'LTC': {'price': 89.45, 'change': -0.78, 'name': 'Litecoin'},
    'LINK': {'price': 14.23, 'change': 2.67, 'name': 'Chainlink'},
    'UNI': {'price': 8.91, 'change': -1.34, 'name': 'Uniswap'},
    'ATOM': {'price': 9.12, 'change': 0.91, 'name': 'Cosmos'},
    'TRX': {'price': 0.1234, 'change': 0.34, 'name': 'TRON'},
}

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({'message': 'Account created successfully', 'username': user.username}, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([AllowAny])
def market_data(request):
    data = []
    for symbol, info in MOCK_PRICES.items():
        variation = random.uniform(-0.5, 0.5)
        price = info['price'] * (1 + variation/100)
        data.append({
            'symbol': symbol,
            'name': info['name'],
            'price': round(price, 4),
            'change_24h': round(info['change'] + variation, 2),
            'volume_24h': round(random.uniform(1e8, 5e10), 0),
            'market_cap': round(price * random.uniform(1e6, 1e10), 0),
            'high_24h': round(price * 1.03, 4),
            'low_24h': round(price * 0.97, 4),
        })
    return Response(data)

@api_view(['GET'])
@permission_classes([AllowAny])
def coin_detail(request, symbol):
    symbol = symbol.upper()
    if symbol not in MOCK_PRICES:
        return Response({'error': 'Coin not found'}, status=404)
    info = MOCK_PRICES[symbol]
    candles = []
    price = info['price'] * 0.9
    for i in range(90):
        open_p = price
        change = random.uniform(-3, 3) / 100
        close_p = open_p * (1 + change)
        high_p = max(open_p, close_p) * random.uniform(1, 1.02)
        low_p = min(open_p, close_p) * random.uniform(0.98, 1)
        volume = random.uniform(1e6, 1e8)
        candles.append({
            'time': i, 'open': round(open_p, 4), 'high': round(high_p, 4),
            'low': round(low_p, 4), 'close': round(close_p, 4), 'volume': round(volume, 0),
        })
        price = close_p
    return Response({
        'symbol': symbol, 'name': info['name'],
        'price': round(price, 4), 'change_24h': info['change'], 'candles': candles,
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def portfolio(request):
    try:
        profile = request.user.profile
    except UserProfile.DoesNotExist:
        profile = UserProfile.objects.create(user=request.user)

    holdings = Holding.objects.filter(user=request.user, quantity__gt=0)
    holdings_data = []
    total_value = float(profile.usd_balance)

    for h in holdings:
        info = MOCK_PRICES.get(h.symbol)
        if info:
            current_price = info['price'] * (1 + random.uniform(-0.5, 0.5)/100)
        else:
            current_price = 0

        value = float(h.quantity) * current_price
        cost_basis = float(h.quantity) * float(h.avg_buy_price)
        pnl = value - cost_basis
        pnl_pct = (pnl / cost_basis * 100) if cost_basis > 0 else 0
        total_value += value
        holdings_data.append({
            'symbol': h.symbol,
            'name': h.name,
            'quantity': float(h.quantity),
            'avg_buy_price': float(h.avg_buy_price),
            'current_price': round(current_price, 4),
            'value': round(value, 2),
            'pnl': round(pnl, 2),
            'pnl_pct': round(pnl_pct, 2),
        })

    return Response({
        'usd_balance': float(profile.usd_balance),
        'total_value': round(total_value, 2),
        'holdings': holdings_data,
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def place_order(request):
    try:
        profile = request.user.profile
    except UserProfile.DoesNotExist:
        profile = UserProfile.objects.create(user=request.user)

    symbol = request.data.get('symbol', '').upper()
    side = request.data.get('side', '').lower()
    order_type = request.data.get('order_type', 'market').lower()
    quantity = Decimal(str(request.data.get('quantity', 0)))
    limit_price = request.data.get('price')
    leverage = int(request.data.get('leverage', 1))

    if leverage < 1 or leverage > 100:
        return Response({'error': 'Leverage must be between 1x and 100x'}, status=400)
    if symbol not in MOCK_PRICES:
        return Response({'error': 'Invalid symbol'}, status=400)
    if side not in ('buy', 'sell'):
        return Response({'error': 'Invalid side'}, status=400)
    if quantity <= 0:
        return Response({'error': 'Quantity must be positive'}, status=400)

    info = MOCK_PRICES[symbol]
    fill_price = Decimal(str(info['price'] * (1 + random.uniform(-0.1, 0.1) / 100)))

    # Full position size
    total = (fill_price * quantity).quantize(Decimal('0.01'))

    # Margin required = position / leverage
    margin_required = (total / Decimal(str(leverage))).quantize(Decimal('0.01'))

    # Fee on full position
    fee = (total * Decimal('0.001')).quantize(Decimal('0.01'))

    # Liquidation price (90% of margin wiped)
    if side == 'buy':
        liquidation_price = fill_price * (1 - Decimal('0.9') / Decimal(str(leverage)))
    else:
        liquidation_price = fill_price * (1 + Decimal('0.9') / Decimal(str(leverage)))

    if side == 'buy':
        cost = margin_required + fee
        if profile.usd_balance < cost:
            return Response({'error': f'Insufficient margin. Need ${cost} for {leverage}x leverage, have ${profile.usd_balance}'}, status=400)
        profile.usd_balance -= cost
        profile.save()
        holding, created = Holding.objects.get_or_create(
            user=request.user, symbol=symbol,
            defaults={'name': info['name'], 'quantity': Decimal('0'), 'avg_buy_price': fill_price}
        )
        if not created:
            total_qty = holding.quantity + quantity
            holding.avg_buy_price = ((holding.avg_buy_price * holding.quantity) + (fill_price * quantity)) / total_qty
            holding.quantity = total_qty
        else:
            holding.quantity = quantity
            holding.avg_buy_price = fill_price
        holding.save()
    else:
        try:
            holding = Holding.objects.get(user=request.user, symbol=symbol)
        except Holding.DoesNotExist:
            return Response({'error': 'No holdings to sell'}, status=400)
        if holding.quantity < quantity:
            return Response({'error': f'Insufficient {symbol}. Have {holding.quantity}, selling {quantity}'}, status=400)
        holding.quantity -= quantity
        if holding.quantity <= Decimal('0.00000001'):
            holding.quantity = Decimal('0')
        holding.save()
        proceeds = margin_required - fee
        profile.usd_balance += proceeds + margin_required
        profile.save()

    order = Order.objects.create(
        user=request.user, symbol=symbol, name=info['name'],
        order_type=order_type, side=side, quantity=quantity,
        price=limit_price, filled_price=fill_price, filled_quantity=quantity,
        status='filled', total_value=total, fee=fee
    )
    Transaction.objects.create(
        user=request.user, transaction_type=side, symbol=symbol,
        quantity=quantity, price=fill_price,
        usd_amount=total if side=='buy' else -total,
        fee=fee, balance_after=profile.usd_balance,
        notes=f'{leverage}x leverage'
    )
    return Response({
        'message': 'Order filled successfully',
        'order_id': order.id,
        'filled_price': float(fill_price),
        'quantity': float(quantity),
        'position_size': float(total),
        'margin_used': float(margin_required),
        'fee': float(fee),
        'leverage': leverage,
        'liquidation_price': round(float(liquidation_price), 4),
        'new_balance': float(profile.usd_balance),
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def order_history(request):
    orders = Order.objects.filter(user=request.user)[:50]
    return Response(OrderSerializer(orders, many=True).data)

@api_view(['GET', 'POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def watchlist(request, symbol=None):
    if request.method == 'GET':
        items = WatchlistItem.objects.filter(user=request.user)
        return Response(WatchlistSerializer(items, many=True).data)
    elif request.method == 'POST':
        sym = request.data.get('symbol', '').upper()
        if sym not in MOCK_PRICES:
            return Response({'error': 'Invalid symbol'}, status=400)
        item, created = WatchlistItem.objects.get_or_create(
            user=request.user, symbol=sym,
            defaults={'name': MOCK_PRICES[sym]['name']}
        )
        return Response(WatchlistSerializer(item).data, status=201 if created else 200)
    elif request.method == 'DELETE':
        WatchlistItem.objects.filter(user=request.user, symbol=symbol.upper()).delete()
        return Response({'message': 'Removed from watchlist'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def transactions(request):
    txns = Transaction.objects.filter(user=request.user)[:100]
    return Response(TransactionSerializer(txns, many=True).data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def account_info(request):
    try:
        profile = request.user.profile
    except UserProfile.DoesNotExist:
        profile = UserProfile.objects.create(user=request.user)
    return Response({
        'username': request.user.username,
        'email': request.user.email,
        'first_name': request.user.first_name,
        'last_name': request.user.last_name,
        'usd_balance': float(profile.usd_balance),
        'member_since': request.user.date_joined,
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def deposit(request):
    try:
        profile = request.user.profile
    except UserProfile.DoesNotExist:
        profile = UserProfile.objects.create(user=request.user)

    try:
        amount = Decimal(str(request.data.get('amount', 0)))
    except:
        return Response({'error': 'Invalid amount'}, status=400)

    if amount <= 0:
        return Response({'error': 'Amount must be positive'}, status=400)

    if amount > Decimal('1000000'):
        return Response({'error': 'Maximum deposit is $1,000,000'}, status=400)

    profile.usd_balance += amount
    profile.save()
    Transaction.objects.create(
        user=request.user, transaction_type='deposit',
        usd_amount=amount, fee=Decimal('0'), balance_after=profile.usd_balance
    )
    return Response({'new_balance': float(profile.usd_balance)})