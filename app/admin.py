from django.contrib import admin
from .models import (
    Course,
    NewsItem,
    Module,
    Lesson,
    Enrollment,
    Comment,
    CourseExam,
    ExamQuestion,
    ExamChoice,
    ExamAttempt,
    ExamAnswer,
    CourseCertificate,
)


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'level', 'price', 'created_at', 'updated_at')
    list_filter = ('level',)
    search_fields = ('title', 'description')
    ordering = ('-created_at',)


class LessonInline(admin.StackedInline):
    model = Lesson
    extra = 0
    ordering = ('order',)


@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'order')
    list_filter = ('course',)
    inlines = (LessonInline,)
    ordering = ('course', 'order')


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'module', 'order', 'content_type', 'is_free')
    list_filter = ('content_type', 'is_free', 'module__course')
    ordering = ('module', 'order')


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('user', 'course', 'source', 'enrolled_at')
    list_filter = ('source',)
    search_fields = ('user__username', 'course__title')
    ordering = ('-enrolled_at',)


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'lesson', 'text_preview', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('text', 'user__username', 'lesson__title')
    ordering = ('-created_at',)
    date_hierarchy = 'created_at'

    def text_preview(self, obj):
        return (obj.text[:60] + '…') if len(obj.text) > 60 else obj.text
    text_preview.short_description = 'Текст'


@admin.register(NewsItem)
class NewsItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'published_at', 'content_preview', 'created_at')
    list_filter = ()
    search_fields = ('content',)
    ordering = ('-published_at',)
    date_hierarchy = 'published_at'

    def content_preview(self, obj):
        return (obj.content[:60] + '…') if len(obj.content) > 60 else obj.content
    content_preview.short_description = 'Текст'


class ExamChoiceInline(admin.TabularInline):
    model = ExamChoice
    extra = 0


class ExamQuestionInline(admin.StackedInline):
    model = ExamQuestion
    extra = 0
    ordering = ('order', 'id')
    show_change_link = True


@admin.register(CourseExam)
class CourseExamAdmin(admin.ModelAdmin):
    list_display = ('course', 'is_active', 'pass_percent', 'questions_count', 'updated_at')
    list_filter = ('is_active', 'pass_percent')
    search_fields = ('course__title',)
    inlines = (ExamQuestionInline,)


@admin.register(ExamQuestion)
class ExamQuestionAdmin(admin.ModelAdmin):
    list_display = ('id', 'exam', 'order', 'text_preview')
    list_filter = ('exam',)
    search_fields = ('text', 'exam__course__title')
    ordering = ('exam', 'order', 'id')
    inlines = (ExamChoiceInline,)

    def text_preview(self, obj):
        return (obj.text[:80] + '…') if len(obj.text) > 80 else obj.text
    text_preview.short_description = 'Вопрос'


@admin.register(ExamChoice)
class ExamChoiceAdmin(admin.ModelAdmin):
    list_display = ('id', 'question', 'text_preview', 'is_correct')
    list_filter = ('is_correct', 'question__exam')
    search_fields = ('text', 'question__text')

    def text_preview(self, obj):
        return (obj.text[:80] + '…') if len(obj.text) > 80 else obj.text
    text_preview.short_description = 'Вариант'


@admin.register(ExamAttempt)
class ExamAttemptAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'course', 'status', 'score_percent', 'started_at', 'submitted_at')
    list_filter = ('status', 'exam__course')
    search_fields = ('user__username', 'exam__course__title')
    ordering = ('-started_at',)

    def course(self, obj):
        return obj.exam.course
    course.short_description = 'Курс'


@admin.register(ExamAnswer)
class ExamAnswerAdmin(admin.ModelAdmin):
    list_display = ('id', 'attempt', 'question', 'selected_choice', 'is_correct')
    list_filter = ('is_correct', 'question__exam')
    search_fields = ('question__text', 'attempt__user__username')


@admin.register(CourseCertificate)
class CourseCertificateAdmin(admin.ModelAdmin):
    list_display = ('certificate_number', 'user', 'course', 'issued_at')
    list_filter = ('course', 'issued_at')
    search_fields = ('certificate_number', 'user__username', 'course__title')
    ordering = ('-issued_at',)
