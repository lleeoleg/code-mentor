# HTML & CSS Fundamentals: урок 2.3 «Атрибуты»

from django.db import migrations


CONTENT_RU = """<p>Атрибуты — это свойства тега. С помощью них мы задаём параметры тега.</p>

<p>Сразу возьмём пример: тег <code>&lt;a&gt;</code> — ссылка. Для задания адреса, куда будет вести эта ссылка, нам понадобится атрибут <code>href</code>. Вот так будет выглядеть ссылка на страницу ITC Вконтакте:</p>

<pre><code>&lt;a href="https://vk.com/itc.digital"&gt;ITC Вконтакте&lt;/a&gt;</code></pre>

<p>Атрибут указывается внутри тега, значение атрибута указывается внутри кавычек. Атрибуты отделяются друг от друга пробелами. Пример ссылки на страницу ITC, которая откроется в новой вкладке:</p>

<pre><code>&lt;a href="https://vk.com/itc.digital" target="_blank"&gt;ITC Вконтакте&lt;/a&gt;</code></pre>

<p>У атрибута может не быть значения, тогда наличие атрибута включает какой-то параметр, а отсутствие — отключает. Например, атрибут <code>disabled</code>. Если кнопке <code>&lt;button&gt;</code> задать атрибут <code>disabled</code>, она станет серой и на неё невозможно будет нажать.</p>

<pre><code>&lt;button disabled&gt;Нельзя нажимать&lt;/button&gt;</code></pre>

<p><strong>Результат:</strong></p>
<div class="course-learn-demo">
  <button type="button" disabled>Нельзя нажимать</button>
</div>"""

CONTENT_EN = """<p>Attributes are properties of a tag. We use them to set tag parameters.</p>

<p>Let's take an example: the <code>&lt;a&gt;</code> tag is a link. To set the address the link points to, we need the <code>href</code> attribute. Here is what a link to the ITC VK page would look like:</p>

<pre><code>&lt;a href="https://vk.com/itc.digital"&gt;ITC VK&lt;/a&gt;</code></pre>

<p>An attribute is written inside the tag, and its value goes in quotes. Attributes are separated by spaces. Here is a link that opens in a new tab:</p>

<pre><code>&lt;a href="https://vk.com/itc.digital" target="_blank"&gt;ITC VK&lt;/a&gt;</code></pre>

<p>An attribute may have no value — then its presence turns a feature on, and its absence turns it off. For example, the <code>disabled</code> attribute. If you add <code>disabled</code> to a <code>&lt;button&gt;</code>, it becomes gray and cannot be clicked.</p>

<pre><code>&lt;button disabled&gt;Cannot click&lt;/button&gt;</code></pre>

<p><strong>Result:</strong></p>
<div class="course-learn-demo">
  <button type="button" disabled>Cannot click</button>
</div>"""


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
        order=3,
        defaults={
            'title': 'Атрибуты',
            'title_en': 'Attributes',
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
        Lesson.objects.filter(module=module, order=3, title='Атрибуты').delete()


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0031_html_css_lesson_22_tags'),
    ]

    operations = [
        migrations.RunPython(seed, reverse_seed),
    ]
