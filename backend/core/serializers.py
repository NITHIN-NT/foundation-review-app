from rest_framework import serializers
from .models import Module, Question, ReviewSession, ReviewResponse
from users.serializers import UserSerializer

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'

class ModuleSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    class Meta:
        model = Module
        fields = ['id', 'name', 'questions']

class ReviewResponseSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source='question.text', read_only=True)
    
    class Meta:
        model = ReviewResponse
        fields = ['id', 'session', 'question', 'question_text', 'status']

class ReviewSessionSerializer(serializers.ModelSerializer):
    responses = ReviewResponseSerializer(many=True, read_only=True)
    student_display_name = serializers.SerializerMethodField()
    reviewer_name = serializers.CharField(source='reviewer.first_name', read_only=True)
    module_name = serializers.CharField(source='module.name', read_only=True)

    class Meta:
        model = ReviewSession
        fields = [
            'id', 'reviewer', 'student_name', 'student_display_name', 
            'reviewer_name', 'batch', 'coordinator', 'module', 'module_name',
            'date', 'is_completed', 'feedback_text', 'responses', 'scorecard_data'
        ]

    def get_student_display_name(self, obj):
        return obj.student_name or "Unknown"
