from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0019_add_code_content_type'),
    ]

    operations = [
        migrations.AddField(
            model_name='courseexam',
            name='max_attempts',
            field=models.PositiveIntegerField(default=3, verbose_name='Макс. попыток (за 24ч)'),
        ),
    ]
