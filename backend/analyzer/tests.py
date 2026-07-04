from django.test import TestCase
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from .models import AnalysisSession, AnalysisResult
from PIL import Image
import io
from unittest.mock import patch

class AnalyzerTests(TestCase):
    """
    Test suite for Wildlife Risk and Precaution backend views, models, and agents.
    """
    def _create_dummy_image(self, filename: str) -> SimpleUploadedFile:
        """
        Generates a valid 1x1 pixel JPEG file in-memory using Pillow.
        """
        file = io.BytesIO()
        image = Image.new('RGB', (1, 1), color='red')
        image.save(file, 'jpeg')
        file.seek(0)
        return SimpleUploadedFile(
            name=filename,
            content=file.read(),
            content_type='image/jpeg'
        )

    def setUp(self):
        # Setup reusable dummy image for testing upload payloads
        self.dummy_image = self._create_dummy_image('test_creature.jpg')
        
        # Start mock patcher for visual classification agent
        self.patcher = patch('analyzer.agents.species.SpeciesAgent.detect_species')
        self.mock_detect = self.patcher.start()

    def tearDown(self):
        self.patcher.stop()

    def test_analyze_rattlesnake_successful_response(self):
        self.mock_detect.return_value = {
            "detected_candidates": [
                {"common_name": "Western Diamondback Rattlesnake", "scientific_name": "Crotalus oreganus", "confidence": 0.92},
                {"common_name": "Gopher Snake", "scientific_name": "Pituophis catenifer", "confidence": 0.05},
                {"common_name": "Common Garter Snake", "scientific_name": "Thamnophis sirtalis", "confidence": 0.03}
            ],
            "image_quality_check": {
                "passes": True,
                "issue": None
            }
        }
        url = reverse('analyze')
        # Simulate rattlesnake upload
        response = self.client.post(url, {
            'image': self.dummy_image,
            'user_description': 'I saw a rattlesnake slithering in the dry grass!'
        })

        self.assertEqual(response.status_code, 200)
        res_data = response.json()
        self.assertEqual(res_data['status'], 'success')
        self.assertIn('latency_ms', res_data)

        # Validate card-based JSON structure outputs
        data = res_data['data']
        self.assertIn('card_species', data)
        self.assertIn('card_risk', data)
        self.assertIn('card_first_aid', data)
        self.assertIn('card_knowledge', data)

        # Validate species detection
        species = data['card_species']
        self.assertEqual(species['common_name'], 'Western Diamondback Rattlesnake')
        self.assertEqual(species['scientific_name'], 'Crotalus oreganus')
        self.assertTrue(species['confidence'] >= 0.80)
        self.assertFalse(species['region_mismatch'])

        # Validate risk rating color-code mappings
        risk = data['card_risk']
        self.assertEqual(risk['rating'], 'Critical')
        self.assertEqual(risk['color_code'], 'danger')
        self.assertTrue(len(risk['precautions']) > 0)

        # Validate first-aid disclaimer and emergency alert constraint #1
        first_aid = data['card_first_aid']
        self.assertTrue(len(first_aid['steps']) > 0)
        self.assertEqual(
            first_aid['steps'][0],
            "CALL EMERGENCY SERVICES (e.g., 911/112) IMMEDIATELY."
        )

        # Validate database records serialization
        session_id = data['session_id']
        self.assertTrue(AnalysisSession.objects.filter(id=session_id).exists())
        self.assertTrue(AnalysisResult.objects.filter(session_id=session_id).exists())

    def test_image_quality_check_failure(self):
        self.mock_detect.return_value = {
            "detected_candidates": [
                {"common_name": "Unknown species", "scientific_name": "Unknown", "confidence": 0.30}
            ],
            "image_quality_check": {
                "passes": False,
                "issue": "blurry"
            }
        }
        url = reverse('analyze')
        blurry_image = self._create_dummy_image('blurry_creature.jpg')
        response = self.client.post(url, {
            'image': blurry_image,
            'user_description': 'photo is a bit blurry'
        })

        self.assertEqual(response.status_code, 200)
        res_data = response.json()
        species = res_data['data']['card_species']
        self.assertFalse(species['quality_passes'])
        self.assertEqual(species['quality_issue'], 'blurry')

    def test_low_confidence_fallback_override(self):
        self.mock_detect.return_value = {
            "detected_candidates": [
                {"common_name": "Unknown species", "scientific_name": "Unknown", "confidence": 0.30}
            ],
            "image_quality_check": {
                "passes": True,
                "issue": None
            }
        }
        url = reverse('analyze')
        unknown_image = self._create_dummy_image('unrecognized.jpg')
        # Send post without descriptors to trigger fallback
        response = self.client.post(url, {
            'image': unknown_image,
            'user_description': 'What is this mystery animal?'
        })

        self.assertEqual(response.status_code, 200)
        res_data = response.json()
        species = res_data['data']['card_species']
        # Verification overrides to safe fallbacks
        self.assertEqual(species['common_name'], 'Unidentified Animal')
        self.assertEqual(species['scientific_name'], 'Unknown')
        self.assertEqual(species['confidence'], 0.0)


    def test_history_list_and_detail_retrieval(self):
        self.mock_detect.return_value = {
            "detected_candidates": [
                {"common_name": "Honey Bee", "scientific_name": "Apis mellifera", "confidence": 0.88}
            ],
            "image_quality_check": {
                "passes": True,
                "issue": None
            }
        }
        # 1. Populate DB with one entry
        url_analyze = reverse('analyze')
        self.client.post(url_analyze, {
            'image': self.dummy_image,
            'user_description': 'bee'
        })

        # 2. Test history list view
        url_history = reverse('history')
        response_list = self.client.get(url_history)
        self.assertEqual(response_list.status_code, 200)
        list_data = response_list.json()
        self.assertTrue(len(list_data['history']) > 0)

        # 3. Test detail retrieval view
        session_id = list_data['history'][0]['id']
        url_detail = reverse('history_detail', kwargs={'session_id': session_id})
        response_detail = self.client.get(url_detail)
        self.assertEqual(response_detail.status_code, 200)
        detail_data = response_detail.json()
        self.assertEqual(detail_data['data']['id'], session_id)
        self.assertIsNotNone(detail_data['data']['result'])

    def test_post_delete_signal_removes_file(self):
        import os
        from django.core.files.storage import default_storage
        from django.core.files.base import ContentFile

        # 1. Create a dummy file in default storage
        file_name = 'signal_test_image.jpg'
        saved_name = default_storage.save(file_name, ContentFile(b"dummy content"))
        saved_path = default_storage.path(saved_name)
        self.assertTrue(os.path.isfile(saved_path))

        # 2. Create AnalysisSession with this image
        session = AnalysisSession.objects.create(
            image=saved_name,
            status='success'
        )

        # 3. Delete session, which should trigger post_delete signal
        session.delete()

        # 4. Check if file has been deleted from disk
        self.assertFalse(os.path.isfile(saved_path))

