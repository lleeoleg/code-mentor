from django.db import migrations


def apply(apps, schema_editor):
    pass


def reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0021_restore_python_basics_original_content'),
    ]

    operations = [
        migrations.RunPython(apply, reverse),
    ]
