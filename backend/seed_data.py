import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import User
from core.models import Module, Question

def seed():
    # Create Reviewer
    reviewer, created = User.objects.get_or_create(email='reviewer@example.com', defaults={
        'first_name': 'John', 'last_name': 'Reviewer', 'role': 'REVIEWER'
    })
    if created:
        reviewer.set_password('pass123')
        reviewer.save()
        print("Created Reviewer: reviewer@example.com / pass123")

    # Create Student
    student, created = User.objects.get_or_create(email='student@example.com', defaults={
        'first_name': 'Jane', 'last_name': 'Student', 'role': 'STUDENT'
    })
    if created:
        student.set_password('pass123')
        student.save()
        print("Created Student: student@example.com / pass123")

    # Create Modules & Questions
    modules_data = {
        'React Basics': ['What is a Component?', 'Explain State vs Props', 'What is the Virtual DOM?'],
        'Django Basics': ['Explain MVT architecture', 'What is middleware?', 'How do Migrations work?'],
        'Advanced React': ['What is UseEffect?', 'Explain Context API', 'What are Custom Hooks?']
    }

    for name, questions in modules_data.items():
        mod, _ = Module.objects.get_or_create(name=name)
        for q_text in questions:
            Question.objects.get_or_create(module=mod, text=q_text)
        print(f"Created Module: {name} with {len(questions)} questions")

if __name__ == '__main__':
    seed()
