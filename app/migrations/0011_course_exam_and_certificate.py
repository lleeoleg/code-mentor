from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0010_power_bi_price_tenge'),
    ]

    operations = [
        migrations.CreateModel(
            name='CourseExam',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('is_active', models.BooleanField(default=True, verbose_name='Активен')),
                ('pass_percent', models.PositiveIntegerField(default=80, verbose_name='Порог прохождения (%)')),
                ('questions_count', models.PositiveIntegerField(default=10, verbose_name='Количество вопросов')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Создан')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Обновлён')),
                ('course', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='final_exam', to='app.course')),
            ],
            options={
                'verbose_name': 'Финальный тест',
                'verbose_name_plural': 'Финальные тесты',
            },
        ),
        migrations.CreateModel(
            name='ExamAttempt',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(choices=[('in_progress', 'В процессе'), ('submitted', 'Отправлен'), ('passed', 'Пройден'), ('failed', 'Не пройден')], default='in_progress', max_length=20, verbose_name='Статус')),
                ('score_percent', models.PositiveIntegerField(default=0, verbose_name='Результат (%)')),
                ('max_questions', models.PositiveIntegerField(default=10, verbose_name='Макс. вопросов')),
                ('correct_answers', models.PositiveIntegerField(default=0, verbose_name='Правильных ответов')),
                ('started_at', models.DateTimeField(auto_now_add=True, verbose_name='Начат')),
                ('submitted_at', models.DateTimeField(blank=True, null=True, verbose_name='Отправлен')),
                ('exam', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='attempts', to='app.courseexam')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='exam_attempts', to='auth.user')),
            ],
            options={
                'verbose_name': 'Попытка теста',
                'verbose_name_plural': 'Попытки теста',
                'ordering': ['-started_at'],
            },
        ),
        migrations.CreateModel(
            name='ExamQuestion',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('text', models.TextField(verbose_name='Вопрос')),
                ('order', models.PositiveIntegerField(default=0, verbose_name='Порядок')),
                ('exam', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='questions', to='app.courseexam')),
            ],
            options={
                'verbose_name': 'Вопрос теста',
                'verbose_name_plural': 'Вопросы теста',
                'ordering': ['exam', 'order', 'id'],
            },
        ),
        migrations.CreateModel(
            name='ExamChoice',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('text', models.CharField(max_length=500, verbose_name='Вариант')),
                ('is_correct', models.BooleanField(default=False, verbose_name='Правильный')),
                ('question', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='choices', to='app.examquestion')),
            ],
            options={
                'verbose_name': 'Вариант ответа',
                'verbose_name_plural': 'Варианты ответов',
            },
        ),
        migrations.CreateModel(
            name='CourseCertificate',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('issued_at', models.DateTimeField(default=django.utils.timezone.now, verbose_name='Выдан')),
                ('certificate_number', models.CharField(max_length=64, unique=True, verbose_name='Номер сертификата')),
                ('course', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='certificates', to='app.course')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='course_certificates', to='auth.user')),
            ],
            options={
                'verbose_name': 'Сертификат',
                'verbose_name_plural': 'Сертификаты',
                'ordering': ['-issued_at'],
                'unique_together': {('user', 'course')},
            },
        ),
        migrations.CreateModel(
            name='ExamAnswer',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('is_correct', models.BooleanField(default=False, verbose_name='Правильно')),
                ('attempt', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='answers', to='app.examattempt')),
                ('question', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='answers', to='app.examquestion')),
                ('selected_choice', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='app.examchoice')),
            ],
            options={
                'verbose_name': 'Ответ на вопрос',
                'verbose_name_plural': 'Ответы на вопросы',
                'unique_together': {('attempt', 'question')},
            },
        ),
    ]

