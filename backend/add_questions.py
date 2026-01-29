import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import Module, Question

def add_c_programming_questions():
    """Add C Programming Fundamentals questions to M1 module"""
    
    # Get or create the M1 module
    module, created = Module.objects.get_or_create(name='M1')
    if created:
        print("Created new module: M1")
    else:
        print("Found existing module: M1")
    
    # C Programming questions to add
    questions = [
        # Increment/Decrement operators
        """What is the difference between pre-increment (++x) and post-increment (x++)?

Code Reference:
```c
int x = 10;
int y = ++x; // x is 11, y is 11
int z = x++; // z is 11, x is 12
```""",
        
        # Loop control statements
        """Explain the difference between 'break' and 'continue' statements in loops.

Code Reference:
```c
for(int i = 0; i < 5; i++) {
    if(i == 2) continue; // Skip 2
    if(i == 4) break;    // Stop at 4
    printf("%d", i);
}
```
What will be the output of this code?""",
    ]
    
    added_count = 0
    for q_text in questions:
        question, created = Question.objects.get_or_create(
            module=module,
            text=q_text
        )
        if created:
            added_count += 1
            print(f"Added: {q_text[:50]}...")
        else:
            print(f"Already exists: {q_text[:50]}...")
    
    print(f"\nSummary: Added {added_count} new questions to M1 module")
    print(f"Total questions in M1: {module.questions.count()}")

if __name__ == '__main__':
    add_c_programming_questions()
