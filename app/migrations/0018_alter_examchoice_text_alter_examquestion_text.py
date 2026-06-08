from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0017_course_favorite_lesson_completion'),
    ]

    operations = [
        migrations.AlterField(
            model_name='examchoice',
            name='text',
            field=models.CharField(max_length=500, verbose_name='Вариант (ru)'),
        ),
        migrations.AlterField(
            model_name='examquestion',
            name='text',
            field=models.TextField(verbose_name='Вопрос (ru)'),
        ),
    ]
