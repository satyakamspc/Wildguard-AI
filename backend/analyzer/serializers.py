from rest_framework import serializers
from .models import AnalysisSession, AnalysisResult

class AnalysisResultSerializer(serializers.ModelSerializer):
    """
    Serializes details of the finalized report compiled by report-agent.
    """
    class Meta:
        model = AnalysisResult
        fields = [
            'common_name',
            'scientific_name',
            'confidence',
            'risk_rating',
            'primary_hazard',
            'first_aid_payload',
            'knowledge_payload',
            'verification_notes'
        ]


class AnalysisSessionSerializer(serializers.ModelSerializer):
    """
    Serializes the overall session including user inputs, latency, and agent results.
    """
    result = AnalysisResultSerializer(read_only=True)

    class Meta:
        model = AnalysisSession
        fields = [
            'id',
            'created_at',
            'image',
            'user_description',
            'latency_ms',
            'status',
            'result'
        ]


class AnalysisRequestSerializer(serializers.Serializer):
    """
    Validates form data sent by React frontend.
    """
    image = serializers.ImageField(required=True)
    user_description = serializers.CharField(required=False, allow_blank=True, allow_null=True, default="")
