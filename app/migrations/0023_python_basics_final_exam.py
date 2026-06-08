from django.db import migrations


def seed_exam(apps, schema_editor):
    pass


def reverse_seed(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0022_lesson_27_python_editor_json'),
    ]

    operations = [
        migrations.RunPython(seed_exam, reverse_seed),
    ]
