from django.db import migrations, models


def fill_video_summaries(apps, schema_editor):
    Lesson = apps.get_model('app', 'Lesson')
    data = {
        1: (
            'В ролике автор курса приветствует вас, рассказывает, чему вы научитесь в программе Power BI, '
            'как устроена работа с данными и отчётами, и чего ожидать от дальнейших уроков.',
            'The instructor welcomes you, explains what you will learn in Power BI, how working with data '
            'and reports is structured, and what to expect in the following lessons.',
        ),
        28: (
            'Короткий обзор языка Python: зачем он нужен, как выглядит синтаксис, переменные, функции и запуск кода — '
            'удобная картина перед текстовыми уроками.',
            'A quick tour of Python: why it is used, how syntax looks, variables, functions, and running code—'
            'a useful overview before the text lessons.',
        ),
        29: (
            'В видео разбираются базовые элементы Python: строки, числа, операции, ввод-вывод и простые примеры кода — '
            'то, что пригодится в модулях про переменные и типы.',
            'The video covers Python basics: strings, numbers, operations, input/output, and simple code examples—'
            'useful for the variables and types modules.',
        ),
        30: (
            'Объясняется, как объявлять функции через def, передавать аргументы, использовать return и докстринги — '
            'напрямую дополняет урок про функции в курсе.',
            'How to define functions with def, pass arguments, use return values, and docstrings—complements the '
            'course lesson on functions.',
        ),
    }
    for pk, (ru, en) in data.items():
        Lesson.objects.filter(pk=pk, content_type='video').update(
            video_summary=ru,
            video_summary_en=en,
        )


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0026_populate_api_i18n'),
    ]

    operations = [
        migrations.AddField(
            model_name='lesson',
            name='video_summary',
            field=models.TextField(
                blank=True,
                default='',
                help_text='Для уроков с типом «Видео»: пересказ темы под роликом.',
                verbose_name='Краткое содержание видео (под плеером)',
            ),
        ),
        migrations.AddField(
            model_name='lesson',
            name='video_summary_en',
            field=models.TextField(blank=True, default='', verbose_name='Video summary (EN)'),
        ),
        migrations.RunPython(fill_video_summaries, noop),
    ]
