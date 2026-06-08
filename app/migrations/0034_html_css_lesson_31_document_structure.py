# HTML & CSS Fundamentals: модуль «HTML: Основные элементы», урок 3.1

from django.db import migrations


CONTENT_RU = """<p>Структура HTML-документа — скелет, на основе которого строится вся страница:</p>

<pre><code>&lt;!DOCTYPE html&gt;
&lt;html&gt;
  &lt;head&gt;
    &lt;meta charset="utf-8"&gt;
    &lt;title&gt;Страница&lt;/title&gt;
  &lt;/head&gt;
  &lt;body&gt;
    &lt;h1&gt;...&lt;/h1&gt;
    &lt;p&gt;...&lt;/p&gt;
  &lt;/body&gt;
&lt;/html&gt;</code></pre>

<h2>&lt;!DOCTYPE&gt;</h2>
<p>Первым тегом в любом HTML-документе должен идти тег <code>&lt;!DOCTYPE&gt;</code>. Он говорит браузеру, по какому стандарту написана страница. На рассвете веба HTML существовал в разных несовместимых версиях, поэтому для их одновременной поддержки нужно было указывать версию явно. Сейчас все пришли к одному стандарту — HTML5. Поэтому для всех сайтов, которые создаются сегодня, нужно указывать <code>&lt;!DOCTYPE html&gt;</code> — так обозначается HTML5.</p>

<h2>&lt;html&gt;</h2>
<p>Вторым тегом идёт <code>&lt;html&gt;</code> — контейнер, который содержит два тега: <code>&lt;head&gt;</code> и <code>&lt;body&gt;</code>. HTML-страница должна заканчиваться закрытым тегом <code>&lt;/html&gt;</code>.</p>

<h2>&lt;head&gt;</h2>
<p>В теге <code>&lt;head&gt;</code> хранится информация о странице. Здесь указывают кодировку <code>&lt;meta charset="..."&gt;</code>, имя страницы <code>&lt;title&gt;...&lt;/title&gt;</code>, специальную информацию для поисковиков, а ещё тут подключаются стилевые файлы и скрипты.</p>
<p>Тег <code>&lt;head&gt;</code> не отображается. Его цель — сказать браузеру информацию о странице.</p>

<h2>&lt;body&gt;</h2>
<p>В теге <code>&lt;body&gt;</code> размещается весь контент страницы, который пользователь увидит в браузере.</p>"""

CONTENT_EN = """<p>The structure of an HTML document is the skeleton on which the entire page is built:</p>

<pre><code>&lt;!DOCTYPE html&gt;
&lt;html&gt;
  &lt;head&gt;
    &lt;meta charset="utf-8"&gt;
    &lt;title&gt;Page&lt;/title&gt;
  &lt;/head&gt;
  &lt;body&gt;
    &lt;h1&gt;...&lt;/h1&gt;
    &lt;p&gt;...&lt;/p&gt;
  &lt;/body&gt;
&lt;/html&gt;</code></pre>

<h2>&lt;!DOCTYPE&gt;</h2>
<p>The first line in any HTML document must be <code>&lt;!DOCTYPE&gt;</code>. It tells the browser which standard the page follows. Early on, HTML existed in several incompatible versions, so the version had to be declared explicitly. Today everyone uses HTML5, so modern sites start with <code>&lt;!DOCTYPE html&gt;</code>.</p>

<h2>&lt;html&gt;</h2>
<p>Next comes <code>&lt;html&gt;</code> — a container for <code>&lt;head&gt;</code> and <code>&lt;body&gt;</code>. The page must end with a closing <code>&lt;/html&gt;</code> tag.</p>

<h2>&lt;head&gt;</h2>
<p>The <code>&lt;head&gt;</code> tag holds page metadata: charset <code>&lt;meta charset="..."&gt;</code>, title <code>&lt;title&gt;...&lt;/title&gt;</code>, SEO tags, linked stylesheets, and scripts.</p>
<p><code>&lt;head&gt;</code> is not shown on the page — it only describes the document to the browser.</p>

<h2>&lt;body&gt;</h2>
<p>Everything the user sees in the browser goes inside <code>&lt;body&gt;</code>.</p>"""


def seed(apps, schema_editor):
    Course = apps.get_model('app', 'Course')
    Module = apps.get_model('app', 'Module')
    Lesson = apps.get_model('app', 'Lesson')

    course = Course.objects.filter(title='HTML & CSS Fundamentals').first()
    if not course:
        return

    module, _ = Module.objects.get_or_create(
        course=course,
        order=3,
        defaults={'title': 'HTML: Основные элементы', 'title_en': 'HTML: Core elements'},
    )

    Lesson.objects.get_or_create(
        module=module,
        order=1,
        defaults={
            'title': 'Структура HTML-документа',
            'title_en': 'HTML document structure',
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
        Lesson.objects.filter(module=module, order=1, title='Структура HTML-документа').delete()
        if not Lesson.objects.filter(module=module).exists():
            Module.objects.filter(pk=module.pk).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0033_html_css_lesson_24_html_parsing'),
    ]

    operations = [
        migrations.RunPython(seed, reverse_seed),
    ]
