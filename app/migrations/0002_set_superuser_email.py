# Data migration: set email for superusers to admin@mail.ru

from django.db import migrations


def set_superuser_email(apps, schema_editor):
    User = apps.get_model('auth', 'User')
    User.objects.filter(is_superuser=True).update(email='admin@mail.ru')


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(set_superuser_email, noop),
    ]
