from django.db import migrations

VIDEO_FUNCTIONS = 'https://www.youtube.com/embed/9Os0o3wzS_I'


def fix_url(apps, schema_editor):
    Lesson = apps.get_model('app', 'Lesson')
    Lesson.objects.filter(pk=30, module__course_id=2, content_type='video').update(
        content=VIDEO_FUNCTIONS,
    )


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0023_python_basics_final_exam'),
    ]

    operations = [
        migrations.RunPython(fix_url, noop),
    ]
