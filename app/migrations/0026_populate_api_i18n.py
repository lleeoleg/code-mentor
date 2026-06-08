from django.db import migrations


def populate(apps, schema_editor):
    pass


def reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0025_add_api_i18n_fields'),
    ]

    operations = [
        migrations.RunPython(populate, reverse),
    ]
