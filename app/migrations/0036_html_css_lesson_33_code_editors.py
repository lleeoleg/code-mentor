# HTML & CSS Fundamentals: урок 3.3 «Редакторы кода»

from django.db import migrations


CONTENT_RU = """<p>Разработчики пишут код в специальных редакторах. Они отличаются назначением. Остальные отличия почти всегда вытекают из него. Существует несколько редакторов кода, которые подходят для веб-разработки. Мы рассмотрим несколько из них и порекомендуем два (один из них только для слабых компьютеров). Редакторы кода — холиварная тема, поэтому этот урок содержит субъективное мнение. Если у тебя уже есть любимый редактор, то можешь пользоваться им, потому что любой разработчик свободен пользоваться тем, что ему нравится.</p>

<h2>Notepad++ — для ветеранов</h2>
<p>Боевая классика. Ветеран среди редакторов кода, в бородатые года считался самым популярным у веб-разработчиков. Сегодня его в основном используют ностальгирующие консерваторы.</p>
<img src="/images/course/html-css/notepad-plus-plus.png" alt="Редактор Notepad++" loading="lazy">

<h2>Sublime Text — рекомендуем для слабых компов</h2>
<p>Самый популярный редактор кода у разработчиков на Python. Для веб-разработки тоже подходит. Довольно быстро работает, неплохо выглядит и кастомизируется, имеет несколько полезных плагинов. В целом неплох, но для веб-разработчика есть более подходящий софт. Рекомендуем использовать его только если у тебя слабый компьютер.</p>
<img src="/images/course/html-css/sublime-text.png" alt="Редактор Sublime Text" loading="lazy">

<h2>Atom — для хипстеров</h2>
<p>Хороший редактор кода, заточенный под веб-разработку. Много тем оформления, плагинов. Работает на веб-технологиях, поэтому если ты планируешь развиваться дальше и изучать JavaScript, то в дальнейшем сможешь писать свои расширения. Его минус — скорость работы. Поэтому его использовать не рекомендуем. А ещё по состоянию на 2021 год он слабо развивается и почти никем не используется.</p>
<img src="/images/course/html-css/atom.png" alt="Редактор Atom" loading="lazy">

<h2>Visual Studio Code — наша рекомендация</h2>
<p>Не путай с Visual Studio. Редактор кода для веба от Microsoft. По сути, это более быстрый аналог Atom. Он имеет все те же самые плюсы, что и Atom, но работает ощутимо быстрее. Из минусов только майкрософтовский тоталитарный внешний вид, который легко изменить, установив другую тему оформления.</p>
<img src="/images/course/html-css/vscode.png" alt="Редактор Visual Studio Code" loading="lazy">

<h2>Отдельно про IDE</h2>
<p>Редактор кода — не магическая лазерная пушка. По сути, это просто чуть более продвинутый блокнот, который подсвечивает код (по крайней мере, без плагинов). Мы намеренно не рассказываем про IDE, потому что считаем, что для обучения они не годятся. Почему?</p>
<ul>
  <li><strong>Скорость работы.</strong> Они работают ощутимо медленнее. Скорость работы инструментов — критически важная вещь для продуктивности разработчика.</li>
  <li><strong>Страшный интерфейс и куча функций, которые никогда не будут использованы.</strong> Из-за тысячи возможностей ты знаешь в лучшем случае о 10% из них, тогда как в случае с редакторами ты сознательно ставишь каждый плагин и знаешь, что он делает.</li>
  <li><strong>Создают зону комфорта, из которой сложно выходить.</strong> Разработчики, которые приучаются к IDE, часто неспособны работать в ином окружении — на другом компьютере или удалённом сервере; IDE'шники обычно не очень разбираются в консольных командах и неспособны автоматизировать и оптимизировать рабочее окружение под себя.</li>
</ul>"""

CONTENT_EN = """<p>Developers write code in special editors. They differ in purpose, and most other differences follow from that. Several code editors work well for web development. We'll look at a few and recommend two (one only for weaker computers). Editor choice is a hot topic, so this lesson is subjective. If you already have a favorite editor, keep using it — every developer is free to choose what they like.</p>

<h2>Notepad++ — for veterans</h2>
<p>A classic. A veteran among code editors, once the most popular choice for web developers. Today it's mostly used by nostalgic conservatives.</p>
<img src="/images/course/html-css/notepad-plus-plus.png" alt="Notepad++ editor" loading="lazy">

<h2>Sublime Text — for weaker PCs</h2>
<p>Very popular among Python developers. Works for web development too: fast enough, customizable, with useful plugins. Solid overall, but there are better options for web work. We recommend it mainly if your computer is slow.</p>
<img src="/images/course/html-css/sublime-text.png" alt="Sublime Text editor" loading="lazy">

<h2>Atom — for hipsters</h2>
<p>A good web-focused editor with many themes and plugins. Built on web technologies, so if you plan to learn JavaScript later, you could write your own extensions. The downside is speed — we don't recommend it. As of 2021 it was barely maintained and rarely used.</p>
<img src="/images/course/html-css/atom.png" alt="Atom editor" loading="lazy">

<h2>Visual Studio Code — our recommendation</h2>
<p>Don't confuse it with Visual Studio. Microsoft's editor for the web — essentially a faster Atom. Same advantages, but noticeably faster. The main downside is Microsoft's default look, which you can change with another theme.</p>
<img src="/images/course/html-css/vscode.png" alt="Visual Studio Code editor" loading="lazy">

<h2>About IDEs separately</h2>
<p>A code editor isn't a magic laser cannon. It's basically a slightly smarter notepad with syntax highlighting (at least without plugins). We intentionally skip IDEs because we don't think they're good for learning. Why?</p>
<ul>
  <li><strong>Performance.</strong> IDEs are noticeably slower. Tool speed is critical for developer productivity.</li>
  <li><strong>Overwhelming UI.</strong> With thousands of features you might know 10% at best; with editors you install each plugin deliberately and know what it does.</li>
  <li><strong>Comfort zone.</strong> Developers used to IDEs often struggle in other environments — another machine, a remote server; they may know fewer shell commands and can't tune their workflow as flexibly.</li>
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
        order=3,
        defaults={
            'title': 'Редакторы кода',
            'title_en': 'Code editors',
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
        Lesson.objects.filter(module=module, order=3, title='Редакторы кода').delete()


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0035_html_css_lesson_32_practice_page'),
    ]

    operations = [
        migrations.RunPython(seed, reverse_seed),
    ]
