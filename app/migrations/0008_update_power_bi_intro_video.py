# Data migration: обновить видео в уроке "Вступление от автора"

from django.db import migrations


def update_intro_video(apps, schema_editor):
    Course = apps.get_model('app', 'Course')
    Module = apps.get_model('app', 'Module')
    Lesson = apps.get_model('app', 'Lesson')
    course = Course.objects.filter(title__icontains='Power BI').first()
    if not course:
        return
    m1 = Module.objects.filter(course=course, order=1).first()
    if not m1:
        return
    Lesson.objects.filter(module=m1, order=1, title='Вступление от автора').update(
        content='https://www.youtube.com/embed/psffGqB7TKY',
    )


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0007_seed_power_bi_modules_lessons'),
    ]

    operations = [
        migrations.RunPython(update_intro_video, noop),
    ]
