from decimal import Decimal
from django.db import migrations


def seed_more_courses(apps, schema_editor):
    Course = apps.get_model('app', 'Course')

    courses = [
        # BEGINNER
        {
            'title': 'Python Basics: from Zero to First Scripts',
            'description': 'Learn variables, conditions, loops, functions, and work with files. Practice-first course for beginners.',
            'level': 'beginner',
            'price': None,
        },
        {
            'title': 'HTML & CSS Fundamentals',
            'description': 'Build your first webpages, learn layout, responsive design, and basic UI components.',
            'level': 'beginner',
            'price': None,
        },
        {
            'title': 'JavaScript Starter Pack',
            'description': 'Core JS syntax, arrays/objects, DOM basics, and small projects.',
            'level': 'beginner',
            'price': Decimal('1990.00'),
        },
        {
            'title': 'Git for Beginners',
            'description': 'Commits, branches, pull requests, and practical teamwork workflows.',
            'level': 'beginner',
            'price': None,
        },
        # INTERMEDIATE
        {
            'title': 'React: Practical Components & State',
            'description': 'Hooks, forms, data fetching, routing patterns, and performance basics.',
            'level': 'intermediate',
            'price': Decimal('4990.00'),
        },
        {
            'title': 'SQL for Analytics',
            'description': 'Joins, grouping, window functions, and real аналитические задачи.',
            'level': 'intermediate',
            'price': Decimal('3990.00'),
        },
        {
            'title': 'REST APIs with Django REST Framework',
            'description': 'Serializers, permissions, JWT auth, and production-ready API structure.',
            'level': 'intermediate',
            'price': Decimal('7990.00'),
        },
        {
            'title': 'QA: Manual Testing + Bug Reports',
            'description': 'Test cases, чек-листы, баг-репорты, и основы тестирования веб-приложений.',
            'level': 'intermediate',
            'price': Decimal('2990.00'),
        },
        # ADVANCED
        {
            'title': 'System Design Basics (Advanced)',
            'description': 'Scalability, caching, queues, databases, and designing reliable services.',
            'level': 'advanced',
            'price': Decimal('9990.00'),
        },
        {
            'title': 'Python: Async & Performance',
            'description': 'Asyncio, профилирование, оптимизация и практики высоконагруженных сервисов.',
            'level': 'advanced',
            'price': Decimal('8990.00'),
        },
        {
            'title': 'Data Engineering: ETL Pipelines',
            'description': 'Batch/streaming, orchestration, data quality, and pipeline patterns.',
            'level': 'advanced',
            'price': Decimal('10990.00'),
        },
        {
            'title': 'Secure Web Applications (Advanced)',
            'description': 'OWASP Top 10, threat modeling, auth hardening, and practical security checks.',
            'level': 'advanced',
            'price': Decimal('11990.00'),
        },
    ]

    for c in courses:
        obj, created = Course.objects.get_or_create(
            title=c['title'],
            defaults={
                'description': c['description'],
                'level': c['level'],
                'price': c['price'],
            },
        )
        if not created:
            # Не перетираем вручную отредактированное описание/цену, но если level пустой/неверный — поправим.
            if obj.level != c['level']:
                obj.level = c['level']
                obj.save(update_fields=['level'])


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0015_seed_exam_english_texts_powerbi'),
    ]

    operations = [
        migrations.RunPython(seed_more_courses, reverse_code=migrations.RunPython.noop),
    ]

