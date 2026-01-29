from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Module, Question, ReviewSession, ReviewResponse
from .serializers import ModuleSerializer, QuestionSerializer, ReviewSessionSerializer, ReviewResponseSerializer

class IsReviewer(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'REVIEWER'

class ModuleListCreateView(generics.ListCreateAPIView):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer
    permission_classes = [permissions.IsAuthenticated]

class ModuleDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer
    permission_classes = [permissions.IsAuthenticated]

class QuestionListCreateView(generics.ListCreateAPIView):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated]

class QuestionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated]

class ReviewSessionListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'REVIEWER':
            return ReviewSession.objects.filter(reviewer=user)
        return ReviewSession.objects.filter(student=user)

    def perform_create(self, serializer):
        serializer.save(reviewer=self.request.user)

class ReviewSessionDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = ReviewSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'REVIEWER':
            return ReviewSession.objects.filter(reviewer=user)
        return ReviewSession.objects.filter(student=user)

class MarkQuestionView(APIView):
    permission_classes = [IsReviewer]

    def post(self, request):
        session_id = request.data.get('session_id')
        question_id = request.data.get('question_id')
        status_val = request.data.get('status')
        
        session = get_object_or_404(ReviewSession, id=session_id)
        if session.reviewer != request.user:
            return Response({"error": "Not your session"}, status=status.HTTP_403_FORBIDDEN)
            
        question = get_object_or_404(Question, id=question_id)
        
        response, created = ReviewResponse.objects.update_or_create(
            session=session,
            question=question,
            defaults={'status': status_val}
        )
        return Response(ReviewResponseSerializer(response).data)

class AddQuestionToSessionView(APIView):
    permission_classes = [IsReviewer]

    def post(self, request):
        # Allow creating a question on the fly and adding it to the current context (Module)
        module_id = request.data.get('module_id')
        text = request.data.get('text')
        
        module = get_object_or_404(Module, id=module_id)
        question = Question.objects.create(module=module, text=text)
        
        return Response(QuestionSerializer(question).data, status=status.HTTP_201_CREATED)
