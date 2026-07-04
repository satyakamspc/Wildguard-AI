from django.urls import path
from .views import AnalyzeView, HistoryView, HistoryDetailView

urlpatterns = [
    path('analyze/', AnalyzeView.as_view(), name='analyze'),
    path('history/', HistoryView.as_view(), name='history'),
    path('history/<uuid:session_id>/', HistoryDetailView.as_view(), name='history_detail'),
]
