from django.contrib import admin
from .models import Course, NewsItem, Module, Lesson, Enrollment, Comment


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
