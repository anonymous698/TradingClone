# from django.contrib import admin
# from django.urls import path, include
# from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
# from trading.views import RegisterView

# urlpatterns = [
#     path('admin/', admin.site.urls),
#     path('api/auth/register/', RegisterView.as_view()),
#     path('api/auth/login/', TokenObtainPairView.as_view()),
#     path('api/auth/refresh/', TokenRefreshView.as_view()),
#     path('api/', include('trading.urls')),
# ]
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from trading.views import RegisterView
from django.http import JsonResponse

# Root endpoint - returns basic info
def api_root(request):
    return JsonResponse({
        "message": "Cryptex Trading API is running 🚀",
        "status": "healthy",
        "endpoints": {
            "register": "/api/auth/register/",
            "login": "/api/auth/login/",
            "refresh": "/api/auth/refresh/",
            "trading": "/api/"
        }
    }, status=200)
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/register/', RegisterView.as_view()),
    path('api/auth/login/', TokenObtainPairView.as_view()),
    path('api/auth/refresh/', TokenRefreshView.as_view()),
    path('api/', include('trading.urls')),
    path('', api_root),                    # ← This fixes the 404
]