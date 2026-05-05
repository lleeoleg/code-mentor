# Generated manually for favorites + lesson progress sync

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('app', '0016_seed_more_courses'),
    ]

    operations = [
        migrations.CreateModel(
            name='CourseFavorite',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Добавлено')),
                ('course', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='favorited_by', to='app.course')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='course_favorites', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Избранный курс',
                'verbose_name_plural': 'Избранные курсы',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='LessonCompletion',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('completed_at', models.DateTimeField(auto_now_add=True, verbose_name='Завершён')),
                ('lesson', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='completions', to='app.lesson')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='lesson_completions', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Пройденный урок',
                'verbose_name_plural': 'Пройденные уроки',
                'ordering': ['-completed_at'],
            },
        ),
        migrations.AddConstraint(
            model_name='coursefavorite',
            constraint=models.UniqueConstraint(fields=('user', 'course'), name='unique_user_course_favorite'),
        ),
        migrations.AddConstraint(
            model_name='lessoncompletion',
            constraint=models.UniqueConstraint(fields=('user', 'lesson'), name='unique_user_lesson_completion'),
        ),
    ]
