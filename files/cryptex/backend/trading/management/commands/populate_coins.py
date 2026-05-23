from django.core.management.base import BaseCommand
from trading.models import Coin, CoinChart
from decimal import Decimal
import random

class Command(BaseCommand):
    help = 'Populate cryptocurrency market data into the database'

    def handle(self, *args, **options):
        coins_data = [
            {'symbol': 'BTC', 'name': 'Bitcoin'},
            {'symbol': 'ETH', 'name': 'Ethereum'},
            {'symbol': 'BNB', 'name': 'Binance Coin'},
            {'symbol': 'SOL', 'name': 'Solana'},
            {'symbol': 'XRP', 'name': 'XRP'},
            {'symbol': 'ADA', 'name': 'Cardano'},
            {'symbol': 'AVAX', 'name': 'Avalanche'},
            {'symbol': 'DOGE', 'name': 'Dogecoin'},
            {'symbol': 'DOT', 'name': 'Polkadot'},
            {'symbol': 'MATIC', 'name': 'Polygon'},
            {'symbol': 'LTC', 'name': 'Litecoin'},
            {'symbol': 'LINK', 'name': 'Chainlink'},
            {'symbol': 'UNI', 'name': 'Uniswap'},
            {'symbol': 'ATOM', 'name': 'Cosmos'},
            {'symbol': 'TRX', 'name': 'TRON'},
        ]

        initial_prices = {
            'BTC': 67432.50,
            'ETH': 3521.80,
            'BNB': 412.30,
            'SOL': 189.45,
            'XRP': 0.6234,
            'ADA': 0.4521,
            'AVAX': 38.72,
            'DOGE': 0.1823,
            'DOT': 7.83,
            'MATIC': 0.8934,
            'LTC': 89.45,
            'LINK': 14.23,
            'UNI': 8.91,
            'ATOM': 9.12,
            'TRX': 0.1234,
        }

        for coin_data in coins_data:
            coin, created = Coin.objects.get_or_create(
                symbol=coin_data['symbol'],
                defaults={
                    'name': coin_data['name'],
                    'price': Decimal(str(initial_prices[coin_data['symbol']])),
                    'change_24h': Decimal(str(random.uniform(-5, 5))),
                    'volume_24h': Decimal(str(random.uniform(1e8, 1e10))),
                    'market_cap': Decimal(str(random.uniform(1e9, 1e12))),
                    'high_24h': Decimal(str(initial_prices[coin_data['symbol']] * 1.05)),
                    'low_24h': Decimal(str(initial_prices[coin_data['symbol']] * 0.95)),
                }
            )
            
            if created:
                self.stdout.write(self.style.SUCCESS(f'✓ Created {coin_data["symbol"]} - {coin_data["name"]}'))
                
                # Generate sample chart candles
                price = float(coin.price) * 0.9
                for i in range(90):
                    open_p = price
                    change = random.uniform(-3, 3) / 100
                    close_p = open_p * (1 + change)
                    high_p = max(open_p, close_p) * random.uniform(1, 1.02)
                    low_p = min(open_p, close_p) * random.uniform(0.98, 1)
                    volume = random.uniform(1e6, 1e8)
                    
                    CoinChart.objects.create(
                        coin=coin,
                        time=i,
                        open=Decimal(str(round(open_p, 4))),
                        high=Decimal(str(round(high_p, 4))),
                        low=Decimal(str(round(low_p, 4))),
                        close=Decimal(str(round(close_p, 4))),
                        volume=Decimal(str(int(volume)))
                    )
                    price = close_p
            else:
                self.stdout.write(f'⊘ {coin_data["symbol"]} already exists')

        self.stdout.write(self.style.SUCCESS('\n✓ Database populated! You can now edit prices in Django admin.'))
        self.stdout.write('Admin URL: http://localhost:8000/admin/')
        self.stdout.write('Login with: admin / admin1234')
