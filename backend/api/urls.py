from django.urls import path
from .views import upload_excel
from .views import analyze

urlpatterns = [
    path("upload-excel/", upload_excel),
    path("analyze/", analyze),
]
