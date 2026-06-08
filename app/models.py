from django.db import models
from django.utils import timezone


class Level(models.TextChoices):
    """Уровень сложности курса."""
    BEGINNER = 'beginner', 'Начальный'
    INTERMEDIATE = 'intermediate', 'Средний'
    ADVANCED = 'advanced', 'Продвинутый'
    ALL = 'all', 'Любой'


class Course(models.Model):
    """Курс для обучения."""
    title = models.CharField('Название', max_length=255)
    title_en = models.CharField('Title (EN)', max_length=255, blank=True, default='')
    description = models.TextField('Описание', blank=True)
    description_en = models.TextField('Description (EN)', blank=True, default='')
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
    title_en = models.CharField('Title (EN)', max_length=255, blank=True, default='')
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
    title_en = models.CharField('Title (EN)', max_length=255, blank=True, default='')
    order = models.PositiveIntegerField('Порядок', default=0)
    content_type = models.CharField(
        'Тип контента',
        max_length=20,
        choices=[('video', 'Видео'), ('text', 'Текст'), ('code', 'Код (Python)')],
        default='text',
    )
    content = models.TextField('Контент (URL видео или текст)', blank=True)
    content_en = models.TextField('Content (EN)', blank=True, default='')
    video_summary = models.TextField(
        'Краткое содержание видео (под плеером)',
        blank=True,
        default='',
        help_text='Для уроков с типом «Видео»: пересказ темы под роликом.',
    )
    video_summary_en = models.TextField('Video summary (EN)', blank=True, default='')
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


class CourseFavorite(models.Model):
    """Избранный курс пользователя (синхронизация между устройствами)."""
    user = models.ForeignKey(
        'auth.User',
        on_delete=models.CASCADE,
        related_name='course_favorites',
    )
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField('Добавлено', auto_now_add=True)

    class Meta:
        verbose_name = 'Избранный курс'
        verbose_name_plural = 'Избранные курсы'
        constraints = [
            models.UniqueConstraint(fields=['user', 'course'], name='unique_user_course_favorite'),
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.username} ♥ {self.course.title}'


class LessonCompletion(models.Model):
    """Отметка: урок пройден (прогресс, синхронизация между устройствами)."""
    user = models.ForeignKey(
        'auth.User',
        on_delete=models.CASCADE,
        related_name='lesson_completions',
    )
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='completions')
    completed_at = models.DateTimeField('Завершён', auto_now_add=True)

    class Meta:
        verbose_name = 'Пройденный урок'
        verbose_name_plural = 'Пройденные уроки'
        constraints = [
            models.UniqueConstraint(fields=['user', 'lesson'], name='unique_user_lesson_completion'),
        ]
        ordering = ['-completed_at']

    def __str__(self):
        return f'{self.user.username} — {self.lesson}'


class CourseExam(models.Model):
    """Финальный тест по курсу."""
    course = models.OneToOneField(Course, on_delete=models.CASCADE, related_name='final_exam')
    is_active = models.BooleanField('Активен', default=True)
    pass_percent = models.PositiveIntegerField('Порог прохождения (%)', default=80)
    max_attempts = models.PositiveIntegerField('Макс. попыток (за 24ч)', default=3)
    questions_count = models.PositiveIntegerField('Количество вопросов', default=10)
    created_at = models.DateTimeField('Создан', auto_now_add=True)
    updated_at = models.DateTimeField('Обновлён', auto_now=True)

    class Meta:
        verbose_name = 'Финальный тест'
        verbose_name_plural = 'Финальные тесты'

    def __str__(self):
        return f'Exam: {self.course.title}'


class ExamQuestion(models.Model):
    exam = models.ForeignKey(CourseExam, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField('Вопрос (ru)')
    text_en = models.TextField('Question (en)', blank=True, default='')
    order = models.PositiveIntegerField('Порядок', default=0)

    class Meta:
        verbose_name = 'Вопрос теста'
        verbose_name_plural = 'Вопросы теста'
        ordering = ['exam', 'order', 'id']

    def __str__(self):
        return f'Q{self.order}: {self.text[:40]}'


class ExamChoice(models.Model):
    question = models.ForeignKey(ExamQuestion, on_delete=models.CASCADE, related_name='choices')
    text = models.CharField('Вариант (ru)', max_length=500)
    text_en = models.CharField('Choice (en)', max_length=500, blank=True, default='')
    is_correct = models.BooleanField('Правильный', default=False)

    class Meta:
        verbose_name = 'Вариант ответа'
        verbose_name_plural = 'Варианты ответов'

    def __str__(self):
        return self.text[:50]


class ExamAttempt(models.Model):
    class Status(models.TextChoices):
        IN_PROGRESS = 'in_progress', 'В процессе'
        SUBMITTED = 'submitted', 'Отправлен'
        PASSED = 'passed', 'Пройден'
        FAILED = 'failed', 'Не пройден'

    exam = models.ForeignKey(CourseExam, on_delete=models.CASCADE, related_name='attempts')
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='exam_attempts')
    status = models.CharField('Статус', max_length=20, choices=Status.choices, default=Status.IN_PROGRESS)
    score_percent = models.PositiveIntegerField('Результат (%)', default=0)
    max_questions = models.PositiveIntegerField('Макс. вопросов', default=10)
    correct_answers = models.PositiveIntegerField('Правильных ответов', default=0)
    started_at = models.DateTimeField('Начат', auto_now_add=True)
    submitted_at = models.DateTimeField('Отправлен', null=True, blank=True)

    class Meta:
        verbose_name = 'Попытка теста'
        verbose_name_plural = 'Попытки теста'
        ordering = ['-started_at']

    def __str__(self):
        return f'{self.user.username} {self.exam.course.title} ({self.status})'

    @property
    def is_submitted(self) -> bool:
        return self.status in (self.Status.SUBMITTED, self.Status.PASSED, self.Status.FAILED)


class ExamAnswer(models.Model):
    attempt = models.ForeignKey(ExamAttempt, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(ExamQuestion, on_delete=models.CASCADE, related_name='answers')
    selected_choice = models.ForeignKey(ExamChoice, on_delete=models.SET_NULL, null=True, blank=True)
    is_correct = models.BooleanField('Правильно', default=False)

    class Meta:
        verbose_name = 'Ответ на вопрос'
        verbose_name_plural = 'Ответы на вопросы'
        unique_together = [['attempt', 'question']]

    def __str__(self):
        return f'Answer attempt={self.attempt_id} q={self.question_id}'


class CourseCertificate(models.Model):
    """Сертификат, выданный пользователю по итогам теста."""
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='course_certificates')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='certificates')
    issued_at = models.DateTimeField('Выдан', default=timezone.now)
    certificate_number = models.CharField('Номер сертификата', max_length=64, unique=True)

    class Meta:
        verbose_name = 'Сертификат'
        verbose_name_plural = 'Сертификаты'
        unique_together = [['user', 'course']]
        ordering = ['-issued_at']

    def __str__(self):
        return f'CERT {self.certificate_number} — {self.user.username} — {self.course.title}'


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
    content_en = models.TextField('Text (EN, HTML)', blank=True, default='')
    created_at = models.DateTimeField('Создано', auto_now_add=True)

    class Meta:
        verbose_name = 'Новость'
        verbose_name_plural = 'Новости'
        ordering = ['-published_at']

    def __str__(self):
        return self.content[:50] + '…' if len(self.content) > 50 else self.content
