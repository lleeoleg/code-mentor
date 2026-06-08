# HTML & CSS Fundamentals: модуль «HTML: База», урок 2.1 «HTML»

from django.db import migrations


CONTENT_RU = """<p>Теперь мы знаем, что такое <i>разметка</i>, давай узнаем, что такое HTML. Есть вещи, которые проще показать, чем объяснить. HTML — одна из них.</p>

<p>Всё гениальное просто. Вот как бы выглядел текст этого урока на HTML:</p>

<pre><code>&lt;h1&gt;HTML&lt;/h1&gt;
&lt;p&gt;Теперь мы знаем, что такое &lt;i&gt;разметка&lt;/i&gt;, давай узнаем, что такое HTML. Есть вещи, которые проще показать, чем объяснять. HTML - одна из них.&lt;/p&gt;

&lt;p&gt;Всё гениальное просто. Вот как бы выглядел текст этого урока на HTML:&lt;/p&gt;</code></pre>

<p><strong>h1</strong> — заголовок первого уровня (header 1)<br>
<strong>p</strong> — абзац (paragraph)</p>"""

CONTENT_EN = """<p>Now that we know what <i>markup</i> is, let's learn what HTML is. Some things are easier to show than to explain. HTML is one of them.</p>

<p>Everything brilliant is simple. Here is how the text of this lesson would look in HTML:</p>

<pre><code>&lt;h1&gt;HTML&lt;/h1&gt;
&lt;p&gt;Now we know what &lt;i&gt;markup&lt;/i&gt; is, let's learn what HTML is. Some things are easier to show than to explain. HTML is one of them.&lt;/p&gt;

&lt;p&gt;Everything brilliant is simple. Here is how the text of this lesson would look in HTML:&lt;/p&gt;</code></pre>

<p><strong>h1</strong> — level-one heading (header 1)<br>
<strong>p</strong> — paragraph</p>"""


def seed(apps, schema_editor):
    Course = apps.get_model('app', 'Course')
    Module = apps.get_model('app', 'Module')
    Lesson = apps.get_model('app', 'Lesson')

    course = Course.objects.filter(title='HTML & CSS Fundamentals').first()
    if not course:
        return

    module, _ = Module.objects.get_or_create(
        course=course,
        order=2,
        defaults={'title': 'HTML: База', 'title_en': 'HTML: Basics'},
    )

    Lesson.objects.get_or_create(
        module=module,
        order=1,
        defaults={
            'title': 'HTML',
            'title_en': 'HTML',
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

    module = Module.objects.filter(course=course, order=2, title='HTML: База').first()
    if module:
        Lesson.objects.filter(module=module, order=1, title='HTML').delete()
        if not Lesson.objects.filter(module=module).exists():
            Module.objects.filter(pk=module.pk).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0029_html_css_lesson_02_internet_history'),
    ]

    operations = [
        migrations.RunPython(seed, reverse_seed),
    ]
