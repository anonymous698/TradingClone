from django.urls import path
from . import views

urlpatterns = [
    path('market/', views.market_data),
    path('market/<str:symbol>/', views.coin_detail),
    path('portfolio/', views.portfolio),
    path('orders/', views.place_order),
    path('orders/history/', views.order_history),
    path('watchlist/', views.watchlist),
    path('watchlist/<str:symbol>/', views.watchlist),
    path('transactions/', views.transactions),
    path('account/', views.account_info),
    path('deposit/', views.deposit),
]
