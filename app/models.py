from django.db import models


class Level(models.TextChoices):
    """Уровень сложности курса."""
    BEGINNER = 'beginner', 'Начальный'
    INTERMEDIATE = 'intermediate', 'Средний'
    ADVANCED = 'advanced', 'Продвинутый'
    ALL = 'all', 'Любой'


class Course(models.Model):
    """Курс для обучения."""
    title = models.CharField('Название', max_length=255)
    description = models.TextField('Описание', blank=True)
    level = models.CharField(
        'Уровень',
        max_length=20,
        choices=Level.choices,
        default=Level.ALL,
    )
    # Если цена задана и > 0 — курс платный (с сертификатом). Если null или 0 — бесплатный.
    price = models.DecimalField(
        'Цена',
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text='Пусто или 0 — бесплатный курс. Иначе — платный, с сертификатом.',
    )
    created_at = models.DateTimeField('Создан', auto_now_add=True)
    updated_at = models.DateTimeField('Обновлён', auto_now=True)

    class Meta:
        verbose_name = 'Курс'
        verbose_name_plural = 'Курсы'
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class Module(models.Model):
    """Модуль курса (например, «Введение»)."""
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='modules')
    title = models.CharField('Название', max_length=255)
    order = models.PositiveIntegerField('Порядок', default=0)

    class Meta:
        verbose_name = 'Модуль'
        verbose_name_plural = 'Модули'
        ordering = ['course', 'order']

    def __str__(self):
        return f'{self.order}. {self.title}'


class Lesson(models.Model):
    """Урок в модуле."""
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField('Название', max_length=255)
    order = models.PositiveIntegerField('Порядок', default=0)
    content_type = models.CharField(
        'Тип контента',
        max_length=20,
        choices=[('video', 'Видео'), ('text', 'Текст')],
        default='text',
    )
    content = models.TextField('Контент (URL видео или текст)', blank=True)
    is_free = models.BooleanField('Доступен в бесплатной версии', default=False)

    class Meta:
        verbose_name = 'Урок'
        verbose_name_plural = 'Уроки'
        ordering = ['module', 'order']

    def __str__(self):
        return f'{self.module.order}.{self.order} {self.title}'


class Enrollment(models.Model):
    """Запись пользователя на курс (попробовать бесплатно или покупка)."""
    class Source(models.TextChoices):
        FREE_TRIAL = 'free_trial', 'Попробовать бесплатно'
        PURCHASE = 'purchase', 'Покупка'

    user = models.ForeignKey(
        'auth.User',
        on_delete=models.CASCADE,
        related_name='enrollments',
    )
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    enrolled_at = models.DateTimeField('Дата записи', auto_now_add=True)
    source = models.CharField(
        'Источник',
        max_length=20,
        choices=Source.choices,
        default=Source.FREE_TRIAL,
    )

    class Meta:
        verbose_name = 'Запись на курс'
        verbose_name_plural = 'Записи на курсы'
        unique_together = [['user', 'course']]
        ordering = ['-enrolled_at']

    def __str__(self):
        return f'{self.user.username} — {self.course.title}'


class Comment(models.Model):
    """Комментарий к уроку."""
    user = models.ForeignKey(
        'auth.User',
        on_delete=models.CASCADE,
        related_name='lesson_comments',
    )
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='comments')
    text = models.TextField('Текст комментария')
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)

    class Meta:
        verbose_name = 'Комментарий'
        verbose_name_plural = 'Комментарии'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.username} — {self.lesson.title[:30]}'


class NewsItem(models.Model):
    """Запись в блоке «Что нового» / новости сайта."""
    published_at = models.DateTimeField('Дата и время публикации')
    content = models.TextField('Текст (поддерживается HTML для ссылок)')
    created_at = models.DateTimeField('Создано', auto_now_add=True)

    class Meta:
        verbose_name = 'Новость'
        verbose_name_plural = 'Новости'
        ordering = ['-published_at']

    def __str__(self):
        return self.content[:50] + '…' if len(self.content) > 50 else self.content
