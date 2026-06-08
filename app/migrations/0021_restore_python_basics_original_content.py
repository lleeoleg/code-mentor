from django.db import migrations


def restore(apps, schema_editor):
    pass


def reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0020_add_max_attempts'),
    ]

    operations = [
        migrations.RunPython(restore, reverse),
    ]
