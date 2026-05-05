# Data migration: цена курса Power BI в тенге (Казахстан)

from decimal import Decimal
from django.db import migrations


def set_power_bi_price_tenge(apps, schema_editor):
    Course = apps.get_model('app', 'Course')
    Course.objects.filter(
        title__icontains='Power BI',
    ).update(price=Decimal('15590.00'))


def revert_power_bi_price(apps, schema_editor):
    Course = apps.get_model('app', 'Course')
    Course.objects.filter(
        title__icontains='Power BI',
    ).update(price=Decimal('1590.00'))


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0009_add_comments'),
    ]

    operations = [
        migrations.RunPython(set_power_bi_price_tenge, revert_power_bi_price),
    ]
