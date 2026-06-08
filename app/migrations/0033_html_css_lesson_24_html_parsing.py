# HTML & CSS Fundamentals: урок 2.4 «Особенности интерпретации HTML»

from django.db import migrations


CONTENT_RU = """<p>При преобразовании HTML-кода в веб-страничку есть некоторые особенности, в которых мы сейчас разберёмся.</p>

<h2>Перенос строки только через тег</h2>
<p>Возможно, у тебя возник вопрос, зачем нужен тег переноса строки, если можно просто нажать Enter. Дело в том, что HTML воспринимает перенос строки как пробел. Это нужно потому, что редакторы кода не переносят строки, которые не помещаются в экран — так удобнее писать код. Поэтому чтобы длинный текст влезал в экран, в коде ставятся переносы строки, которые не нужны, когда страница показывается в браузере.</p>

<h2>Несколько пробелов, идущих подряд, считаются за один</h2>
<p>Это происходит по той же причине, что и с переносом строки. Так просто удобнее форматировать код в редакторе. Из-за того, что теги вкладываются друг в друга, для удобного восприятия кода вложенность показывают отступами — пробелами.</p>
<p>Пример:</p>
<pre><code>&lt;p&gt;Текст    с     несколькими    пробелами
и переносом строки&lt;/p&gt;</code></pre>
<p>В браузере это отобразится как: «Текст с несколькими пробелами и переносом строки» — все лишние пробелы и перенос схлопнутся в один пробел.</p>

<h2>Произвольный регистр</h2>
<p><code>&lt;br&gt;</code> даст такой же результат, что и <code>&lt;BR&gt;</code>, и <code>&lt;Br&gt;</code>, и <code>&lt;bR&gt;</code>. Несмотря на это, писать разметку лучше в нижнем регистре — это негласное правило.</p>

<h2>Перенос строки в теге</h2>
<p>При определении тега и его атрибутов можно переносить строку. Это полезно для длинных определений.</p>
<p>Например, для этого изображения:</p>
<pre><code>&lt;img
  src="http://example.com/cat.jpg"
  title="Мурка"
  alt="Рыжая кошка валяется в снегу"
  width="640"
  height="480"
&gt;</code></pre>"""

CONTENT_EN = """<p>When HTML code is turned into a web page, there are a few parsing quirks worth knowing.</p>

<h2>Line breaks only via tags</h2>
<p>You might wonder why we need a line-break tag if you can just press Enter. HTML treats a newline as a space. Code editors wrap long lines without changing how the page looks in the browser, so line breaks in source code are often only for readability—not for layout.</p>

<h2>Multiple spaces collapse into one</h2>
<p>This works the same way as with newlines. Indentation in nested markup uses spaces for readability in the editor, but the browser collapses consecutive whitespace.</p>
<p>Example:</p>
<pre><code>&lt;p&gt;Text    with     multiple    spaces
and a line break&lt;/p&gt;</code></pre>
<p>In the browser this renders as: “Text with multiple spaces and a line break” — extra spaces and the newline become a single space.</p>

<h2>Case does not matter</h2>
<p><code>&lt;br&gt;</code> works the same as <code>&lt;BR&gt;</code>, <code>&lt;Br&gt;</code>, and <code>&lt;bR&gt;</code>. Still, lowercase markup is the common convention.</p>

<h2>Line breaks inside a tag</h2>
<p>You may break lines when writing a tag and its attributes. That helps with long definitions.</p>
<p>For example, this image tag:</p>
<pre><code>&lt;img
  src="http://example.com/cat.jpg"
  title="Murka"
  alt="Ginger cat rolling in the snow"
  width="640"
  height="480"
&gt;</code></pre>"""


def seed(apps, schema_editor):
    Course = apps.get_model('app', 'Course')
    Module = apps.get_model('app', 'Module')
    Lesson = apps.get_model('app', 'Lesson')

    course = Course.objects.filter(title='HTML & CSS Fundamentals').first()
    if not course:
        return

    module = Module.objects.filter(course=course, order=2).first()
    if not module:
        return

    Lesson.objects.get_or_create(
        module=module,
        order=4,
        defaults={
            'title': 'Особенности интерпретации HTML',
            'title_en': 'HTML parsing quirks',
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
        Lesson.objects.filter(module=module, order=4, title='Особенности интерпретации HTML').delete()


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0032_html_css_lesson_23_attributes'),
    ]

    operations = [
        migrations.RunPython(seed, reverse_seed),
    ]
