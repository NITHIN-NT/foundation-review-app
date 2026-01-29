from django.db import models
from django.conf import settings

class Module(models.Model):
    name = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Question(models.Model):
    module = models.ForeignKey(Module, related_name='questions', on_delete=models.CASCADE)
    text = models.TextField()
    answer = models.TextField(blank=True, null=True)  # New answer field
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.module.name}: {self.text[:50]}"

class ReviewSession(models.Model):
    reviewer = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='reviews_given', on_delete=models.CASCADE)
    # Changed from FK to text field for flexibility
    student_name = models.CharField(max_length=200, blank=True, null=True)
    batch = models.CharField(max_length=100, blank=True, null=True)
    coordinator = models.CharField(max_length=200, blank=True, null=True)
    # Removed student FK as students no longer have accounts
    module = models.ForeignKey(Module, on_delete=models.SET_NULL, null=True, blank=True)
    date = models.DateTimeField(auto_now_add=True)
    is_completed = models.BooleanField(default=False)
    feedback_text = models.TextField(blank=True, null=True)
    scorecard_data = models.JSONField(default=dict, blank=True)

    def __str__(self):
        name = self.student_name or "Unknown"
        return f"Review for {name} by {self.reviewer} on {self.date.strftime('%Y-%m-%d')}"

class ReviewResponse(models.Model):
    STATUS_CHOICES = (
        ('ANSWERED', 'Answered'),
        ('NOT_ANSWERED', 'Not Answered'),
        ('IMPROVEMENT', 'Need Improvement'),
        ('SKIPPED', 'Skipped'),
    )
    
    session = models.ForeignKey(ReviewSession, related_name='responses', on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    
    def __str__(self):
        return f"{self.session} - {self.question.text[:20]} - {self.status}"
