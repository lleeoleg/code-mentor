from django.db import migrations


def set_powerbi_exam_en(apps, schema_editor):
    Course = apps.get_model('app', 'Course')
    CourseExam = apps.get_model('app', 'CourseExam')
    ExamQuestion = apps.get_model('app', 'ExamQuestion')
    ExamChoice = apps.get_model('app', 'ExamChoice')

    course = Course.objects.filter(title__icontains='power bi').order_by('id').first()
    if course is None:
        return

    exam = CourseExam.objects.filter(course=course).first()
    if not exam:
        return

    # Маппинг RU -> EN для наших сидовых вопросов/ответов.
    mapping = {
        'Какова основная цель Power BI?': {
            'q': 'What is the main purpose of Power BI?',
            'a': {
                'Визуализация данных и бизнес-аналитика': 'Data visualization and business analytics',
                'Разработка мобильных игр': 'Mobile game development',
                'Установка операционной системы': 'Operating system installation',
                'Редактирование фотографий': 'Photo editing',
            },
        },
        'Какой компонент в основном используется для создания интерактивных отчётов в Power BI?': {
            'q': 'Which component is primarily used to create interactive reports in Power BI?',
            'a': {
                'Power BI Desktop': 'Power BI Desktop',
                'Блокнот': 'Notepad',
                'Только PowerPoint': 'PowerPoint only',
                'Калькулятор': 'Calculator',
            },
        },
        'Что такое dataset (набор данных) в Power BI?': {
            'q': 'What is a Power BI dataset?',
            'a': {
                'Набор данных для построения отчётов и дашбордов': 'A collection of data used to build reports and dashboards',
                'Тип сочетания клавиш': 'A type of keyboard shortcut',
                'Видео-файл': 'A video file',
                'Драйвер принтера': 'A printer driver',
            },
        },
        'Что означает “моделирование данных” в Power BI?': {
            'q': 'What does “data modeling” mean in Power BI?',
            'a': {
                'Создание связей между таблицами и определение мер': 'Creating relationships between tables and defining measures',
                'Рисование 3D-моделей': 'Drawing 3D models',
                'Сжатие изображений': 'Compressing images',
                'Изменение разрешения экрана': 'Changing screen resolution',
            },
        },
        'Какой язык используется для мер (measures) в Power BI?': {
            'q': 'Which language is used for measures in Power BI?',
            'a': {'DAX': 'DAX', 'HTML': 'HTML', 'CSS': 'CSS', 'Bash': 'Bash'},
        },
        'Для чего предназначен Power Query?': {
            'q': 'What is the purpose of Power Query?',
            'a': {
                'Загрузка и преобразование данных (ETL)': 'Extract, transform, and load (ETL) data',
                'Воспроизведение аудио': 'Play audio files',
                'Управление службами Windows': 'Manage Windows services',
                '3D-графика': 'Render 3D graphics',
            },
        },
        'Что такое дашборд (dashboard) в Power BI?': {
            'q': 'What is a Power BI dashboard?',
            'a': {
                'Одна страница с ключевыми визуализациями и метриками': 'A single-page view of key visuals and metrics',
                'Таблица в базе данных': 'A table in a database',
                'Тип электронного письма': 'A type of email',
                'Компилятор': 'A programming compiler',
            },
        },
        'Что лучше всего описывает “measure” (меру) в Power BI?': {
            'q': 'Which of the following best describes a “measure” in Power BI?',
            'a': {
                'DAX-вычисление, которое считается при выполнении запроса': 'A DAX calculation evaluated at query time',
                'Столбец, который никогда не меняется': 'A column that never changes',
                'Тема диаграмм': 'A chart theme',
                'Расширение файла': 'A file extension',
            },
        },
        'Что делает “refresh” (обновление) в Power BI?': {
            'q': 'What does “refresh” do in Power BI?',
            'a': {
                'Обновляет данные отчёта/набора данных из источника': 'Updates the data in a dataset/report from the source',
                'Удаляет отчёт': 'Deletes the report',
                'Меняет заряд батареи': 'Changes the device battery',
                'Устанавливает новый шрифт': 'Installs a new font',
            },
        },
        'Зачем строить связи (relationships) между таблицами?': {
            'q': 'What is the goal of building relationships between tables?',
            'a': {
                'Чтобы корректно работали фильтры и агрегации между таблицами': 'Enable correct filtering and aggregation across data',
                'Увеличить яркость экрана': 'Increase screen brightness',
                'Автоматически шифровать PDF': 'Encrypt PDFs automatically',
                'Уменьшить скорость CPU': 'Reduce CPU speed',
            },
        },
    }

    for q_ru, pack in mapping.items():
        q = ExamQuestion.objects.filter(exam=exam, text=q_ru).first()
        if not q:
            continue
        if (q.text_en or '').strip() == q.text.strip() or not (q.text_en or '').strip():
            q.text_en = pack['q']
            q.save(update_fields=['text_en'])
        for c in ExamChoice.objects.filter(question=q):
            en = pack['a'].get(c.text)
            if en and ((c.text_en or '').strip() == c.text.strip() or not (c.text_en or '').strip()):
                c.text_en = en
                c.save(update_fields=['text_en'])


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0014_backfill_exam_i18n'),
    ]

    operations = [
        migrations.RunPython(set_powerbi_exam_en, reverse_code=migrations.RunPython.noop),
    ]

