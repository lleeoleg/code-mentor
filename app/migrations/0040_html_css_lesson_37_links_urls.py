# HTML & CSS Fundamentals: урок 3.7 «Адреса, ссылки и якоря»

from django.db import migrations


CONTENT_RU = """<h2>Ссылки и адреса</h2>
<p>Ты уже знаком со ссылками:</p>
<pre><code>&lt;a href="https://google.com/"&gt;Google&lt;/a&gt;</code></pre>
<p>Пример:</p>
<div class="course-learn-demo course-learn-demo--inline">
  <a href="https://google.com/" target="_blank" rel="noopener noreferrer">Google</a>
</div>
<p>Повторим: для создания ссылки необходимо использовать тег <code>&lt;a&gt;</code>. Атрибут <code>href</code> указывает адрес, по которому будет совершён переход.</p>
<p>Адреса бывают двух видов:</p>

<h2>Абсолютные адреса</h2>
<p>Абсолютный адрес записан в полной форме. Например:</p>
<pre><code>https://google.com/doodles</code></pre>
<p>Давай разберём этот адрес:</p>
<ul>
  <li><code>https</code> — так называемая «схема», обычно это название протокола. HTTPS — защищённая версия HTTP</li>
  <li><code>google.com</code> — доменное имя сайта</li>
  <li><code>/doodles</code> — путь (директория) внутри сайта</li>
</ul>
<p>Ещё пример:</p>
<pre><code>file:///C:/Users/admin/Desktop/Новая%20папка/image.jpg</code></pre>
<ul>
  <li><code>file</code> — схема URI, предназначенная для того, чтобы адресовать файлы на локальном компьютере или в локальной сети</li>
  <li><code>/C:/Users/admin/Desktop/Новая%20папка/image.jpg</code> — путь до файла. <code>%20</code> — код пробела в URI-кодировании</li>
</ul>

<h2>Относительные адреса</h2>
<p>Относительный — сокращённый адрес. В таком адресе начальная часть опущена, и браузер использует текущий адрес для определения полного адреса. Примеры:</p>
<ul>
  <li><code>//google.com</code> — ссылка на домен в текущем протоколе: если мы находимся по адресу, который начинается с <code>http</code>, то ссылка будет вести на <code>http://google.com</code></li>
  <li><code>/sheets</code> — ссылка на путь внутри текущего домена: если мы на <code>http://google.com</code>, то ссылка ведёт на <code>http://google.com/sheets</code>, а если на <code>http://facebook.com</code>, то на <code>http://facebook.com/sheets</code></li>
  <li><code>page2</code> — ссылка на путь внутри текущей директории: если мы на <code>http://site.com/routes/page1</code>, то попадём на <code>http://site.com/routes/page2</code></li>
</ul>

<h2>Пример использования относительного адреса</h2>
<p>Файловая система:</p>
<pre><code>Новая папка
├── img
│   ├── kisa.jpg
│   └── kot.png
├── index.html
└── style.css</code></pre>
<p>Код в <code>index.html</code>:</p>
<pre><code>...
&lt;link rel="stylesheet" href="style.css"&gt;
...
&lt;img src="img/kisa.jpg"&gt;
&lt;img src="img/kot.png"&gt;</code></pre>
<p>При выполнении заданий с использованием файлов — картинок, шрифтов, веб-страниц, которые находятся локально (то есть у тебя на устройстве), используй относительные ссылки. Потому что при загрузке кода на сервер ссылки вроде <code>file:///C:/Users/admin/Desktop/Новая%20папка/image.jpg</code> перестанут работать.</p>"""

CONTENT_EN = """<h2>Links and URLs</h2>
<p>You already know links:</p>
<pre><code>&lt;a href="https://google.com/"&gt;Google&lt;/a&gt;</code></pre>
<p>Example:</p>
<div class="course-learn-demo course-learn-demo--inline">
  <a href="https://google.com/" target="_blank" rel="noopener noreferrer">Google</a>
</div>
<p>To create a link, use the <code>&lt;a&gt;</code> tag. The <code>href</code> attribute is the destination URL.</p>
<p>URLs come in two kinds:</p>

<h2>Absolute URLs</h2>
<p>A full address, for example:</p>
<pre><code>https://google.com/doodles</code></pre>
<ul>
  <li><code>https</code> — the scheme (protocol). HTTPS is the secure version of HTTP</li>
  <li><code>google.com</code> — the site domain</li>
  <li><code>/doodles</code> — path on the site</li>
</ul>
<p>Another example:</p>
<pre><code>file:///C:/Users/admin/Desktop/New%20folder/image.jpg</code></pre>
<ul>
  <li><code>file</code> — URI scheme for files on the local machine or LAN</li>
  <li><code>%20</code> — encoded space in the path</li>
</ul>

<h2>Relative URLs</h2>
<p>A shortened address — the browser resolves it against the current page URL. Examples:</p>
<ul>
  <li><code>//google.com</code> — same protocol as the current page</li>
  <li><code>/sheets</code> — path on the current domain</li>
  <li><code>page2</code> — sibling path in the current directory</li>
</ul>

<h2>Relative paths in a project</h2>
<pre><code>project-folder
├── img
│   ├── kisa.jpg
│   └── kot.png
├── index.html
└── style.css</code></pre>
<p>In <code>index.html</code>:</p>
<pre><code>...
&lt;link rel="stylesheet" href="style.css"&gt;
...
&lt;img src="img/kisa.jpg"&gt;
&lt;img src="img/kot.png"&gt;</code></pre>
<p>For local assets (images, fonts, pages on your device), use relative links. After uploading to a server, addresses like <code>file:///...</code> will stop working.</p>"""


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
        order=7,
        defaults={
            'title': 'Адреса, ссылки и якоря',
            'title_en': 'URLs, links, and anchors',
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
        Lesson.objects.filter(module=module, order=7, title='Адреса, ссылки и якоря').delete()


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0039_html_css_lesson_36_images'),
    ]

    operations = [
        migrations.RunPython(seed, reverse_seed),
    ]
