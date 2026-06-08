# HTML & CSS Fundamentals: урок 1.2 «История интернета»

from django.db import migrations


CONTENT_RU = """Для начала мы хотим немного рассказать про интернет. Это поможет тебе увидеть общую картину и понять, что и почему ты сейчас будешь изучать.

История интернета начинается в 60-годы XX века. Впервые концепцию описал один американский учёный и эпично назвал её «Галактическая сеть».

В 1969 американское агентство DARPA начало создавать экспериментальную сеть «с коммутацией пакетов». Её назвали ARPANET.

Коммутация пакетов - способ передачи данных по сети. Принцип работы очень простой: делим информацию на маленькие пакеты и отправляем их независимо друг от друга. Это нужно для надёжности, скорости и эффективности.

В декабре 1970 года Network Working Group придумала протокол управления сетью, а в 1971 - 1972 его реализовали в ARPANET. Благодаря этому, появилась возможность создавать сетевые приложения. Первым приложением стала электронная почта, её сделали в 1972-м.

Но это всё научные исследования. Интернет, каким мы его знаем, придумал Тим Бернерс-Ли. Он изобрёл технологии URI/URL, HTTP, и HTML."""

CONTENT_EN = """First, we want to tell you a bit about the internet. This will help you see the big picture and understand what you are about to learn and why.

The history of the internet begins in the 1960s. An American scientist first described the concept and dramatically called it the "Galactic Network."

In 1969, the American agency DARPA began building an experimental "packet-switched" network called ARPANET.

Packet switching is a way to transmit data over a network. The principle is simple: split information into small packets and send them independently. This improves reliability, speed, and efficiency.

In December 1970, the Network Working Group designed a network control protocol, and in 1971–1972 it was implemented in ARPANET. This made it possible to build network applications. The first was email, created in 1972.

But all of this was scientific research. The internet as we know it was invented by Tim Berners-Lee. He created URI/URL, HTTP, and HTML."""


def seed(apps, schema_editor):
    Course = apps.get_model('app', 'Course')
    Module = apps.get_model('app', 'Module')
    Lesson = apps.get_model('app', 'Lesson')

    course = Course.objects.filter(title='HTML & CSS Fundamentals').first()
    if not course:
        return

    module, _ = Module.objects.get_or_create(
        course=course,
        order=1,
        defaults={'title': 'Вступление', 'title_en': 'Introduction'},
    )

    Lesson.objects.get_or_create(
        module=module,
        order=2,
        defaults={
            'title': 'История интернета',
            'title_en': 'History of the Internet',
            'content_type': 'text',
            'content': CONTENT_RU,
            'content_en': CONTENT_EN,
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
    if module:
        Lesson.objects.filter(module=module, order=2, title='История интернета').delete()


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0028_html_css_lesson_01_greeting'),
    ]

    operations = [
        migrations.RunPython(seed, reverse_seed),
    ]
