import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import User

def setup_users():
    # 1. Delete all existing users
    print("Deleting all existing users...")
    User.objects.all().delete()

    # 2. Create Superuser (Everywhere)
    # Role ADMIN but is_superuser=True
    User.objects.create_superuser(
        email='superuser@review.com',
        password='Superuser@123',
        first_name='Global',
        last_name='Admin',
        role='ADMIN'
    )
    print("Created Superuser: superuser@review.com / Superuser@123")

    # 3. Create Reviewer (User Side Only)
    User.objects.create_user(
        email='reviewer@review.com',
        password='Reviewer@123',
        first_name='Sujith',
        last_name='Reviewer',
        role='REVIEWER'
    )
    print("Created Reviewer: reviewer@review.com / Reviewer@123")

    # 4. Create Admin (Admin Side Only)
    # Role ADMIN, is_staff=True but not superuser
    User.objects.create_user(
        email='admin@review.com',
        password='Admin@123',
        first_name='Nithin',
        last_name='Admin',
        role='ADMIN',
        is_staff=True
    )
    print("Created Admin: admin@review.com / Admin@123")

if __name__ == "__main__":
    setup_users()
