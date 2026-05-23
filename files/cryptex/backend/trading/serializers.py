from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, Holding, Order, WatchlistItem, Transaction, Coin, CoinChart

class CoinChartSerializer(serializers.ModelSerializer):
    open = serializers.SerializerMethodField()
    high = serializers.SerializerMethodField()
    low = serializers.SerializerMethodField()
    close = serializers.SerializerMethodField()
    volume = serializers.SerializerMethodField()
    
    class Meta:
        model = CoinChart
        fields = ['time', 'open', 'high', 'low', 'close', 'volume']
    
    def get_open(self, obj):
        return float(obj.open)
    def get_high(self, obj):
        return float(obj.high)
    def get_low(self, obj):
        return float(obj.low)
    def get_close(self, obj):
        return float(obj.close)
    def get_volume(self, obj):
        return float(obj.volume)

class CoinSerializer(serializers.ModelSerializer):
    price = serializers.SerializerMethodField()
    change_24h = serializers.SerializerMethodField()
    volume_24h = serializers.SerializerMethodField()
    market_cap = serializers.SerializerMethodField()
    high_24h = serializers.SerializerMethodField()
    low_24h = serializers.SerializerMethodField()
    candles = CoinChartSerializer(many=True, read_only=True)
    
    class Meta:
        model = Coin
        fields = ['symbol', 'name', 'price', 'change_24h', 'volume_24h', 'market_cap', 'high_24h', 'low_24h', 'candles', 'updated_at']
    
    def get_price(self, obj):
        return float(obj.price)
    def get_change_24h(self, obj):
        return float(obj.change_24h)
    def get_volume_24h(self, obj):
        return float(obj.volume_24h)
    def get_market_cap(self, obj):
        return float(obj.market_cap)
    def get_high_24h(self, obj):
        return float(obj.high_24h)
    def get_low_24h(self, obj):
        return float(obj.low_24h)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = UserProfile
        fields = '__all__'

class HoldingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Holding
        fields = '__all__'
        read_only_fields = ['user']

class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ['user', 'status', 'filled_price', 'filled_quantity', 'total_value', 'fee']

class WatchlistSerializer(serializers.ModelSerializer):
    class Meta:
        model = WatchlistItem
        fields = '__all__'
        read_only_fields = ['user']

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'
        read_only_fields = ['user']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name']

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        UserProfile.objects.create(user=user)
        return user
