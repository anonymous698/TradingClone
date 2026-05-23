from django.db import models
from django.contrib.auth.models import User
from decimal import Decimal

class Coin(models.Model):
    """Market data for cryptocurrencies - all data filled manually by admin"""
    symbol = models.CharField(max_length=20, unique=True, db_index=True)
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=20, decimal_places=4)
    change_24h = models.DecimalField(max_digits=10, decimal_places=2)  # percentage
    volume_24h = models.DecimalField(max_digits=30, decimal_places=0)
    market_cap = models.DecimalField(max_digits=30, decimal_places=0)
    high_24h = models.DecimalField(max_digits=20, decimal_places=4)
    low_24h = models.DecimalField(max_digits=20, decimal_places=4)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['symbol']

    def __str__(self):
        return f"{self.symbol} - ${self.price}"

class CoinChart(models.Model):
    """Historical OHLCV candle data for charts"""
    coin = models.ForeignKey(Coin, on_delete=models.CASCADE, related_name='candles')
    time = models.IntegerField()  # timestamp or candle index
    open = models.DecimalField(max_digits=20, decimal_places=4)
    high = models.DecimalField(max_digits=20, decimal_places=4)
    low = models.DecimalField(max_digits=20, decimal_places=4)
    close = models.DecimalField(max_digits=20, decimal_places=4)
    volume = models.DecimalField(max_digits=30, decimal_places=0)

    class Meta:
        ordering = ['time']
        unique_together = ('coin', 'time')

    def __str__(self):
        return f"{self.coin.symbol} - Candle {self.time}"

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    usd_balance = models.DecimalField(max_digits=20, decimal_places=2, default=Decimal('0.00'))
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - ${self.usd_balance}"

class Holding(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='holdings')
    symbol = models.CharField(max_length=20)
    name = models.CharField(max_length=100)
    quantity = models.DecimalField(max_digits=30, decimal_places=8, default=Decimal('0'))
    avg_buy_price = models.DecimalField(max_digits=20, decimal_places=2, default=Decimal('0'))
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'symbol')

    def __str__(self):
        return f"{self.user.username} - {self.quantity} {self.symbol}"

class Order(models.Model):
    ORDER_TYPES = [('market', 'Market'), ('limit', 'Limit'), ('stop', 'Stop')]
    SIDES = [('buy', 'Buy'), ('sell', 'Sell')]
    STATUS = [('pending', 'Pending'), ('filled', 'Filled'), ('cancelled', 'Cancelled'), ('partial', 'Partial')]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    symbol = models.CharField(max_length=20)
    name = models.CharField(max_length=100)
    order_type = models.CharField(max_length=10, choices=ORDER_TYPES)
    side = models.CharField(max_length=4, choices=SIDES)
    quantity = models.DecimalField(max_digits=30, decimal_places=8)
    price = models.DecimalField(max_digits=20, decimal_places=2, null=True, blank=True)
    filled_price = models.DecimalField(max_digits=20, decimal_places=2, null=True, blank=True)
    filled_quantity = models.DecimalField(max_digits=30, decimal_places=8, default=Decimal('0'))
    status = models.CharField(max_length=10, choices=STATUS, default='pending')
    total_value = models.DecimalField(max_digits=20, decimal_places=2, default=Decimal('0'))
    fee = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0'))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} {self.side} {self.quantity} {self.symbol}"

class WatchlistItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='watchlist')
    symbol = models.CharField(max_length=20)
    name = models.CharField(max_length=100)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'symbol')

class Transaction(models.Model):
    TYPES = [('deposit', 'Deposit'), ('withdrawal', 'Withdrawal'), ('buy', 'Buy'), ('sell', 'Sell'), ('fee', 'Fee')]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(max_length=20, choices=TYPES)
    symbol = models.CharField(max_length=20, blank=True, null=True)
    quantity = models.DecimalField(max_digits=30, decimal_places=8, null=True, blank=True)
    price = models.DecimalField(max_digits=20, decimal_places=2, null=True, blank=True)
    usd_amount = models.DecimalField(max_digits=20, decimal_places=2)
    fee = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0'))
    balance_after = models.DecimalField(max_digits=20, decimal_places=2)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
