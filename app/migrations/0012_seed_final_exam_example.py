from django.db import migrations


def seed_final_exam(apps, schema_editor):
    Course = apps.get_model('app', 'Course')
    CourseExam = apps.get_model('app', 'CourseExam')
    ExamQuestion = apps.get_model('app', 'ExamQuestion')
    ExamChoice = apps.get_model('app', 'ExamChoice')

    course = Course.objects.filter(title__icontains='power bi').order_by('id').first()
    if course is None:
        course = Course.objects.order_by('id').first()
    if course is None:
        return

    exam, _created = CourseExam.objects.get_or_create(
        course=course,
        defaults={'is_active': True, 'pass_percent': 80, 'questions_count': 10},
    )
    if not exam.is_active:
        exam.is_active = True
        exam.save(update_fields=['is_active'])

    # Если уже есть вопросы — не перезаписываем (чтобы не портить ручное заполнение).
    if ExamQuestion.objects.filter(exam=exam).exists():
        return

    questions = [
        {
            'ru': 'Какова основная цель Power BI?',
            'en': 'What is the main purpose of Power BI?',
            'choices': [
                ({'ru': 'Визуализация данных и бизнес-аналитика', 'en': 'Data visualization and business analytics'}, True),
                ({'ru': 'Разработка мобильных игр', 'en': 'Mobile game development'}, False),
                ({'ru': 'Установка операционной системы', 'en': 'Operating system installation'}, False),
                ({'ru': 'Редактирование фотографий', 'en': 'Photo editing'}, False),
            ],
        },
        {
            'ru': 'Какой компонент в основном используется для создания интерактивных отчётов в Power BI?',
            'en': 'Which component is primarily used to create interactive reports in Power BI?',
            'choices': [
                ({'ru': 'Power BI Desktop', 'en': 'Power BI Desktop'}, True),
                ({'ru': 'Блокнот', 'en': 'Notepad'}, False),
                ({'ru': 'Только PowerPoint', 'en': 'PowerPoint only'}, False),
                ({'ru': 'Калькулятор', 'en': 'Calculator'}, False),
            ],
        },
        {
            'ru': 'Что такое dataset (набор данных) в Power BI?',
            'en': 'What is a Power BI dataset?',
            'choices': [
                ({'ru': 'Набор данных для построения отчётов и дашбордов', 'en': 'A collection of data used to build reports and dashboards'}, True),
                ({'ru': 'Тип сочетания клавиш', 'en': 'A type of keyboard shortcut'}, False),
                ({'ru': 'Видео-файл', 'en': 'A video file'}, False),
                ({'ru': 'Драйвер принтера', 'en': 'A printer driver'}, False),
            ],
        },
        {
            'ru': 'Что означает “моделирование данных” в Power BI?',
            'en': 'What does “data modeling” mean in Power BI?',
            'choices': [
                ({'ru': 'Создание связей между таблицами и определение мер', 'en': 'Creating relationships between tables and defining measures'}, True),
                ({'ru': 'Рисование 3D-моделей', 'en': 'Drawing 3D models'}, False),
                ({'ru': 'Сжатие изображений', 'en': 'Compressing images'}, False),
                ({'ru': 'Изменение разрешения экрана', 'en': 'Changing screen resolution'}, False),
            ],
        },
        {
            'ru': 'Какой язык используется для мер (measures) в Power BI?',
            'en': 'Which language is used for measures in Power BI?',
            'choices': [
                ({'ru': 'DAX', 'en': 'DAX'}, True),
                ({'ru': 'HTML', 'en': 'HTML'}, False),
                ({'ru': 'CSS', 'en': 'CSS'}, False),
                ({'ru': 'Bash', 'en': 'Bash'}, False),
            ],
        },
        {
            'ru': 'Для чего предназначен Power Query?',
            'en': 'What is the purpose of Power Query?',
            'choices': [
                ({'ru': 'Загрузка и преобразование данных (ETL)', 'en': 'Extract, transform, and load (ETL) data'}, True),
                ({'ru': 'Воспроизведение аудио', 'en': 'Play audio files'}, False),
                ({'ru': 'Управление службами Windows', 'en': 'Manage Windows services'}, False),
                ({'ru': '3D-графика', 'en': 'Render 3D graphics'}, False),
            ],
        },
        {
            'ru': 'Что такое дашборд (dashboard) в Power BI?',
            'en': 'What is a Power BI dashboard?',
            'choices': [
                ({'ru': 'Одна страница с ключевыми визуализациями и метриками', 'en': 'A single-page view of key visuals and metrics'}, True),
                ({'ru': 'Таблица в базе данных', 'en': 'A table in a database'}, False),
                ({'ru': 'Тип электронного письма', 'en': 'A type of email'}, False),
                ({'ru': 'Компилятор', 'en': 'A programming compiler'}, False),
            ],
        },
        {
            'ru': 'Что лучше всего описывает “measure” (меру) в Power BI?',
            'en': 'Which of the following best describes a “measure” in Power BI?',
            'choices': [
                ({'ru': 'DAX-вычисление, которое считается при выполнении запроса', 'en': 'A DAX calculation evaluated at query time'}, True),
                ({'ru': 'Столбец, который никогда не меняется', 'en': 'A column that never changes'}, False),
                ({'ru': 'Тема диаграмм', 'en': 'A chart theme'}, False),
                ({'ru': 'Расширение файла', 'en': 'A file extension'}, False),
            ],
        },
        {
            'ru': 'Что делает “refresh” (обновление) в Power BI?',
            'en': 'What does “refresh” do in Power BI?',
            'choices': [
                ({'ru': 'Обновляет данные отчёта/набора данных из источника', 'en': 'Updates the data in a dataset/report from the source'}, True),
                ({'ru': 'Удаляет отчёт', 'en': 'Deletes the report'}, False),
                ({'ru': 'Меняет заряд батареи', 'en': 'Changes the device battery'}, False),
                ({'ru': 'Устанавливает новый шрифт', 'en': 'Installs a new font'}, False),
            ],
        },
        {
            'ru': 'Зачем строить связи (relationships) между таблицами?',
            'en': 'What is the goal of building relationships between tables?',
            'choices': [
                ({'ru': 'Чтобы корректно работали фильтры и агрегации между таблицами', 'en': 'Enable correct filtering and aggregation across data'}, True),
                ({'ru': 'Увеличить яркость экрана', 'en': 'Increase screen brightness'}, False),
                ({'ru': 'Автоматически шифровать PDF', 'en': 'Encrypt PDFs automatically'}, False),
                ({'ru': 'Уменьшить скорость CPU', 'en': 'Reduce CPU speed'}, False),
            ],
        },
    ]

    for idx, q in enumerate(questions, start=1):
        question = ExamQuestion.objects.create(exam=exam, text=q['ru'], order=idx)
        # text_en поле появится позже (в миграции 0013), но вопросы/варианты создадим сейчас,
        # затем миграция 0014 заполнит text_en из text. После этого можно отредактировать EN в админке.
        for choice_obj, is_correct in q['choices']:
            ExamChoice.objects.create(
                question=question,
                text=choice_obj['ru'],
                is_correct=is_correct,
            )


def unseed_final_exam(apps, schema_editor):
    Course = apps.get_model('app', 'Course')
    CourseExam = apps.get_model('app', 'CourseExam')
    ExamQuestion = apps.get_model('app', 'ExamQuestion')
    ExamChoice = apps.get_model('app', 'ExamChoice')

    course = Course.objects.filter(title__icontains='power bi').order_by('id').first()
    if course is None:
        course = Course.objects.order_by('id').first()
    if course is None:
        return

    exam = CourseExam.objects.filter(course=course).first()
    if not exam:
        return

    # Удаляем только если вопросы совпадают с нашим сидом (мы создавали их только при пустом тесте).
    qids = list(ExamQuestion.objects.filter(exam=exam).values_list('id', flat=True))
    ExamChoice.objects.filter(question_id__in=qids).delete()
    ExamQuestion.objects.filter(id__in=qids).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0011_course_exam_and_certificate'),
    ]

    operations = [
        migrations.RunPython(seed_final_exam, reverse_code=unseed_final_exam),
    ]

