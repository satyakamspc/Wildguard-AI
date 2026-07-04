import os
import asyncio
from django.http import JsonResponse
from django.views import View
from django.utils.decorators import classonlymethod
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings
from .models import AnalysisSession, AnalysisResult
from .serializers import AnalysisRequestSerializer, AnalysisSessionSerializer
from .agents.orchestrator import OrchestratorAgent
from asgiref.sync import sync_to_async

# Instantiating our orchestrator agent instance
orchestrator = OrchestratorAgent()

class AnalyzeView(View):
    """
    Handles POST requests from UI uploading an image and location parameters.
    Saves image, runs the async orchestrator, caches results to SQLite, and outputs UI JSON.
    """
    @classonlymethod
    def as_view(cls, **initkwargs):
        view = super().as_view(**initkwargs)
        return csrf_exempt(view)

    async def post(self, request, *args, **kwargs):
        # Read multipart form parameters
        data = {
            'image': request.FILES.get('image'),
            'user_description': request.POST.get('user_description', '')
        }

        serializer = AnalysisRequestSerializer(data=data)
        if not serializer.is_valid():
            return JsonResponse({'status': 'error', 'errors': serializer.errors}, status=400)

        validated_data = serializer.validated_data
        image_file = validated_data['image']
        user_description = validated_data['user_description']

        # Save upload to media folder using django default storage
        def save_file():
            # Keep original file name but clean path
            cleaned_filename = "".join([c for c in image_file.name if c.isalnum() or c in '._-'])
            path = default_storage.save(f'uploads/{cleaned_filename}', ContentFile(image_file.read()))
            return default_storage.path(path)
        
        saved_path = await sync_to_async(save_file)()

        # Execute parallel agent orchestration workflow
        try:
            workflow_res = await orchestrator.orchestrate_workflow(
                saved_path, user_description
            )
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': f'Workflow orchestration failed: {str(e)}'
            }, status=500)

        status = workflow_res.get('status', 'success')
        latency_ms = workflow_res.get('latency_ms', 0)
        ui_ready_payload = workflow_res.get('ui_ready_payload', {})

        # If API quota is exhausted, stop immediately and inform the user
        if status == 'quota_exhausted':
            return JsonResponse({
                'status': 'quota_exhausted',
                'message': workflow_res.get('message', 'Gemini API free quota has been exhausted.'),
                'details': (
                    'Your free Gemini API quota (20 requests/day) has been exceeded. '
                    'No analysis can be performed until the quota resets, or you upgrade your plan.'
                )
            }, status=402)

        # Save analysis records to SQLite Database
        def save_session_to_db():
            relative_image_path = f'uploads/{os.path.basename(saved_path)}'
            session = AnalysisSession.objects.create(
                image=relative_image_path,
                user_description=user_description,
                latency_ms=latency_ms,
                status=status
            )
            card_species = ui_ready_payload.get('card_species', {})
            card_risk = ui_ready_payload.get('card_risk', {})
            card_first_aid = ui_ready_payload.get('card_first_aid', {})
            card_knowledge = ui_ready_payload.get('card_knowledge', {})

            AnalysisResult.objects.create(
                session=session,
                common_name=card_species.get('common_name', 'Unknown'),
                scientific_name=card_species.get('scientific_name', 'Unknown'),
                confidence=card_species.get('confidence', 0.0),
                risk_rating=card_risk.get('rating', 'Medium'),
                primary_hazard=card_risk.get('primary_hazard', ''),
                first_aid_payload=card_first_aid,
                knowledge_payload=card_knowledge,
                verification_notes=card_species.get('verification_notes', '')
            )
            return session.id

        session_id = await sync_to_async(save_session_to_db)()

        # Inject generated identifiers into report response metadata
        ui_ready_payload['session_id'] = str(session_id)
        ui_ready_payload['image_url'] = f'{settings.MEDIA_URL}uploads/{os.path.basename(saved_path)}'

        return JsonResponse({
            'status': status,
            'latency_ms': latency_ms,
            'data': ui_ready_payload
        })


class HistoryView(View):
    """
    Returns latest 20 analysis queries history.
    """
    async def get(self, request, *args, **kwargs):
        def get_history_from_db():
            sessions = AnalysisSession.objects.all().order_by('-created_at')[:20]
            serializer = AnalysisSessionSerializer(sessions, many=True)
            return serializer.data

        history_data = await sync_to_async(get_history_from_db)()
        return JsonResponse({'status': 'success', 'history': history_data})


class HistoryDetailView(View):
    """
    Retrieves full details of a specific session ID.
    """
    async def get(self, request, session_id, *args, **kwargs):
        def get_detail_from_db():
            try:
                session = AnalysisSession.objects.get(id=session_id)
                serializer = AnalysisSessionSerializer(session)
                return serializer.data
            except AnalysisSession.DoesNotExist:
                return None

        detail_data = await sync_to_async(get_detail_from_db)()
        if not detail_data:
            return JsonResponse({'status': 'error', 'message': 'Session log entry not found'}, status=404)
        return JsonResponse({'status': 'success', 'data': detail_data})
