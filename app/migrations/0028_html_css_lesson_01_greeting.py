# HTML & CSS Fundamentals: модуль «Вступление», урок 1.1 «Приветствие»

from django.db import migrations


GREETING_RU = """Привет!

Добро пожаловать на курс! На нём ты узнаешь как работает интернет, научишься создавать сайты с помощью HTML и CSS и размещать их в сети. Попутно освоишь основные инструменты веб-разработчика: редактор кода, отладчик, Google.

Не бойся страшных непонятных слов! Курс создан специально для людей, которые никогда не программировали и ничего не знают о работе интернета. Тем не менее, часть информации тебе придётся гуглить и осмыслять.

Если у тебя есть идеи, как сделать курс лучше - пиши их в комментариях. Жалобы на непонятное и сложное тоже приветствуются."""

GREETING_EN = """Hello!

Welcome to the course! Here you will learn how the internet works, how to build websites with HTML and CSS, and how to publish them online. Along the way you will get familiar with essential web developer tools: a code editor, debugger, and Google.

Don't be afraid of scary unfamiliar words! This course is designed for people who have never programmed and know nothing about how the internet works. Still, you will need to google some topics and think them through on your own.

If you have ideas on how to improve the course, leave them in the comments. Complaints about unclear or difficult parts are welcome too."""


def seed_html_css_greeting(apps, schema_editor):
    Course = apps.get_model('app', 'Course')
    Module = apps.get_model('app', 'Module')
    Lesson = apps.get_model('app', 'Lesson')

    course = Course.objects.filter(title='HTML & CSS Fundamentals').first()
    if not course:
        return

    module, _ = Module.objects.get_or_create(
        course=course,
        order=1,
        defaults={
            'title': 'Вступление',
            'title_en': 'Introduction',
        },
    )

    Lesson.objects.get_or_create(
        module=module,
        order=1,
        defaults={
            'title': 'Приветствие',
            'title_en': 'Welcome',
            'content_type': 'text',
            'content': GREETING_RU,
            'content_en': GREETING_EN,
            'is_free': True,
        },
    )


def reverse_seed(apps, schema_editor):
    Course = apps.get_model('app', 'Course')
    Module = apps.get_model('app', 'Module')
    Lesson = apps.get_model('app', 'Lesson')

    course = Course.objects.filter(title='HTML & CSS Fundamentals').first()
    if not course:
        return

    module = Module.objects.filter(course=course, order=1, title='Вступление').first()
    if not module:
        return

    Lesson.objects.filter(module=module, order=1, title='Приветствие').delete()
    if not Lesson.objects.filter(module=module).exists():
        Module.objects.filter(pk=module.pk).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0027_lesson_video_summary'),
    ]

    operations = [
        migrations.RunPython(seed_html_css_greeting, reverse_seed),
    ]
