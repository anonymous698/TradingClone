from django.contrib import admin
from .models import Coin, CoinChart, UserProfile, Holding, Order, WatchlistItem, Transaction

@admin.register(Coin)
class CoinAdmin(admin.ModelAdmin):
    list_display = ['symbol', 'name', 'price', 'change_24h', 'volume_24h']
    search_fields = ['symbol', 'name']
    list_editable = ['price', 'change_24h']

@admin.register(CoinChart)
class CoinChartAdmin(admin.ModelAdmin):
    list_display = ['coin', 'time', 'open', 'close', 'volume']
    list_filter = ['coin']
    search_fields = ['coin__symbol']

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'usd_balance']
    search_fields = ['user__username']

@admin.register(Holding)
class HoldingAdmin(admin.ModelAdmin):
    list_display = ['user', 'symbol', 'quantity', 'avg_buy_price']
    search_fields = ['user__username', 'symbol']

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['user', 'symbol', 'side', 'quantity', 'status', 'created_at']
    list_filter = ['status', 'side', 'created_at']
    search_fields = ['user__username', 'symbol']

@admin.register(WatchlistItem)
class WatchlistItemAdmin(admin.ModelAdmin):
    list_display = ['user', 'symbol', 'added_at']
    search_fields = ['user__username', 'symbol']

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['user', 'transaction_type', 'symbol', 'usd_amount', 'created_at']
    list_filter = ['transaction_type', 'created_at']
    search_fields = ['user__username', 'symbol']

