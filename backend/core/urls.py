from django.urls import path
from .views import (
    ModuleListCreateView,
    ModuleDetailView,
    QuestionListCreateView,
    QuestionDetailView,
    ReviewSessionListCreateView, 
    ReviewSessionDetailView,
    MarkQuestionView,
    AddQuestionToSessionView
)

urlpatterns = [
    path('modules/', ModuleListCreateView.as_view(), name='module_list'),
    path('modules/<int:pk>/', ModuleDetailView.as_view(), name='module_detail'),
    path('questions/', QuestionListCreateView.as_view(), name='question_list'),
    path('questions/<int:pk>/', QuestionDetailView.as_view(), name='question_detail'),
    path('reviews/', ReviewSessionListCreateView.as_view(), name='review_list'),
    path('reviews/<int:pk>/', ReviewSessionDetailView.as_view(), name='review_detail'),
    path('mark-response/', MarkQuestionView.as_view(), name='mark_response'),
    path('add-question/', AddQuestionToSessionView.as_view(), name='add_question_to_session'),
]
