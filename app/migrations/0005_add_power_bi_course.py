# Data migration: добавляем курс Power BI

from decimal import Decimal
from django.db import migrations


def add_power_bi_course(apps, schema_editor):
    Course = apps.get_model('app', 'Course')
    Course.objects.get_or_create(
        title='Power BI: от новичка до уверенного бизнес-пользователя',
        defaults={
            'description': (
                'Курс-аналог популярной программы с Udemy. Вы научитесь подключать данные из разных источников '
                '(Excel, PDF, веб, CRM и ERP), очищать и преобразовывать их, строить модели данных и создавать '
                'отчёты и дашборды в Power BI. Освоите основы языка DAX. В итоге — 100% навыков для практической '
                'работы и 70%+ для сдачи сертификации Power BI DA-100.'
            ),
            'level': 'beginner',
            'price': Decimal('1590.00'),
        },
    )


def remove_power_bi_course(apps, schema_editor):
    Course = apps.get_model('app', 'Course')
    Course.objects.filter(
        title='Power BI: от новичка до уверенного бизнес-пользователя',
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0004_add_course_price'),
    ]

    operations = [
        migrations.RunPython(add_power_bi_course, remove_power_bi_course),
    ]
