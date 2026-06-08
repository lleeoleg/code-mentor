# HTML & CSS Fundamentals: урок 3.4 «Элементы и их виды»

from django.db import migrations


CONTENT_RU = """<p>Элементы — то, что создаётся тегами. Можно сказать, что теги — это текстовое представление элементов. Элементы бывают двух видов:</p>

<h2>Блочные элементы</h2>
<p>Составляют структуру страницы.</p>
<p><strong>Особенности:</strong></p>
<ul>
  <li>блоки располагаются друг под другом по вертикали</li>
  <li>запрещено вставлять блочный элемент внутрь строчного</li>
  <li>занимают всё допустимое пространство по ширине</li>
  <li>высота вычисляется автоматически, исходя из содержимого</li>
</ul>
<p><strong>Примеры:</strong></p>
<ul>
  <li>абзацы <code>&lt;p&gt;</code></li>
  <li>списки: маркированные (с маркером) <code>&lt;ul&gt;</code> и нумерованные (с числами) <code>&lt;ol&gt;</code></li>
  <li>заголовки: от первого уровня <code>&lt;h1&gt;</code> до шестого уровня <code>&lt;h6&gt;</code></li>
  <li>статьи <code>&lt;article&gt;</code></li>
  <li>разделы <code>&lt;section&gt;</code></li>
  <li>длинные цитаты <code>&lt;blockquote&gt;</code></li>
  <li>блоки общего назначения <code>&lt;div&gt;</code></li>
</ul>

<div class="course-learn-demo course-learn-demo--blocks">
  <div class="course-learn-block-item">Блочный элемент 1</div>
  <div class="course-learn-block-item">Блочный элемент 2</div>
  <div class="course-learn-block-item">Блочный элемент 3</div>
</div>

<h2>Строчные элементы</h2>
<p>Используются для форматирования текстовых фрагментов. Обычно содержат одно или несколько слов.</p>
<p><strong>Особенности:</strong></p>
<ul>
  <li>элементы, идущие подряд, располагаются на одной строке и переносятся на другую при необходимости</li>
  <li>внутрь допустимо вставлять текст или другие строчные элементы, помещать блочные элементы — запрещено</li>
</ul>
<p><strong>Примеры:</strong></p>
<ul>
  <li>ссылки <code>&lt;a&gt;</code></li>
  <li>выделенные слова <code>&lt;em&gt;</code></li>
  <li>важные слова <code>&lt;strong&gt;</code></li>
  <li>короткие цитаты <code>&lt;q&gt;</code></li>
  <li>аббревиатуры <code>&lt;abbr&gt;</code></li>
</ul>

<div class="course-learn-demo course-learn-demo--inline">
  <a href="#">ссылка</a>
  <em>выделение</em>
  <strong>важно</strong>
  <q>цитата</q>
  <abbr title="HyperText Markup Language">HTML</abbr>
</div>

<p>Если ты запомнишь только одну вещь из этого урока, запомни, что:</p>
<ul>
  <li><strong>блочные элементы</strong> занимают всё доступное пространство по ширине</li>
  <li><strong>строчные элементы</strong> ведут себя как текст — выстраиваются в ряд по горизонтали и переносятся на следующую строчку, если не хватает места</li>
</ul>"""

CONTENT_EN = """<p>Elements are what tags create. Tags are the text representation of elements. There are two kinds:</p>

<h2>Block elements</h2>
<p>They form the structure of the page.</p>
<p><strong>Traits:</strong></p>
<ul>
  <li>blocks stack vertically, one under another</li>
  <li>a block element must not be placed inside an inline element</li>
  <li>they take all available width</li>
  <li>height is calculated automatically from content</li>
</ul>
<p><strong>Examples:</strong></p>
<ul>
  <li>paragraphs <code>&lt;p&gt;</code></li>
  <li>lists: bulleted <code>&lt;ul&gt;</code> and numbered <code>&lt;ol&gt;</code></li>
  <li>headings from <code>&lt;h1&gt;</code> to <code>&lt;h6&gt;</code></li>
  <li>articles <code>&lt;article&gt;</code></li>
  <li>sections <code>&lt;section&gt;</code></li>
  <li>long quotes <code>&lt;blockquote&gt;</code></li>
  <li>generic blocks <code>&lt;div&gt;</code></li>
</ul>

<div class="course-learn-demo course-learn-demo--blocks">
  <div class="course-learn-block-item">Block element 1</div>
  <div class="course-learn-block-item">Block element 2</div>
  <div class="course-learn-block-item">Block element 3</div>
</div>

<h2>Inline elements</h2>
<p>Used to format fragments of text, usually one or a few words.</p>
<p><strong>Traits:</strong></p>
<ul>
  <li>elements in a row sit on the same line and wrap when needed</li>
  <li>they may contain text or other inline elements, but not block elements</li>
</ul>
<p><strong>Examples:</strong></p>
<ul>
  <li>links <code>&lt;a&gt;</code></li>
  <li>emphasis <code>&lt;em&gt;</code></li>
  <li>strong importance <code>&lt;strong&gt;</code></li>
  <li>short quotes <code>&lt;q&gt;</code></li>
  <li>abbreviations <code>&lt;abbr&gt;</code></li>
</ul>

<div class="course-learn-demo course-learn-demo--inline">
  <a href="#">link</a>
  <em>emphasis</em>
  <strong>important</strong>
  <q>quote</q>
  <abbr title="HyperText Markup Language">HTML</abbr>
</div>

<p>If you remember only one thing from this lesson:</p>
<ul>
  <li><strong>block elements</strong> take the full available width</li>
  <li><strong>inline elements</strong> behave like text — they line up horizontally and wrap to the next line when space runs out</li>
</ul>"""


def seed(apps, schema_editor):
    Course = apps.get_model('app', 'Course')
    Module = apps.get_model('app', 'Module')
    Lesson = apps.get_model('app', 'Lesson')

    course = Course.objects.filter(title='HTML & CSS Fundamentals').first()
    if not course:
        return

    module = Module.objects.filter(course=course, order=3).first()
    if not module:
        return

    Lesson.objects.get_or_create(
        module=module,
        order=4,
        defaults={
            'title': 'Элементы и их виды',
            'title_en': 'Elements and their types',
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
        Lesson.objects.filter(module=module, order=4, title='Элементы и их виды').delete()


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0036_html_css_lesson_33_code_editors'),
    ]

    operations = [
        migrations.RunPython(seed, reverse_seed),
    ]
