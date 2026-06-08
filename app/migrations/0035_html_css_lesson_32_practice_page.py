# HTML & CSS Fundamentals: урок 3.2 «Практика: создание веб-страницы»

from django.db import migrations


CONTENT_RU = """<p>Пора закрепить пройденный материал.</p>

<p><strong>Важно!</strong> Если у тебя Windows, тебе нужно включить показ расширений файлов.</p>

<p>Создай файл и назови его <code>index.html</code>.</p>

<p>Открой его с помощью блокнота и вставь туда структуру HTML-страницы из предыдущего урока:</p>

<pre><code>&lt;!DOCTYPE html&gt;

&lt;html&gt;
  &lt;head&gt;
    &lt;meta charset="utf-8"&gt;
  &lt;/head&gt;

  &lt;body&gt;
    &lt;h1&gt;Заголовок&lt;/h1&gt;
    &lt;p&gt;Абзац&lt;/p&gt;
  &lt;/body&gt;
&lt;/html&gt;</code></pre>

<p>Сохрани файл. При сохранении укажи кодировку UTF-8. Открой файл в браузере. Ты увидишь вот это:</p>

<div class="course-learn-demo course-learn-demo--browser">
  <h1>Заголовок</h1>
  <p>Абзац</p>
</div>"""

CONTENT_EN = """<p>Time to practice what you've learned.</p>

<p><strong>Important!</strong> If you use Windows, enable showing file extensions.</p>

<p>Create a file named <code>index.html</code>.</p>

<p>Open it in Notepad and paste the HTML structure from the previous lesson:</p>

<pre><code>&lt;!DOCTYPE html&gt;

&lt;html&gt;
  &lt;head&gt;
    &lt;meta charset="utf-8"&gt;
  &lt;/head&gt;

  &lt;body&gt;
    &lt;h1&gt;Heading&lt;/h1&gt;
    &lt;p&gt;Paragraph&lt;/p&gt;
  &lt;/body&gt;
&lt;/html&gt;</code></pre>

<p>Save the file with UTF-8 encoding. Open it in a browser. You should see this:</p>

<div class="course-learn-demo course-learn-demo--browser">
  <h1>Heading</h1>
  <p>Paragraph</p>
</div>"""


def seed(apps, schema_editor):
    Course = apps.get_model('app', 'Course')
    Module = apps.get_model('app', 'Module')
    Lesson = apps.get_model('app', 'Lesson')

    course = Course.objects.filter(title='HTML & CSS Fundamentals').first()
    if not course:
        return

    module = Module.objects.filter(course=course, order=3).first()
    if not module:
        module = Module.objects.create(
            course=course, order=3, title='HTML: Основные элементы', title_en='HTML: Core elements',
        )

    Lesson.objects.get_or_create(
        module=module,
        order=2,
        defaults={
            'title': 'Практика: создание веб-страницы',
            'title_en': 'Practice: creating a web page',
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

    module = Module.objects.filter(course=course, order=3).first()
    if module:
        Lesson.objects.filter(module=module, order=2, title='Практика: создание веб-страницы').delete()


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0034_html_css_lesson_31_document_structure'),
    ]

    operations = [
        migrations.RunPython(seed, reverse_seed),
    ]
