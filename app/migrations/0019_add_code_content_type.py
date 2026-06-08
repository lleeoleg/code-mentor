from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0018_alter_examchoice_text_alter_examquestion_text'),
    ]

    operations = [
        migrations.AlterField(
            model_name='lesson',
            name='content_type',
            field=models.CharField(
                choices=[('video', 'Видео'), ('text', 'Текст'), ('code', 'Код (Python)')],
                default='text',
                max_length=20,
                verbose_name='Тип контента',
            ),
        ),
    ]
