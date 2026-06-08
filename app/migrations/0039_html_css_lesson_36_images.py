# HTML & CSS Fundamentals: урок 3.6 «Изображения»

from django.db import migrations


CONTENT_RU = """<p>Для добавления изображения используется тег <code>&lt;img&gt;</code>. Это одинарный тег. Вот его основные атрибуты:</p>
<ul>
  <li><code>src</code> — ссылка на картинку</li>
  <li><code>alt</code> — текст, который отображается вместо картинки, если она не загрузилась</li>
  <li><code>title</code> — текст, который отображается при наведении мыши на картинку</li>
  <li><code>width</code> — ширина картинки в пикселях</li>
  <li><code>height</code> — высота картинки в пикселях</li>
</ul>
<p>Пример:</p>
<pre><code>&lt;img
  src="http://example.com/cat.jpg"
  title="Мурка"
  alt="Рыжая кошка валяется в снегу"
  width="640"
  height="480"
&gt;</code></pre>

<h2>Семантичные изображения с подписью в HTML 5</h2>
<p>В HTML 5 появились теги для оформления объектов с подписями — <code>&lt;figure&gt;</code> и <code>&lt;figcaption&gt;</code>. Если твоей картинке нужна подпись — пользуйся ими. Пример кода:</p>
<pre><code>&lt;figure&gt;
  &lt;img src="https://www.google.ru/images/branding/googlelogo/2x/googlelogo_color_120x44dp.png"&gt;
  &lt;figcaption&gt;
    Лого гугла от 2015 года
  &lt;/figcaption&gt;
&lt;/figure&gt;</code></pre>
<p><strong>Результат:</strong></p>
<figure class="course-learn-figure">
  <img src="/images/course/html-css/google-logo-2015.png" alt="Логотип Google" width="272" height="92" loading="lazy">
  <figcaption>Лого гугла от 2015 года</figcaption>
</figure>"""

CONTENT_EN = """<p>Images are added with the <code>&lt;img&gt;</code> tag — a void element. Main attributes:</p>
<ul>
  <li><code>src</code> — image URL</li>
  <li><code>alt</code> — text shown if the image fails to load</li>
  <li><code>title</code> — tooltip on hover</li>
  <li><code>width</code> — width in pixels</li>
  <li><code>height</code> — height in pixels</li>
</ul>
<p>Example:</p>
<pre><code>&lt;img
  src="http://example.com/cat.jpg"
  title="Murka"
  alt="Ginger cat rolling in the snow"
  width="640"
  height="480"
&gt;</code></pre>

<h2>Semantic images with captions in HTML5</h2>
<p>HTML5 introduced <code>&lt;figure&gt;</code> and <code>&lt;figcaption&gt;</code> for content with captions. Example:</p>
<pre><code>&lt;figure&gt;
  &lt;img src="https://www.google.ru/images/branding/googlelogo/2x/googlelogo_color_120x44dp.png"&gt;
  &lt;figcaption&gt;
    Google logo from 2015
  &lt;/figcaption&gt;
&lt;/figure&gt;</code></pre>
<p><strong>Result:</strong></p>
<figure class="course-learn-figure">
  <img src="/images/course/html-css/google-logo-2015.png" alt="Google logo" width="272" height="92" loading="lazy">
  <figcaption>Google logo from 2015</figcaption>
</figure>"""


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
        order=6,
        defaults={
            'title': 'Изображения',
            'title_en': 'Images',
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
        Lesson.objects.filter(module=module, order=6, title='Изображения').delete()


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0038_html_css_lesson_35_lists'),
    ]

    operations = [
        migrations.RunPython(seed, reverse_seed),
    ]
