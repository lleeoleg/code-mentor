# Data migration: модули и уроки для курса Power BI

from django.db import migrations


def seed_power_bi_curriculum(apps, schema_editor):
    Course = apps.get_model('app', 'Course')
    Module = apps.get_model('app', 'Module')
    Lesson = apps.get_model('app', 'Lesson')

    course = Course.objects.filter(title__icontains='Power BI').first()
    if not course:
        return

    if Module.objects.filter(course=course).exists():
        return

    m1, _ = Module.objects.get_or_create(course=course, order=1, defaults={'title': 'Введение'})
    Lesson.objects.get_or_create(module=m1, order=1, defaults={
        'title': 'Вступление от автора',
        'content_type': 'video',
        'content': 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        'is_free': True,
    })
    Lesson.objects.get_or_create(module=m1, order=2, defaults={
        'title': 'Если Вы просто зашли посмотреть',
        'content_type': 'text',
        'content': 'Краткий обзор курса и как им пользоваться.',
        'is_free': True,
    })
    Lesson.objects.get_or_create(module=m1, order=3, defaults={
        'title': 'Как мы будем учиться',
        'content_type': 'text',
        'content': 'Методология и структура занятий.',
        'is_free': True,
    })

    m2, _ = Module.objects.get_or_create(course=course, order=2, defaults={'title': 'Немного теории'})
    Lesson.objects.get_or_create(module=m2, order=1, defaults={
        'title': 'О чём этот теоретический блок',
        'content_type': 'text',
        'content': 'Теория для понимания основ.',
        'is_free': False,
    })
    Lesson.objects.get_or_create(module=m2, order=2, defaults={
        'title': 'Корпоративный жаргон',
        'content_type': 'text',
        'content': 'Термины и определения.',
        'is_free': False,
    })

    m3, _ = Module.objects.get_or_create(course=course, order=3, defaults={'title': 'Знакомство с Power BI'})
    Lesson.objects.get_or_create(module=m3, order=1, defaults={
        'title': 'А что такое Power BI?',
        'content_type': 'text',
        'content': 'Введение в инструмент.',
        'is_free': False,
    })
    Lesson.objects.get_or_create(module=m3, order=2, defaults={
        'title': 'Особенности использования',
        'content_type': 'text',
        'content': 'Возможности и ограничения.',
        'is_free': False,
    })


def reverse_seed(apps, schema_editor):
    Course = apps.get_model('app', 'Course')
    Module = apps.get_model('app', 'Module')
    course = Course.objects.filter(title__icontains='Power BI').first()
    if course:
        Module.objects.filter(course=course).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0006_add_modules_lessons_enrollment'),
    ]

    operations = [
        migrations.RunPython(seed_power_bi_curriculum, reverse_seed),
    ]
