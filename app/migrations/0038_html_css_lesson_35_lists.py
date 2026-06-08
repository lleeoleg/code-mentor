# HTML & CSS Fundamentals: урок 3.5 «Списки»

from django.db import migrations


CONTENT_RU = """<p>В HTML существует три вида списков:</p>

<h2>Маркированный</h2>
<p>Список из неупорядоченных элементов.</p>
<p>Состоит из двух тегов:</p>
<ul>
  <li><code>&lt;ul&gt;</code> (unordered list) — тег начала и конца списка</li>
  <li><code>&lt;li&gt;</code> (list item) — пункт списка</li>
</ul>
<p>Пример:</p>
<p>Список ингредиентов:</p>
<pre><code>&lt;ul&gt;
  &lt;li&gt;Картошка&lt;/li&gt;
  &lt;li&gt;Морковка&lt;/li&gt;
  &lt;li&gt;Свекла&lt;/li&gt;
&lt;/ul&gt;</code></pre>
<div class="course-learn-demo">
  <p><strong>Список ингредиентов:</strong></p>
  <ul>
    <li>Картошка</li>
    <li>Морковка</li>
    <li>Свекла</li>
  </ul>
</div>

<h2>Нумерованный</h2>
<p>Упорядоченный список, каждый пункт имеет свой номер.</p>
<p>Состоит из двух тегов:</p>
<ul>
  <li><code>&lt;ol&gt;</code> (ordered list) — тег начала и конца списка</li>
  <li><code>&lt;li&gt;</code> (list item) — пункт списка</li>
</ul>
<p>Пример:</p>
<p>Инструкция по приготовлению:</p>
<pre><code>&lt;ol&gt;
  &lt;li&gt;Довести воду до кипения&lt;/li&gt;
  &lt;li&gt;Засыпать ингредиенты&lt;/li&gt;
  &lt;li&gt;Варить 10 минут&lt;/li&gt;
&lt;/ol&gt;</code></pre>
<div class="course-learn-demo">
  <p><strong>Инструкция по приготовлению:</strong></p>
  <ol>
    <li>Довести воду до кипения</li>
    <li>Засыпать ингредиенты</li>
    <li>Варить 10 минут</li>
  </ol>
</div>

<h2>Список определений</h2>
<p>Используются для создания списка терминов и их определений. В общем случае, каждый пункт — это пара «имя/значение».</p>
<p>Состоит из трёх тегов:</p>
<ul>
  <li><code>&lt;dl&gt;</code> (description list) — тег начала и конца списка</li>
  <li><code>&lt;dt&gt;</code> (term) — термин</li>
  <li><code>&lt;dd&gt;</code> (description) — определение</li>
</ul>
<p>Пример:</p>
<pre><code>&lt;dl&gt;
  &lt;dt&gt;Гаспачо&lt;/dt&gt;&lt;dd&gt;лёгкий холодный суп из перетёртых в пюре свежих овощей&lt;/dd&gt;
  &lt;dt&gt;Том-ям&lt;/dt&gt;&lt;dd&gt;кисло-острый суп на основе куриного бульона с креветками, курицей, рыбой или другими морепродуктами&lt;/dd&gt;
  &lt;dt&gt;Борщ&lt;/dt&gt;&lt;dd&gt;разновидность супа на основе свёклы, которая придаёт борщу характерный красный цвет&lt;/dd&gt;
&lt;/dl&gt;</code></pre>
<div class="course-learn-demo">
  <dl class="course-learn-dl">
    <dt>Гаспачо</dt>
    <dd>лёгкий холодный суп из перетёртых в пюре свежих овощей</dd>
    <dt>Том-ям</dt>
    <dd>кисло-острый суп на основе куриного бульона с креветками, курицей, рыбой или другими морепродуктами</dd>
    <dt>Борщ</dt>
    <dd>разновидность супа на основе свёклы, которая придаёт борщу характерный красный цвет</dd>
  </dl>
</div>"""

CONTENT_EN = """<p>HTML has three kinds of lists:</p>

<h2>Bulleted (unordered)</h2>
<p>A list of items in no particular order.</p>
<p>Two tags:</p>
<ul>
  <li><code>&lt;ul&gt;</code> (unordered list) — wraps the list</li>
  <li><code>&lt;li&gt;</code> (list item) — each item</li>
</ul>
<p>Example — ingredients:</p>
<pre><code>&lt;ul&gt;
  &lt;li&gt;Potatoes&lt;/li&gt;
  &lt;li&gt;Carrots&lt;/li&gt;
  &lt;li&gt;Beets&lt;/li&gt;
&lt;/ul&gt;</code></pre>
<div class="course-learn-demo">
  <p><strong>Ingredients:</strong></p>
  <ul>
    <li>Potatoes</li>
    <li>Carrots</li>
    <li>Beets</li>
  </ul>
</div>

<h2>Numbered (ordered)</h2>
<p>An ordered list where each item has a number.</p>
<p>Two tags:</p>
<ul>
  <li><code>&lt;ol&gt;</code> (ordered list) — wraps the list</li>
  <li><code>&lt;li&gt;</code> (list item) — each item</li>
</ul>
<p>Example — cooking steps:</p>
<pre><code>&lt;ol&gt;
  &lt;li&gt;Bring water to a boil&lt;/li&gt;
  &lt;li&gt;Add ingredients&lt;/li&gt;
  &lt;li&gt;Simmer for 10 minutes&lt;/li&gt;
&lt;/ol&gt;</code></pre>
<div class="course-learn-demo">
  <p><strong>Cooking instructions:</strong></p>
  <ol>
    <li>Bring water to a boil</li>
    <li>Add ingredients</li>
    <li>Simmer for 10 minutes</li>
  </ol>
</div>

<h2>Definition list</h2>
<p>Used for terms and their definitions — each entry is a name/value pair.</p>
<p>Three tags:</p>
<ul>
  <li><code>&lt;dl&gt;</code> (description list) — wraps the list</li>
  <li><code>&lt;dt&gt;</code> (term)</li>
  <li><code>&lt;dd&gt;</code> (description)</li>
</ul>
<p>Example:</p>
<pre><code>&lt;dl&gt;
  &lt;dt&gt;Gazpacho&lt;/dt&gt;&lt;dd&gt;cold vegetable soup&lt;/dd&gt;
  &lt;dt&gt;Tom yum&lt;/dt&gt;&lt;dd&gt;spicy and sour Thai soup&lt;/dd&gt;
  &lt;dt&gt;Borscht&lt;/dt&gt;&lt;dd&gt;beet-based soup common in Eastern Europe&lt;/dd&gt;
&lt;/dl&gt;</code></pre>
<div class="course-learn-demo">
  <dl class="course-learn-dl">
    <dt>Gazpacho</dt>
    <dd>cold vegetable soup</dd>
    <dt>Tom yum</dt>
    <dd>spicy and sour Thai soup</dd>
    <dt>Borscht</dt>
    <dd>beet-based soup common in Eastern Europe</dd>
  </dl>
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
        return

    Lesson.objects.get_or_create(
        module=module,
        order=5,
        defaults={
            'title': 'Списки',
            'title_en': 'Lists',
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
        Lesson.objects.filter(module=module, order=5, title='Списки').delete()


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0037_html_css_lesson_34_element_types'),
    ]

    operations = [
        migrations.RunPython(seed, reverse_seed),
    ]
