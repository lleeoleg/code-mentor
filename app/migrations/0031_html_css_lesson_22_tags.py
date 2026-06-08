# HTML & CSS Fundamentals: урок 2.2 «Теги»

from django.db import migrations


CONTENT_RU = """<p>Как ты уже догадался, в HTML для разметки используется особый набор символов. Он называется <strong>тег</strong>.</p>

<h2>Что такое тег</h2>
<p>Тег — это синтаксическая единица языка HTML, которая выделяет или создаёт элемент. Это набор символов, с помощью которого браузер понимает, где элемент создаётся, начинается и заканчивается. Есть 2 вида тегов: двойные и одинарные.</p>

<h2>Двойные теги</h2>
<p>Двойные теги показывают начало и конец элемента. Начало элемента обозначается открывающим тегом <code>&lt;…&gt;</code>, а конец — закрывающим <code>&lt;/…&gt;</code>.</p>
<p>Двойной тег обязательно должен быть закрыт. Даже несмотря на то, что современные браузеры умеют в некоторых случаях понимать разметку без закрытых тегов, лучше всегда закрывать их.</p>

<h2>Одинарные теги</h2>
<p>Одинарные теги просто не имеют пары. Примеры: тег переноса строки <code>&lt;br&gt;</code> или горизонтальной линии <code>&lt;hr&gt;</code>.</p>
<p>Старые браузеры требовали закрывать одинарные теги: <code>&lt;br /&gt;</code>, сейчас таких браузеров практически не осталось и допустимо использовать оба варианта синтаксиса.</p>"""

CONTENT_EN = """<p>As you may have guessed, HTML uses a special set of characters for markup. It is called a <strong>tag</strong>.</p>

<h2>What is a tag</h2>
<p>A tag is a syntactic unit of HTML that highlights or creates an element. It is a set of characters that tells the browser where an element is created, where it starts, and where it ends. There are two kinds of tags: paired and void (self-closing).</p>

<h2>Paired tags</h2>
<p>Paired tags mark the start and end of an element. The start is an opening tag <code>&lt;…&gt;</code>, and the end is a closing tag <code>&lt;/…&gt;</code>.</p>
<p>A paired tag must be closed. Even though modern browsers can sometimes understand markup without closing tags, it is better to always close them.</p>

<h2>Void tags</h2>
<p>Void tags have no closing pair. Examples: line break <code>&lt;br&gt;</code> or horizontal rule <code>&lt;hr&gt;</code>.</p>
<p>Older browsers required void tags to be closed: <code>&lt;br /&gt;</code>. There are almost no such browsers left today, and both syntax variants are acceptable.</p>"""


def seed(apps, schema_editor):
    Course = apps.get_model('app', 'Course')
    Module = apps.get_model('app', 'Module')
    Lesson = apps.get_model('app', 'Lesson')

    course = Course.objects.filter(title='HTML & CSS Fundamentals').first()
    if not course:
        return

    module = Module.objects.filter(course=course, order=2).first()
    if not module:
        module = Module.objects.create(
            course=course, order=2, title='HTML: База', title_en='HTML: Basics',
        )

    Lesson.objects.get_or_create(
        module=module,
        order=2,
        defaults={
            'title': 'Теги',
            'title_en': 'Tags',
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

    module = Module.objects.filter(course=course, order=2).first()
    if module:
        Lesson.objects.filter(module=module, order=2, title='Теги').delete()


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0030_html_css_lesson_21_html'),
    ]

    operations = [
        migrations.RunPython(seed, reverse_seed),
    ]
